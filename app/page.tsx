import { ArrowUpRight, Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const historySections = [
  {
    period: "Studio and AI products",
    title: "TimeSurgeLabs and applied AI systems",
    items: [
      {
        name: "TimeSurgeLabs",
        description:
          "Cofounder of an AI-accelerated software development studio focused on building apps with AI.",
        href: "https://timesurgelabs.com/",
      },
      {
        name: "MemeSmithy",
        description:
          "An app to consume and generate memes using generative AI combined with image manipulation APIs.",
      },
      {
        name: "PromptProxy",
        description:
          "An OpenAI-compatible API for routing requests across many different AI models.",
      },
      {
        name: "MetaPrompter",
        description:
          "A web app that helps create strong AI prompts for arbitrary tasks.",
      },
      {
        name: "MetaMemePrompter",
        description:
          "Given a meme, identifies why it is funny and creates a reusable prompt for generating memes in that style.",
      },
      {
        name: "VideoQ",
        description:
          "An API for asking questions over video using Gemini's ability to understand video content.",
      },
      {
        name: "blogeval",
        description:
          "An AI eval that grades how well AI systems generate blog posts.",
      },
      {
        name: "LeadGen",
        description:
          "Uses AI and web scraping to find leads from a specific want or need prompt.",
      },
      {
        name: "BirdBrain",
        description: "Uses AI to generate viral tweets.",
      },
      {
        name: "SearchBase",
        description:
          "A local AI RAG system for companies to query internal documentation.",
      },
      {
        name: "Summarizer",
        description: "A Chrome extension for summarizing YouTube videos.",
      },
      {
        name: "InfluencerGPT",
        description:
          "Fine-tuned LLMs on influencer transcripts, creating influencers you can talk to.",
      },
    ],
  },
  {
    period: "AI media, games, and developer tools",
    title: "Fast experiments across sound, video, games, and code",
    items: [
      {
        name: "Harmonic-Piano",
        description:
          "A synthesizer where you select which harmonics individual notes should play, live-adjusting each note's timbre.",
        href: "https://youtu.be/gYpqAZQKDLQ",
        secondaryHref: "https://www.youtube.com/watch?v=rRnOtKlg4jA",
        secondaryLabel: "Inspiration",
      },
      {
        name: "AIPlaysMoonLander",
        description:
          "A reinforcement learning PPO algorithm trained on a MacBook to play MoonLander.",
      },
      {
        name: "CodexGames",
        description:
          "A demonstration of how games can be quickly created and iterated on with OpenAI Codex.",
        href: "https://codex.timesurgelabs.com/",
      },
      {
        name: "Twitch-tools",
        description:
          "A Twitch chat text-to-speech app using Piper TTS, built with Tauri, Vite, Tailwind, shadcn, and Rust.",
        href: "https://github.com/TimeSurgeLabs/twitch-tools",
      },
      {
        name: "AI Gen FPS",
        description:
          "An AI-generated multiplayer FPS video game built with Express and Three.js.",
        href: "https://games.timesurgelabs.com/",
      },
      {
        name: "Tiktokify",
        description: "Generates TikTok videos from a podcast using AI.",
      },
      {
        name: "Shortgen",
        description: "Generates short-form videos using AI.",
      },
      {
        name: "CodeShot",
        description:
          "A code screenshot API that turns submitted code into a polished VS Code-style image.",
      },
      {
        name: "VideoScript LLM",
        description:
          "Fine-tuned Llama, an open source LLM, on YouTube video scripts.",
      },
      {
        name: "Manimator",
        description:
          "An API that creates Manim animations from a text description.",
      },
      {
        name: "FFMPEGGPT",
        description:
          "A GPT-style model trained on FFmpeg commands for generation workflows.",
      },
      {
        name: "DNDSummarizer",
        description:
          "An app that summarizes what happened in the last adventure for a D&D group.",
      },
    ],
  },
  {
    period: "AI orchestration and research systems",
    title: "Experiments in multi-agent workflows",
    items: [
      {
        name: "LLU",
        description:
          "LLM Logic Unit: an experiment in smarter AI systems where one AI creates workflows to complete tasks.",
      },
      {
        name: "CompanyHerd",
        description:
          "Used a web of small LLMs in a corporate ladder structure to complete tasks.",
      },
    ],
  },
  {
    period: "Hardware, AR, robotics, and early work",
    title: "Physical computing, AR systems, and competition projects",
    items: [
      {
        name: "Ivy",
        description:
          "A stepper motor driver designed to fit perfectly on the back of a stepper motor.",
      },
      {
        name: "SoldAR",
        description: "A mixed-reality feedback soldering iron.",
        href: "https://devpost.com/software/soldar",
      },
      {
        name: "Heroes of the Swarm",
        description:
          "Software that makes drones fly in arbitrary 3D shapes provided by a 3D model.",
      },
      {
        name: "Disaster Link",
        description:
          "Drones that drop Wi-Fi pucks for disaster-response scenarios.",
        href: "https://devpost.com/software/disasterlink",
      },
      {
        name: "PathFindAR",
        description: "AR Apple Maps before it was cool.",
        href: "https://devpost.com/software/pathfindar",
      },
      {
        name: "StepByStep",
        description:
          "A shoe that counts your steps and lets you compete with friends.",
      },
      {
        name: "Mobile Mouse",
        description: "An app that turns your smartphone into a mouse.",
      },
      {
        name: "Vitamex AR app",
        description:
          "An AR marketing app that showcases features of a Vitamex blender.",
      },
      {
        name: "AR Knights Tour",
        description:
          "A Microsoft HoloLens app that lets a user perform the Knight's Tour algorithm on a physical chessboard.",
      },
      {
        name: "Visual Music Assistant",
        description:
          "A HoloLens app that teaches piano from a MIDI file, paired with a custom PCB using a microphone and FFT to detect acoustic piano notes.",
      },
      {
        name: "CarID",
        description: "AI that detects a car's color, make, and model.",
      },
      {
        name: "Stepper Motor Driver",
        description:
          "Stepper motor circuit boards and systems for swapping driver ICs and sense resistor values while testing drivers on a torque transducer.",
      },
      {
        name: "Stepper accelerated testing",
        description:
          "A stepper-motor test rig simulating 10,000 movements on injection molded parts for reliability testing.",
      },
      {
        name: "NASA SUITS",
        description:
          "In college, created a spacesuit user interface for astronaut spacewalks using Unity, Node, PHP, and MySQL.",
      },
      {
        name: "VEX Robotics World Champion",
        description:
          "In high school, created a robot that competed at state, national, and world levels.",
      },
      {
        name: "Elden-Ring",
        description: "A phone booth that plays music for a DJ.",
      },
    ],
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

          <div className="profile-panel" aria-label="Profile summary">
            <p className="eyebrow">Current focus</p>
            <p>
              Building AI-accelerated apps, developer tools, media systems, and
              ambitious prototypes across software, hardware, AR, and robotics.
            </p>
          </div>
        </div>
      </section>

      <section
        className="section history"
        id="work"
        aria-labelledby="work-title"
      >
        <div className="section-header">
          <p className="eyebrow">Project history</p>
          <h2 id="work-title">A long trail of shipped experiments.</h2>
          <p>
            From AI apps and game prototypes to AR, robotics, drone systems,
            and hardware test rigs.
          </p>
        </div>
        <div className="history-list">
          {historySections.map((section) => (
            <section className="history-band" key={section.period}>
              <div className="history-band-header">
                <p className="eyebrow">{section.period}</p>
                <h3>{section.title}</h3>
              </div>
              <div className="history-grid">
                {section.items.map((item) => (
                  <article className="history-card" key={item.name}>
                    <div>
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                    </div>
                    {(item.href || item.secondaryHref) && (
                      <div className="history-links">
                        {item.href && (
                          <a href={item.href}>
                            View
                            <ArrowUpRight aria-hidden="true" />
                          </a>
                        )}
                        {item.secondaryHref && (
                          <a href={item.secondaryHref}>
                            {item.secondaryLabel}
                            <ArrowUpRight aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
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
