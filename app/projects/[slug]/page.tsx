import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
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

  return (
    <main className="site-shell project-page">
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

      <article className="project-detail">
        <Link className="project-back-link" href="/#work">
          <ArrowLeft aria-hidden="true" />
          Project history
        </Link>

        <header className="project-detail-header">
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

        <section className="project-writeup" aria-label={`${project.name} writeup`}>
          <div>
            <p className="eyebrow">Writeup</p>
            <h2>What this project explored</h2>
          </div>
          <div className="project-writeup-body">
            {writeup.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

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
