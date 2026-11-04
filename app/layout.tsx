import type { Metadata, Viewport } from "next";
import { Caveat, Onest } from "next/font/google";
import { BookingProvider } from "./booking/Booking";
import { siteOrigin } from "./site";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
});

const title = "ITPY — информатика, которую понимаешь";
const description =
  "Подготовка к ЕГЭ по информатике с Ильёй Андриановым: парные занятия и вебинары, понятные объяснения и бесплатное пробное занятие.";

export const viewport: Viewport = {
  themeColor: "#12141a",
};

export async function generateMetadata(): Promise<Metadata> {
  const origin = await siteOrigin();
  const socialImage = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title,
    description,
    icons: {
      icon: "/favicon.svg",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: "ITPY",
      title,
      description,
      images: [{ url: socialImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${onest.variable} ${caveat.variable}`}>
        <BookingProvider>{children}</BookingProvider>
      </body>
    </html>
  );
}
