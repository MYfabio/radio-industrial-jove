import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cover/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = Number(params.id);
        if (!Number.isFinite(id)) return new Response("Not found", { status: 404 });
        const { getSql, getCover } = await import("@/lib/podcasts.server");
        const sql = getSql();
        try {
          const found = await getCover(sql, id);
          if (!found) return new Response("Not found", { status: 404 });
          return new Response(new Uint8Array(found.data), {
            headers: {
              "Content-Type": found.mime,
              "Cache-Control": "public, max-age=31536000, immutable",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } finally {
          await sql.end();
        }
      },
    },
  },
});
