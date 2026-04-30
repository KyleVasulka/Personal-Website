import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { HistoryParticleField } from "@/components/history-particle-field";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getProjectBySlug, getRelatedProjects, projects } from "@/lib/projects";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const links = [
  { label: "GitHub", href: "https://github.com/KyleVasulka", icon: GitHubIcon },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/kyle-vasulka/",
    icon: LinkedInIcon,
  },
  { label: "Email", href: "mailto:Kylejvasulka@gmail.com", icon: Mail },
];

const mangaExplainerVideo = "/Manga/manga-generator-explainer.mp4";
const mangaExplainerPoster = "/Manga/RebornAgain1/thumbnail.png";
const mangaWorkflowDiagram = "/Manga/manga-creation-workflow.png";
const rebornAgainCarouselPages = [
  "/Manga/RebornAgain1/Chapter%201/chapter_1_page_01.png",
  "/Manga/RebornAgain1/Chapter%201/chapter_1_page_02.png",
  "/Manga/RebornAgain1/Chapter%201/chapter_1_page_03.png",
  "/Manga/RebornAgain1/Chapter%201/chapter_1_page_04.png",
  "/Manga/RebornAgain1/Chapter%201/chapter_1_page_05.png",
  "/Manga/RebornAgain1/Chapter%201/chapter_1_page_06.png",
];

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project not found | Kyle Vasulka",
    };
  }

  return {
    title: `${project.name} | Kyle Vasulka`,
    description: project.description,
  };
}

