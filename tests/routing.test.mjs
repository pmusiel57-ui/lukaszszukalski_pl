import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";

const originFetch = globalThis.fetch;
test.after(() => { globalThis.fetch = originFetch; });
globalThis.fetch = async (request) => new Response(`ORIGIN:${new URL(request.url).pathname}`);
const env = {
  ASSETS: { fetch: async (request) => {
    const path = new URL(request.url).pathname;
    const valid = ["/basket/", "/rekomendacje/", "/seeyoulater/", "/ofe/"];
    return new Response(valid.includes(path) ? `ASSET:${path}` : "Not found", {
      status: valid.includes(path) ? 200 : 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } },
};

for (const path of ["/", "/index.html", "/dozobaczenia/", "/rekomendacja/", "/rodo", "/basketball", "/oferta/", "/assets/logo.png"]) {
  test(`preserve origin ${path}`, async () => {
    const response = await worker.fetch(new Request(`https://lukaszszukalski.pl${path}`), env);
    assert.equal(await response.text(), `ORIGIN:${path}`);
    assert.equal(response.headers.get("X-Robots-Tag"), null);
  });
}
for (const name of ["basket", "rekomendacje", "seeyoulater", "ofe"]) {
  test(`serve isolated section ${name}`, async () => {
    const response = await worker.fetch(new Request(`https://lukaszszukalski.pl/${name}/?utm_source=test`), env);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), `ASSET:/${name}/`);
    assert.equal(response.headers.get("X-Robots-Tag"), name === "basket" ? "index, follow" : "noindex, nofollow");
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
