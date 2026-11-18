// The existing homepage, meeting page and all other origin paths remain on MSERWIS.
// Add a section here only when its content is ready and its Worker Route is intended.
export const managedSections = ["basket", "rekomendacje", "seeyoulater", "ofe"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const section = managedSections.find(
      (name) => url.pathname === `/${name}` || url.pathname.startsWith(`/${name}/`),
    );

    // Workers Routes send this subrequest to the existing origin, without recursion.
    if (!section) return fetch(request);

    const commonHeaders = {
      "X-Robots-Tag": section === "basket" ? "index, follow" : "noindex, nofollow",
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

    if (url.pathname === `/${section}` || url.pathname === `/${section}/index.html`) {
      url.pathname = `/${section}/`;
      return new Response(null, {
        status: 308,
        headers: { ...commonHeaders, Location: url.toString() },
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
