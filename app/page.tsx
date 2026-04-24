import { ArrowUpRight, Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const projects = [
  {
    title: "Product Engineering",
    description:
      "Full-stack product work across data-driven interfaces, backend workflows, and deployment pipelines.",
  },
  {
    title: "Automation",
    description:
      "Practical tools that remove repetitive work and make operational processes easier to trust.",
  },
  {
    title: "Creative Systems",
    description:
      "Interactive web experiences with a focus on clean structure, fast iteration, and maintainable code.",
  },
];

const links = [
  { label: "GitHub", href: "https://github.com/KyleVasulka", icon: GitHubIcon },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/kyle-vasulka/",
    icon: LinkedInIcon,
  },
  { label: "Email", href: "mailto:Kylejvasulka@gmail.com", icon: Mail },
];

export default function Home() {
  return (
    <main className="site-shell">
      <section className="hero" aria-labelledby="hero-title">
        <nav className="nav" aria-label="Primary navigation">
          <a
            className="brand-mark"
            href="#top"
            aria-label="Kyle Vasulka home"
          >
            KV
          </a>
          <div className="nav-links">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <ThemeToggle />
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Personal website</p>
            <h1 id="hero-title">Kyle Vasulka</h1>
            <p className="intro">
              A modern portfolio starter for showcasing projects, experience,
              and ways to get in touch.
            </p>
            <div className="actions">
              <Button asChild>
                <a href="#work">
                  View work
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="#contact">Get in touch</a>
              </Button>
            </div>
          </div>

          <div className="profile-panel" aria-label="Profile summary">
            <p className="eyebrow">Current focus</p>
            <p>
              Replace this copy with the specific role, projects, or themes you
              want visitors to understand first.
            </p>
          </div>
        </div>
      </section>

      <section
        className="section"
        id="work"
        aria-labelledby="work-title"
      >
        <div className="section-header">
          <p className="eyebrow">Selected work</p>
          <h2 id="work-title">Built for clarity and momentum.</h2>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.title}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section about"
        id="about"
        aria-labelledby="about-title"
      >
        <div>
          <p className="eyebrow">About</p>
          <h2 id="about-title">A clean base for the next version.</h2>
        </div>
        <p>
          This site is intentionally small: modern Next.js, TypeScript, global
          Tailwind styles, and shadcn-style primitives. Add content as the
          portfolio becomes more specific.
        </p>
      </section>

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
