// Keep unlisted paths on the existing origin.
// Add a section here only when its content is ready and its Worker Route is intended.
export const managedSections = ["basket", "rekomendacje", "seeyoulater", "ofe", "obszary", "kontakt", "dozobaczenia"];
const canonicalSections = new Set(["basket", "obszary", "kontakt"]);
const apexHost = "lukaszszukalski.pl";
const wwwHost = `www.${apexHost}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const section = managedSections.find(
      (name) => url.pathname === `/${name}` || url.pathname.startsWith(`/${name}/`),
    );

    const isHomepage = url.pathname === "/" || url.pathname === "/index.html";
    const isIndexable = isHomepage || canonicalSections.has(section);
    const usesCanonicalUrl = isIndexable || section === "dozobaczenia";

    // Workers Routes send this subrequest to the existing origin, without recursion.
    if ((!isHomepage && !section) || (url.hostname === wwwHost && !usesCanonicalUrl)) {
      return fetch(request);
    }

    const commonHeaders = {
      "X-Robots-Tag": isIndexable ? "index, follow" : "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": "no-store",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { ...commonHeaders, Allow: "GET, HEAD" },
      });
    }

    // Preserve asset paths and campaign query strings when normalizing public URLs.
    const canonicalUrl = new URL(url);
    if (
      usesCanonicalUrl &&
      (url.hostname === apexHost || url.hostname === wwwHost)
    ) {
      canonicalUrl.protocol = "https:";
      canonicalUrl.hostname = apexHost;
      canonicalUrl.port = "";
    }
    if (isHomepage) {
      canonicalUrl.pathname = "/";
    } else if (url.pathname === `/${section}` || url.pathname === `/${section}/index.html`) {
      canonicalUrl.pathname = `/${section}/`;
    }
    if (canonicalUrl.toString() !== url.toString()) {
      return new Response(null, {
        status: 308,
        headers: { ...commonHeaders, Location: canonicalUrl.toString() },
      });
    }

    const asset = await env.ASSETS.fetch(request);
    const headers = new Headers(asset.headers);
    for (const [name, value] of Object.entries(commonHeaders)) headers.set(name, value);
    return new Response(request.method === "HEAD" ? null : asset.body, {
      status: asset.status,
      statusText: asset.statusText,
      headers,
    });
  },
};
