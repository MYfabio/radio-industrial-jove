import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/siteConfig";

const STATIC_PATHS = ["/", "/estudi", "/mur", "/privacitat", "/termes"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls = STATIC_PATHS.map(
          (path) => `  <url><loc>${SITE_URL}${path}</loc></url>`,
        ).join("\n");
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
