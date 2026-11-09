import { llmsFull } from "../llms";
import { siteOrigin } from "../site";

export async function GET() {
  return new Response(llmsFull(await siteOrigin()), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
