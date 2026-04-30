import type { Metadata } from "next";
import { MangaReader, type MangaStory } from "./manga-reader";
import mangaLibrary from "./manga-library.json";

export const metadata: Metadata = {
  title: "AI Manga Library | Kyle Vasulka",
  description:
    "Browse original AI-generated manga stories in a smooth web reader built for scrolling, zooming, and mobile reading.",
  openGraph: {
    title: "AI Manga Library | Kyle Vasulka",
    description:
      "Browse original AI-generated manga stories in a smooth web reader built for scrolling, zooming, and mobile reading.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Manga Library | Kyle Vasulka",
    description:
      "Browse original AI-generated manga stories in a smooth web reader built for scrolling, zooming, and mobile reading.",
  },
};

export const dynamic = "force-static";

export default function MangaPage() {
  return <MangaReader library={mangaLibrary as MangaStory[]} />;
}
