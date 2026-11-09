import type { Metadata } from "next";
import type { Post } from "./blog/posts";
import { faqs, formats, links, teacher } from "./content";
import { courses, stepikUrl } from "./courses/catalog";

type PageMeta = {
  path: string;
  title: string;
  description: string;
  image?: { src: string; width: number; height: number };
  robots?: Metadata["robots"];
  openGraph?: { type: "article"; publishedTime: string };
};

const defaultImage = { src: "/og.png", width: 1200, height: 630 };

// Paths are relative: the root layout sets metadataBase from the site origin.
export function pageMetadata({ path, title, description, image = defaultImage, robots, openGraph }: PageMeta): Metadata {
  return {
    title,
    description,
    robots,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: "ITPY",
      url: path,
      title,
      description,
      images: [{ url: image.src, width: image.width, height: image.height, alt: title }],
      ...openGraph,
    },
    twitter: { card: "summary_large_image", title, description, images: [image.src] },
  };
}

// Only facts shown on the site go here: no ratings, review counts or results it cannot back up.
export function JsonLd({ nodes }: { nodes: object[] }) {
  const data = { "@context": "https://schema.org", "@graph": nodes };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const personRef = (origin: string) => ({ "@id": `${origin}/#person` });

export function personSchema(origin: string) {
  return {
    "@type": "Person",
    ...personRef(origin),
    name: teacher.name,
    url: `${origin}/`,
    image: `${origin}${teacher.portrait.src}`,
    jobTitle: "Преподаватель информатики, подготовка к ЕГЭ",
    knowsAbout: ["ЕГЭ по информатике", "КЕГЭ", "Python", "Информатика"],
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Бакалавриат",
      name: "Информатика и вычислительная техника",
    },
    sameAs: [links.telegramPersonal, links.telegramChannel, links.dzen],
  };
}

export function websiteSchema(origin: string) {
  return {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: "ITPY",
    url: `${origin}/`,
    inLanguage: "ru",
    publisher: personRef(origin),
  };
}

function digits(price: string) {
  return Number(price.replace(/\D/g, ""));
}

export function servicesSchema(origin: string) {
  return formats.map((format) => ({
    "@type": "Service",
    "@id": `${origin}/#${format.id}`,
    name: format.title,
    serviceType: "Подготовка к ЕГЭ по информатике",
    description: format.rows.map((row) => `${row.label}: ${row.value}`).join(" "),
    provider: personRef(origin),
    areaServed: "RU",
    offers: {
      "@type": "Offer",
      url: `${origin}/#${format.id}`,
      description: format.priceNote,
      ...(format.price.startsWith("от")
        ? { priceSpecification: { "@type": "PriceSpecification", minPrice: digits(format.price), priceCurrency: "RUB" } }
        : { price: digits(format.price), priceCurrency: "RUB" }),
    },
  }));
}

export function faqSchema(origin: string) {
  return {
    "@type": "FAQPage",
    "@id": `${origin}/#faq`,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function coursesSchema(origin: string) {
  return {
    "@type": "ItemList",
    "@id": `${origin}/courses#list`,
    name: "Курсы ITPY на Stepik",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.title,
        description: course.description,
        url: stepikUrl(course),
        inLanguage: "ru",
        provider: { "@type": "Organization", name: "ITPY", url: `${origin}/` },
        isAccessibleForFree: course.price === "Бесплатно",
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", instructor: personRef(origin) },
      },
    })),
  };
}

export function breadcrumbSchema(origin: string, trail: Array<[name: string, path: string]>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: `${origin}${path}`,
    })),
  };
}

export function articleSchema(origin: string, post: Post) {
  const url = `${origin}/blog/${post.slug}`;
  return {
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: "ru",
    url,
    mainEntityOfPage: url,
    image: `${origin}${(post.cover ?? defaultImage).src}`,
    author: personRef(origin),
    publisher: personRef(origin),
    about: post.task ? `Задание ${post.task} ЕГЭ по информатике` : "ЕГЭ по информатике",
    educationalLevel: post.meta?.level,
    isBasedOn: post.source,
  };
}