function getProjectWriteup(project: NonNullable<ReturnType<typeof getProjectBySlug>>) {
  if (project.slug === "manga-generator-and-viewer") {
    return [
      "I wanted to see how far I could push an agent toward making a manga end-to-end: not just generating a cool image, but building the story scaffolding around it first.",
      "The generator side is the planning brain. It creates a project folder, picks a premise, defines the worldbuilding, plot, characters, and change log, then keeps iterating until there is enough structure to break chapters into scene beats, dialogue passes, page plans, and image prompts.",
      "The viewer side is the practical delivery layer. Once pages exist, I can drop a manga folder into public/Manga and the site turns it into a browsable, mobile-friendly reader with progress tracking, page restoration, and custom zoom behavior.",
    ];
  }

  const categoryContext = {
    "Studio and AI products":
      "This sits in the studio/product side of the portfolio: practical AI systems, interfaces, and tools aimed at turning rough ideas into usable workflows.",
    "AI media, games, and developer tools":
      "This belongs to the fast-experiment track: media systems, game prototypes, developer tools, and playful interfaces built to test what newer AI and creative tooling can unlock.",
    "AI orchestration and research systems":
      "This project explored orchestration: how smaller AI systems, workflows, or agents can be arranged to solve tasks with more structure than a single prompt.",
    "Hardware, AR, robotics, and early work":
      "This comes from the physical-computing side of the work: hardware, robotics, AR, and embodied interfaces where software has to meet messy real-world constraints.",
  }[project.sectionPeriod];

  return [
    project.description,
    categoryContext,
    "The project is part of a broader pattern in Kyle's work: build the smallest useful version, learn from the behavior of the system, then use that prototype to decide whether the idea deserves more time, polish, or a totally different direction.",
  ];
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = getRelatedProjects(project);
  const writeup = getProjectWriteup(project);
  const hasMangaExplainer = project.slug === "manga-generator-and-viewer";
  const mangaGeneratorDetails = [
    "The generator is an agent-driven workflow for creating a manga or light-novel project from a premise. It starts by creating a story folder, generating and selecting a core idea, then defining the story terms the agent will preserve as it works.",
    "The agent scaffolds an organized project with worldbuilding, plot, character, and changes folders. Worldbuilding captures setting, magic, history, factions, geography, religion, and lore; plot tracks arc outlines, big-P and little-p plot, promises/progress/payoff, and the series timeline; characters hold the protagonist, supporting cast, antagonists, and relationships.",
    "After the foundation is in place, the agent iterates, reviews for consistency, plans the first three chapters, breaks each chapter into scene beats, dialogue passes, page breakdowns, panel scripts, and storyboards, then renders colored Chapter 1 manga pages while logging prompts and changes.",
  ];
  const mangaViewerDetails = [
    "The viewer is the web app for reading the generated manga. Finished manga assets are placed in the app's public folder, with each story stored under public/Manga as a folder containing a thumbnail, description, chapter folders, and page images.",
    "When the manga viewer loads, it scans those public story folders on the server, builds a library from the local files, and serves the selected story through the Next.js route at /manga. The reader supports mobile reading, progress URLs, session progress, page restoration, and custom zoom/pan behavior.",
  ];

  return (
    <main className={`site-shell project-page${hasMangaExplainer ? " manga-project-page" : ""}`}>
      <HistoryParticleField />
      <nav className="nav project-nav" aria-label="Primary navigation">
        <Link className="brand-mark" href="/" aria-label="Kyle Vasulka home">
          KV
        </Link>
        <div className="nav-links">
          <Link href="/#work">Work</Link>
          <Link href="/#about">About</Link>
          <Link href="/#contact">Contact</Link>
          <ThemeToggle />
        </div>
      </nav>

      {hasMangaExplainer && (
        <header className="project-detail-header manga-project-hero">
          <div className="manga-project-hero-content">
            <Link className="project-back-link" href="/#work">
              <ArrowLeft aria-hidden="true" />
              Project history
            </Link>
            <p className="eyebrow">{project.sectionPeriod}</p>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
            <div className="project-detail-tags" aria-label="Project tags">
              <span className="timeline-pill">{project.timeline}</span>
              <span className="demo-pill" data-has-demo={project.hasDemo}>
                {project.hasDemo ? "Demo" : "No demo listed"}
              </span>
              {project.useCases.map((tag) => (
                <span className="project-tag" data-tag-kind="use-case" key={tag}>
                  {tag}
                </span>
              ))}
              {project.techStack.map((tag) => (
                <span className="project-tag" data-tag-kind="tech" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>
      )}

      <article className={`project-detail${hasMangaExplainer ? " manga-project-detail" : ""}`}>
        {!hasMangaExplainer && (
          <header className="project-detail-header">
            <Link className="project-back-link" href="/#work">
              <ArrowLeft aria-hidden="true" />
              Project history
            </Link>
            <p className="eyebrow">{project.sectionPeriod}</p>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
            <div className="project-detail-tags" aria-label="Project tags">
              <span className="timeline-pill">{project.timeline}</span>
              <span className="demo-pill" data-has-demo={project.hasDemo}>
                {project.hasDemo ? "Demo" : "No demo listed"}
              </span>
              {project.useCases.map((tag) => (
                <span className="project-tag" data-tag-kind="use-case" key={tag}>
                  {tag}
                </span>
              ))}
              {project.techStack.map((tag) => (
                <span className="project-tag" data-tag-kind="tech" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </header>
        )}

        <section className="project-writeup" aria-label={`${project.name} writeup`}>
          <div>
            <p className="eyebrow">{hasMangaExplainer ? "The Project" : "Writeup"}</p>
            <h2>What this project explored</h2>
          </div>
          <div className="project-writeup-body">
            {writeup.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        {hasMangaExplainer && (
          <>
            <section
              className="project-media-panel project-media-panel-stacked"
              aria-label="Manga viewer demo"
            >
              <div>
                <p className="eyebrow">Manga Viewer</p>
                <h2>Web manga reader app</h2>
                <div className="project-writeup-body">
                  {mangaViewerDetails.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <Link
                className="manga-page-carousel"
                aria-label="RebornAgain1 manga page carousel"
                href="/manga"
              >
                <div className="manga-page-carousel-track">
                  {[...rebornAgainCarouselPages, ...rebornAgainCarouselPages].map(
                    (src, index) => (
                      <Image
                        alt=""
                        aria-hidden="true"
                        height={1536}
                        key={`${src}-${index}`}
                        src={src}
                        width={1024}
                      />
                    ),
                  )}
                </div>
              </Link>
            </section>

            <section
              className="project-media-panel project-media-panel-stacked"
              aria-label="Manga generator workflow"
            >
              <div>
                <p className="eyebrow">Manga Generator</p>
                <h2>Agent-led story and page pipeline</h2>
                <div className="project-writeup-body">
                  {mangaGeneratorDetails.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <video
                aria-label="Manga generator explainer"
                autoPlay
                loop
                muted
                playsInline
                poster={mangaExplainerPoster}
                preload="auto"
              >
                <source src={mangaExplainerVideo} type="video/mp4" />
              </video>
              <Image
                alt="Diagram of the manga and light novel creation workflow"
                height={1800}
                src={mangaWorkflowDiagram}
                width={1200}
              />
            </section>
          </>
        )}

        {(project.href || project.secondaryHref) && (
          <section className="project-links-panel" aria-label="Project links">
            <p className="eyebrow">Links</p>
            <div className="history-links">
              {project.href && (
                <a href={project.href}>
                  View project
                  <ArrowUpRight aria-hidden="true" />
                </a>
              )}
              {project.secondaryHref && (
                <a href={project.secondaryHref}>
                  {project.secondaryLabel}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              )}
            </div>
          </section>
        )}

        {relatedProjects.length > 0 && (
          <section className="related-projects" aria-label="Related projects">
            <p className="eyebrow">Related</p>
            <div className="history-grid">
              {relatedProjects.map((relatedProject) => (
                <article className="history-card" key={relatedProject.slug}>
                  <div>
                    <h4>
                      <Link
                        className="history-card-detail-link"
                        href={`/projects/${relatedProject.slug}`}
                      >
                        {relatedProject.name}
                      </Link>
                    </h4>
                    <p>{relatedProject.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>

      <footer className="footer" id="contact">
        <p>Let&apos;s connect.</p>
        <div className="footer-links">
          {links.map(({ href, icon: Icon, label }) => (
            <Button asChild key={label} variant="ghost" size="sm">
              <a href={href}>
                <Icon aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">{label}</span>
              </a>
            </Button>
          ))}
        </div>
      </footer>
    </main>
  );
}
