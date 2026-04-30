import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const mangaDirectory = join(rootDirectory, "public", "Manga");
const manifestPath = join(rootDirectory, "app", "manga", "manga-library.json");
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function encodePublicPath(parts) {
  return `/${parts.map((part) => encodeURIComponent(part)).join("/")}`;
}

function isImageFile(fileName) {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  return imageExtensions.has(extension);
}

function getOptionalText(filePath) {
  if (!existsSync(filePath)) {
    return "";
  }

  return readFileSync(filePath, "utf8").trim();
}

function getMangaLibrary() {
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

writeFileSync(manifestPath, `${JSON.stringify(getMangaLibrary(), null, 2)}\n`);
