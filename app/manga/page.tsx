import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { MangaReader, type MangaStory } from "./manga-reader";

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

const mangaDirectory = join(process.cwd(), "public", "Manga");
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

function naturalCompare(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function encodePublicPath(parts: string[]) {
  return `/${parts.map((part) => encodeURIComponent(part)).join("/")}`;
}

function isImageFile(fileName: string) {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  return imageExtensions.has(extension);
}

function getOptionalText(filePath: string) {
  if (!existsSync(filePath)) {
    return "";
  }

  return readFileSync(filePath, "utf8").trim();
}

function getMangaLibrary(): MangaStory[] {
  if (!existsSync(mangaDirectory)) {
    return [];
  }

  return readdirSync(mangaDirectory)
    .filter((storyName) => statSync(join(mangaDirectory, storyName)).isDirectory())
    .sort(naturalCompare)
    .map((storyName) => {
      const storyDirectory = join(mangaDirectory, storyName);
      const thumbnailPath = join(storyDirectory, "thumbnail.png");
      const chapters = readdirSync(storyDirectory)
        .filter((chapterName) =>
          statSync(join(storyDirectory, chapterName)).isDirectory(),
        )
        .sort(naturalCompare)
        .map((chapterName) => {
          const chapterDirectory = join(storyDirectory, chapterName);
          const pages = readdirSync(chapterDirectory)
            .filter(isImageFile)
            .sort(naturalCompare)
            .map((pageName) => ({
              name: pageName,
              src: encodePublicPath(["Manga", storyName, chapterName, pageName]),
            }));

          return {
            name: chapterName,
            pages,
          };
        })
        .filter((chapter) => chapter.pages.length > 0);

      return {
        name: storyName,
        description: getOptionalText(join(storyDirectory, "description.md")),
        thumbnail: existsSync(thumbnailPath)
          ? encodePublicPath(["Manga", storyName, "thumbnail.png"])
          : chapters[0]?.pages[0]?.src,
        chapters,
      };
    })
    .filter((story) => story.chapters.length > 0);
}

type MangaPageProps = {
  searchParams?: Promise<{
    page?: string;
    story?: string;
  }>;
};

export default async function MangaPage({ searchParams }: MangaPageProps) {
  const params = await searchParams;
  const initialPageIndex = Math.max(Number(params?.page ?? 1) - 1, 0);

  return (
    <MangaReader
      initialPageIndex={initialPageIndex}
      initialStoryName={params?.story}
      library={getMangaLibrary()}
    />
  );
}
