import LegalPage, { legalMetadata } from "../legal/LegalPage";
import { bookingConsent } from "../legal/documents";

export const metadata = legalMetadata(bookingConsent);

export default function Page() {
  return <LegalPage document={bookingConsent} />;
}
