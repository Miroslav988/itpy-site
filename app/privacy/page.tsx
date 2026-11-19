import LegalPage, { legalMetadata } from "../legal/LegalPage";
import { privacy } from "../legal/documents";

export const metadata = legalMetadata(privacy);

export default function Page() {
  return <LegalPage document={privacy} />;
}
