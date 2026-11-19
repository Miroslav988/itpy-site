import LegalPage, { legalMetadata } from "../legal/LegalPage";
import { offer } from "../legal/documents";

export const metadata = legalMetadata(offer);

export default function Page() {
  return <LegalPage document={offer} />;
}
