import { readdirSync } from "node:fs";
import { join } from "node:path";
import { ArrowDown, ArrowUpRight, Mail } from "lucide-react";
import Image from "next/image";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { HistoryParticleField } from "@/components/history-particle-field";
import { KineticBackground } from "@/components/kinetic-background";
import {
  HarmonicPianoShowcase,
  MangaGeneratorShowcase,
  ProjectModelScene,
} from "@/components/project-visuals";
import { ProjectExplorer } from "@/components/project-explorer";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { historySections } from "@/lib/projects";

export const dynamic = "force-dynamic";

const heroImagesDirectory = join(process.cwd(), "public", "heroimages");

function getRandomHeroImage() {
  try {
    const heroImages = readdirSync(heroImagesDirectory)
      .filter((fileName) => fileName.toLowerCase().endsWith(".png"))
      .sort();

    if (heroImages.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * heroImages.length);
    return `/heroimages/${encodeURIComponent(heroImages[randomIndex])}`;
  } catch {
    return null;
  }
}

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
  const heroImage = getRandomHeroImage();

  return (
    <main className="site-shell">
      <ScrollReveal />
      <section className="hero" aria-labelledby="hero-title">
        <KineticBackground />
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

        <div className="hero-grid" data-reveal>
          <div className="hero-copy">
            <p className="eyebrow">Personal website</p>
            <h1 id="hero-title">Kyle Vasulka</h1>
            <p className="intro">
              AI product builder, creative technologist, and cofounder of
              TimeSurgeLabs.
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

          <div className="hero-visual" aria-label="Project illustration" data-reveal>
            {heroImage && (
              <Image
                alt=""
                className="hero-portrait"
                height={760}
                priority
                sizes="(max-width: 820px) 96vw, 34rem"
                src={heroImage}
                width={700}
              />
            )}
            <div className="hero-aura" aria-hidden="true" />
            <div className="profile-panel" aria-label="Profile summary">
              <p className="eyebrow">Current focus</p>
              <p>
                Building AI-accelerated apps, developer tools, media systems, and
                ambitious prototypes across software, hardware, AR, and robotics.
              </p>
            </div>
          </div>
        </div>

        <a className="scroll-cue" href="#work" aria-label="Scroll to project history">
          <ArrowDown aria-hidden="true" />
        </a>
      </section>

      <section
        className="section history"
        id="work"
        aria-labelledby="work-title"
      >
        <HistoryParticleField />
        <div className="section-header" data-reveal>
          <p className="eyebrow">Project history</p>
          <h2 id="work-title">A long trail of shipped experiments.</h2>
          <p>
            From AI apps and game prototypes to AR, robotics, drone systems,
            and hardware test rigs.
          </p>
        </div>
        <MangaGeneratorShowcase />
        <HarmonicPianoShowcase />
        <ProjectModelScene />
        <ProjectExplorer sections={historySections} />
      </section>

      <section
        className="section about"
        id="about"
        aria-labelledby="about-title"
        data-reveal
      >
        <div>
          <p className="eyebrow">About</p>
          <h2 id="about-title">Software, AI, and hardware in one loop.</h2>
        </div>
        <p>
          Kyle builds across the stack: product interfaces, AI systems,
          generative media tools, robotics, AR, embedded hardware, and the odd
          wildly specific prototype that proves an idea can work.
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
