import { bookingConsentText, consentText, offerText, privacyText } from "./texts";

export type LegalDocument = {
  path: string;
  title: string;
  // The short name in the footer and the list of documents.
  short: string;
  lead?: string;
  description: string;
  // «Редакция от …» / «Дата публикации: …»; null hides the line.
  dated: { label: string; date: string | null };
  text: string[];
};

export const offer: LegalDocument = {
  path: "/offer",
  title: "Публичная оферта",
  short: "Публичная оферта",
  lead: "на оказание репетиторских услуг",
  description: "Публичная оферта ИП Андрианова Ильи Алексеевича на оказание репетиторских услуг по информатике: форматы, стоимость, переносы, возврат.",
  dated: { label: "Редакция от", date: "20 ноября 2026 г." },
  text: offerText,
};

export const privacy: LegalDocument = {
  path: "/privacy",
  title: "Политика обработки персональных данных",
  short: "Политика обработки персональных данных",
  description: "Как ITPY обрабатывает и защищает персональные данные посетителей сайта, учеников и их законных представителей.",
  dated: { label: "Дата публикации:", date: "20 ноября 2026 г." },
  text: privacyText,
};

export const consent: LegalDocument = {
  path: "/consent",
  title: "Согласие на обработку персональных данных",
  short: "Согласие на обработку персональных данных",
  description: "Согласие на обработку персональных данных учеников и их законных представителей для оказания репетиторских услуг.",
  dated: { label: "", date: null },
  text: consentText,
};

// Linked from the consent checkbox of the booking form in Planerka.
export const bookingConsent: LegalDocument = {
  path: "/booking-consent",
  title: "Согласие на обработку персональных данных при записи на пробное занятие",
  short: "Согласие при записи на пробное занятие",
  description: "Согласие на обработку персональных данных, которое даётся в форме записи на пробное занятие.",
  dated: { label: "", date: null },
  text: bookingConsentText,
};

export const legalDocuments = [offer, privacy, consent, bookingConsent];
