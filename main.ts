import type { CustomEvent } from "./src/types/event";
import { retrieve } from "./src/queryDocuments"
import { addDocuments } from "./src/addDocuments";

export async function router(event: CustomEvent) {
  // Handle CORS preflight
  if (event.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  if (event.request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const url = new URL(event.request.url);
  const path = url.pathname;

  try {
    const body = await event.request.json();

    switch (path) {
      case "/query":
        const result = await retrieve(body);
        return new Response(JSON.stringify({ deliveredDocuments: result }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });

      case "/add_documents":
        await addDocuments(body)
        return new Response(JSON.stringify({ message: "Document addition not implemented yet" }), {
          status: 501,
          headers: { "Content-Type": "application/json" }
        });

      default:
        return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal Error: ",e }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}




