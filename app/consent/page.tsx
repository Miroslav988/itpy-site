import LegalPage, { legalMetadata } from "../legal/LegalPage";
import { consent } from "../legal/documents";

export const metadata = legalMetadata(consent);

export default function Page() {
  return <LegalPage document={consent} />;
}
