import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { MangaReader, type MangaStory } from "./manga-reader";

export const metadata: Metadata = {
  title: "Web Manga Viewer | Kyle Vasulka",
  description:
    "A demo manga reader that loads local story folders and supports chapter and page navigation.",
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

function getMangaLibrary(): MangaStory[] {
  if (!existsSync(mangaDirectory)) {
    return [];
  }

  return readdirSync(mangaDirectory)
    .filter((storyName) => statSync(join(mangaDirectory, storyName)).isDirectory())
    .sort(naturalCompare)
    .map((storyName) => {
      const storyDirectory = join(mangaDirectory, storyName);
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
        chapters,
      };
    })
    .filter((story) => story.chapters.length > 0);
}

export default function MangaPage() {
  return <MangaReader library={getMangaLibrary()} />;
}
