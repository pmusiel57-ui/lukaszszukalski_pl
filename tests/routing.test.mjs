import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";

const originFetch = globalThis.fetch;
test.after(() => { globalThis.fetch = originFetch; });
globalThis.fetch = async (request) => new Response(`ORIGIN:${new URL(request.url).pathname}`);
const env = {
  ASSETS: { fetch: async (request) => {
    const path = new URL(request.url).pathname;
    const valid = ["/", "/portret-glowny.jpg", "/basket/", "/rekomendacje/", "/seeyoulater/", "/ofe/", "/obszary/", "/kontakt/", "/kontakt/ustawienia.js", "/dozobaczenia/", "/dozobaczenia/rodo/", "/dozobaczenia/assets/spotkanie.webp"];
    return new Response(valid.includes(path) ? `ASSET:${path}` : "Not found", {
      status: valid.includes(path) ? 200 : 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } },
};

for (const path of ["/dozobaczenia-test/", "/rekomendacja/", "/rodo", "/basketball", "/oferta/", "/assets/logo.png", "/kontakt-old/", "/obszary-test/"]) {
  test(`preserve origin ${path}`, async () => {
    const response = await worker.fetch(new Request(`https://lukaszszukalski.pl${path}`), env);
    assert.equal(await response.text(), `ORIGIN:${path}`);
    assert.equal(response.headers.get("X-Robots-Tag"), null);
  });
}
for (const name of ["basket", "rekomendacje", "seeyoulater", "ofe", "obszary", "kontakt", "dozobaczenia"]) {
  test(`serve isolated section ${name}`, async () => {
    const response = await worker.fetch(new Request(`https://lukaszszukalski.pl/${name}/?utm_source=test`), env);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), `ASSET:/${name}/`);
    assert.equal(response.headers.get("X-Robots-Tag"), ["basket", "obszary", "kontakt"].includes(name) ? "index, follow" : "noindex, nofollow");
  });
  test(`canonical slash and UTM ${name}`, async () => {
    for (const path of [`/${name}`, `/${name}/index.html`]) {
      const response = await worker.fetch(new Request(`https://lukaszszukalski.pl${path}?utm_source=test&x=1`), env);
      assert.equal(response.status, 308);
      assert.equal(response.headers.get("Location"), `https://lukaszszukalski.pl/${name}/?utm_source=test&x=1`);
    }
  });
}
test("missing section asset remains 404", async () => {
  const response = await worker.fetch(new Request("https://lukaszszukalski.pl/basket/missing.png"), env);
  assert.equal(response.status, 404);
});
test("HEAD has no body", async () => {
  const response = await worker.fetch(new Request("https://lukaszszukalski.pl/ofe/", { method: "HEAD" }), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
});
test("placeholder does not accept form submissions", async () => {
  const response = await worker.fetch(new Request("https://lukaszszukalski.pl/ofe/", { method: "POST", body: "test" }), env);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "GET, HEAD");
});

for (const origin of [
  "http://lukaszszukalski.pl",
  "http://www.lukaszszukalski.pl",
  "https://www.lukaszszukalski.pl",
]) {
  test(`BASKET canonical host and HTTPS: ${origin}`, async () => {
    const query = "?utm_source=zakladka&name=%C5%81ukasz&x=1";
    for (const path of ["/basket", "/basket/", "/basket/index.html"]) {
      const response = await worker.fetch(new Request(`${origin}${path}${query}`), env);
      assert.equal(response.status, 308);
      assert.equal(response.headers.get("Location"), `https://lukaszszukalski.pl/basket/${query}`);
      assert.equal(response.headers.get("Cache-Control"), "no-store");
      assert.equal(await response.text(), "");

      // Following the canonical redirect must serve the page, not redirect again.
      const final = await worker.fetch(new Request(response.headers.get("Location")), env);
      assert.equal(final.status, 200);
      assert.equal(final.headers.get("Location"), null);
      assert.equal(await final.text(), "ASSET:/basket/");
    }
  });

  test(`BASKET asset paths survive host canonicalization: ${origin}`, async () => {
    for (const path of [
      "/basket/basket.css",
      "/basket/assets/lukasz-basket-mobile.webp",
      "/basket/assets/fonts/basket-font-9.woff2",
      "/basket/assets/Lukasz-Szukalski.vcf",
    ]) {
      const query = "?v=2&campaign=BASKET";
      const response = await worker.fetch(new Request(`${origin}${path}${query}`), {
        ASSETS: { fetch: async () => { throw new Error("Asset binding called before canonical redirect"); } },
      });
      assert.equal(response.status, 308);
      const target = `https://lukaszszukalski.pl${path}${query}`;
      assert.equal(response.headers.get("Location"), target);

      let requestedAssetUrl;
      const final = await worker.fetch(new Request(target), {
        ASSETS: { fetch: async (request) => {
          requestedAssetUrl = request.url;
          return new Response("asset bytes", { status: 200 });
        } },
      });
      assert.equal(requestedAssetUrl, target);
      assert.equal(final.status, 200);
      assert.equal(final.headers.get("Location"), null);
      assert.equal(await final.text(), "asset bytes");
    }
  });
}

