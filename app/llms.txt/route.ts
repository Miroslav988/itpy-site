import { llmsIndex } from "../llms";
import { siteOrigin } from "../site";

export async function GET() {
  return new Response(llmsIndex(await siteOrigin()), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