test("HEAD BASKET on HTTP www redirects without a body", async () => {
  const response = await worker.fetch(new Request("http://www.lukaszszukalski.pl/basket/index.html?ref=book", { method: "HEAD" }), env);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("Location"), "https://lukaszszukalski.pl/basket/?ref=book");
  assert.equal(await response.text(), "");
});

test("canonicalization preserves legacy www paths and unrelated hosts", async () => {
  for (const name of ["ofe", "rekomendacje", "seeyoulater"]) {
    const requestUrl = `http://www.lukaszszukalski.pl/${name}?q=1`;
    const response = await worker.fetch(new Request(requestUrl), env);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), `ORIGIN:/${name}`);
    assert.equal(response.headers.get("Location"), null);
  }
  const unrelated = await worker.fetch(new Request("https://preview.example/basket?ref=test"), env);
  assert.equal(unrelated.status, 308);
  assert.equal(unrelated.headers.get("Location"), "https://preview.example/basket/?ref=test");
});

test("www origin paths and similarly named paths retain origin behavior", async () => {
  for (const path of ["/dozobaczenia-test/", "/rekomendacja/", "/basketball", "/Basket", "/basket-old/", "/assets/logo.png"]) {
    const response = await worker.fetch(new Request(`http://www.lukaszszukalski.pl${path}?ref=old`), env);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), `ORIGIN:${path}`);
    assert.equal(response.headers.get("Location"), null);
  }
});

test("homepage serves campaign URLs and redirects the index alias", async () => {
  const query = "?utm_source=homepage";
  const home = await worker.fetch(new Request(`https://lukaszszukalski.pl/${query}`), env);
  assert.equal(home.status, 200);
  assert.equal(await home.text(), "ASSET:/");
  assert.equal(home.headers.get("X-Robots-Tag"), "index, follow");

  const alias = await worker.fetch(new Request(`https://lukaszszukalski.pl/index.html${query}`), env);
  assert.equal(alias.status, 308);
  assert.equal(alias.headers.get("Location"), `https://lukaszszukalski.pl/${query}`);
});

test("serve contact settings from the same section", async () => {
  const response = await worker.fetch(new Request("https://lukaszszukalski.pl/kontakt/ustawienia.js"), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "ASSET:/kontakt/ustawienia.js");
});

test("homepage, areas and contact share an HTTPS apex URL", async () => {
  const query = "?temat=kredyty&utm_source=www";
  const paths = [
    ["/", "/"],
    ["/index.html", "/"],
    ["/obszary", "/obszary/"],
    ["/kontakt/", "/kontakt/"],
    ["/kontakt/ustawienia.js", "/kontakt/ustawienia.js"],
  ];
  for (const host of ["http://lukaszszukalski.pl", "http://www.lukaszszukalski.pl", "https://www.lukaszszukalski.pl"]) {
    for (const [from, to] of paths) {
      const response = await worker.fetch(new Request(`${host}${from}${query}`), env);
      const target = `https://lukaszszukalski.pl${to}${query}`;
      assert.equal(response.status, 308);
      assert.equal(response.headers.get("Location"), target);
      const final = await worker.fetch(new Request(target), env);
      assert.equal(final.status, 200);
      assert.equal(await final.text(), `ASSET:${to}`);
    }
  }
});

test("meeting page and its linked files serve from HTTPS without www and stay noindex", async () => {
  for (const path of ["/dozobaczenia/", "/dozobaczenia/rodo/", "/dozobaczenia/assets/spotkanie.webp"]) {
    const target = `https://lukaszszukalski.pl${path}?ref=spotkanie`;
    const redirect = await worker.fetch(new Request(`http://www.lukaszszukalski.pl${path}?ref=spotkanie`), env);
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get("Location"), target);

    const response = await worker.fetch(new Request(target), env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
    assert.equal(await response.text(), `ASSET:${path}`);
  }
});

test("serve the homepage portrait at its exact path", async () => {
  const path = "/portret-glowny.jpg";
  const response = await worker.fetch(new Request(`https://lukaszszukalski.pl${path}`), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), `ASSET:${path}`);
  const other = await worker.fetch(new Request(`https://lukaszszukalski.pl${path}/other`), env);
  assert.equal(await other.text(), `ORIGIN:${path}/other`);
});
