export type ProjectItem = {
  name: string;
  description: string;
  href?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  techStack: string[];
  useCases: string[];
  timeline: string;
};

export type ProjectSection = {
  period: string;
  title: string;
  items: ProjectItem[];
};

export type Project = ProjectItem & {
  sectionPeriod: string;
  sectionTitle: string;
  slug: string;
  hasDemo: boolean;
  timelineOrder: number;
};

export const historySections = [
  {
    period: "Studio and AI products",
    title: "TimeSurgeLabs and applied AI systems",
    items: [
      {
        name: "Manga Generator and Viewer",
        description:
          "A manga generation pipeline and reader demo that loads local story folders and supports mobile reading, progress tracking, and zoomable pages.",
        href: "/manga",
        techStack: ["Next.js", "Manga reader", "Interactive UI"],
        useCases: ["Demo", "Creative tool"],
        timeline: "AI media and games era",
      },
      {
        name: "TimeSurgeLabs",
        description:
          "Cofounder of an AI-accelerated software development studio focused on building apps with AI.",
        href: "https://timesurgelabs.com/",
        techStack: ["AI", "Web apps", "Product systems"],
        useCases: ["AI product studio", "Software services"],
        timeline: "Current studio work",
      },
      {
        name: "MemeSmithy",
        description:
          "An app to consume and generate memes using generative AI combined with image manipulation APIs.",
        techStack: ["Generative AI", "Image APIs", "Web app"],
        useCases: ["Creative tool", "AI media"],
        timeline: "Current studio work",
      },
      {
        name: "PromptProxy",
        description:
          "An OpenAI-compatible API for routing requests across many different AI models.",
        techStack: ["API", "LLM routing", "OpenAI-compatible"],
        useCases: ["Developer tool", "AI infrastructure"],
        timeline: "Current studio work",
      },
      {
        name: "MetaPrompter",
        description:
          "A web app that helps create strong AI prompts for arbitrary tasks.",
        techStack: ["LLMs", "Prompt engineering", "Web app"],
        useCases: ["Developer tool", "Productivity"],
        timeline: "Current studio work",
      },
      {
        name: "MetaMemePrompter",
        description:
          "Given a meme, identifies why it is funny and creates a reusable prompt for generating memes in that style.",
        techStack: ["Vision AI", "Generative AI", "Prompt engineering"],
        useCases: ["Creative tool", "AI media"],
        timeline: "Current studio work",
      },
      {
        name: "VideoQ",
        description:
          "An API for asking questions over video using Gemini's ability to understand video content.",
        techStack: ["Gemini", "Video understanding", "API"],
        useCases: ["Developer tool", "Video AI"],
        timeline: "Current studio work",
      },
      {
        name: "blogeval",
        description:
          "An AI eval that grades how well AI systems generate blog posts.",
        techStack: ["LLM evals", "AI grading", "Automation"],
        useCases: ["Developer tool", "AI evaluation"],
        timeline: "Current studio work",
      },
      {
        name: "LeadGen",
        description:
          "Uses AI and web scraping to find leads from a specific want or need prompt.",
        techStack: ["AI agents", "Web scraping", "Data extraction"],
        useCases: ["Sales automation", "Business tool"],
        timeline: "Current studio work",
      },
      {
        name: "BirdBrain",
        description: "Uses AI to generate viral tweets.",
        techStack: ["LLMs", "Social media automation"],
        useCases: ["Creative tool", "Marketing automation"],
        timeline: "Current studio work",
      },
      {
        name: "SearchBase",
        description:
          "A local AI RAG system for companies to query internal documentation.",
        techStack: ["RAG", "Embeddings", "Local AI"],
        useCases: ["Developer tool", "Knowledge base"],
        timeline: "Current studio work",
      },
      {
        name: "Summarizer",
        description: "A Chrome extension for summarizing YouTube videos.",
        techStack: ["Chrome extension", "LLMs", "YouTube"],
        useCases: ["Productivity", "Browser extension"],
        timeline: "Current studio work",
      },
      {
        name: "InfluencerGPT",
        description:
          "Fine-tuned LLMs on influencer transcripts, creating influencers you can talk to.",
        techStack: ["Fine-tuning", "LLMs", "Transcript data"],
        useCases: ["Conversational AI", "AI media"],
        timeline: "Current studio work",
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
        techStack: ["Audio synthesis", "Web audio", "Interactive UI"],
        useCases: ["Music tool", "Creative tool"],
        timeline: "AI media and games era",
      },
      {
        name: "AIPlaysMoonLander",
        description:
          "A reinforcement learning PPO algorithm trained on a MacBook to play MoonLander.",
        techStack: ["Reinforcement learning", "PPO", "Python"],
        useCases: ["Game AI", "Machine learning experiment"],
        timeline: "AI media and games era",
      },
      {
        name: "CodexGames",
        description:
          "A demonstration of how games can be quickly created and iterated on with OpenAI Codex.",
        href: "https://codex.timesurgelabs.com/",
        techStack: ["OpenAI Codex", "Web games", "Rapid prototyping"],
        useCases: ["Game", "Developer tool"],
        timeline: "AI media and games era",
      },
      {
        name: "Twitch-tools",
        description:
          "A Twitch chat text-to-speech app using Piper TTS, built with Tauri, Vite, Tailwind, shadcn, and Rust.",
        href: "https://github.com/TimeSurgeLabs/twitch-tools",
        techStack: ["Tauri", "Rust", "Vite", "Tailwind", "shadcn/ui", "Piper TTS"],
        useCases: ["Streamer tool", "Desktop app"],
        timeline: "AI media and games era",
      },
      {
        name: "AI Gen FPS",
        description:
          "An AI-generated multiplayer FPS video game built with Express and Three.js.",
        href: "https://games.timesurgelabs.com/",
        techStack: ["Express", "Three.js", "Multiplayer web"],
        useCases: ["Game", "AI-generated prototype"],
        timeline: "AI media and games era",
      },
      {
        name: "Tiktokify",
        description: "Generates TikTok videos from a podcast using AI.",
        techStack: ["Generative AI", "Video processing", "Automation"],
        useCases: ["AI media", "Content repurposing"],
        timeline: "AI media and games era",
      },
      {
        name: "Shortgen",
        description: "Generates short-form videos using AI.",
        techStack: ["Generative AI", "Video processing", "Automation"],
        useCases: ["AI media", "Content generation"],
        timeline: "AI media and games era",
      },
      {
        name: "CodeShot",
        description:
          "A code screenshot API that turns submitted code into a polished VS Code-style image.",
        techStack: ["API", "Code rendering", "Image generation"],
        useCases: ["Developer tool", "Design automation"],
        timeline: "AI media and games era",
      },
      {
        name: "VideoScript LLM",
        description:
          "Fine-tuned Llama, an open source LLM, on YouTube video scripts.",
        techStack: ["Llama", "Fine-tuning", "YouTube data"],
        useCases: ["AI media", "Research experiment"],
        timeline: "AI media and games era",
      },
      {
        name: "Manimator",
        description:
          "An API that creates Manim animations from a text description.",
        techStack: ["Manim", "LLMs", "API"],
        useCases: ["Developer tool", "Animation generation"],
        timeline: "AI media and games era",
      },
      {
        name: "FFMPEGGPT",
        description:
          "A GPT-style model trained on FFmpeg commands for generation workflows.",
        techStack: ["FFmpeg", "LLMs", "Command generation"],
        useCases: ["Developer tool", "Video workflow"],
        timeline: "AI media and games era",
      },
      {
        name: "DNDSummarizer",
        description:
          "An app that summarizes what happened in the last adventure for a D&D group.",
        techStack: ["LLMs", "Summarization", "Web app"],
        useCases: ["Game aid", "Productivity"],
        timeline: "AI media and games era",
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
        techStack: ["LLMs", "Workflow orchestration", "Agents"],
        useCases: ["AI research", "Agent system"],
        timeline: "AI orchestration era",
      },
      {
        name: "CompanyHerd",
        description:
          "Used a web of small LLMs in a corporate ladder structure to complete tasks.",
        techStack: ["Multi-agent systems", "LLMs", "Task orchestration"],
        useCases: ["AI research", "Agent system"],
        timeline: "AI orchestration era",
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
        techStack: ["PCB design", "Stepper motors", "Embedded hardware"],
        useCases: ["Hardware", "Robotics"],
        timeline: "Hardware and AR era",
      },
      {
        name: "SoldAR",
        description: "A mixed-reality feedback soldering iron.",
        href: "https://devpost.com/software/soldar",
        techStack: ["Mixed reality", "Hardware", "Soldering"],
        useCases: ["AR tool", "Hardware"],
        timeline: "Hardware and AR era",
      },
      {
        name: "Heroes of the Swarm",
        description:
          "Software that makes drones fly in arbitrary 3D shapes provided by a 3D model.",
        techStack: ["Drones", "3D models", "Robotics"],
        useCases: ["Robotics", "Drone system"],
        timeline: "Hardware and AR era",
      },
      {
        name: "Disaster Link",
        description:
          "Drones that drop Wi-Fi pucks for disaster-response scenarios.",
        href: "https://devpost.com/software/disasterlink",
        techStack: ["Drones", "Wireless networking", "Hardware"],
        useCases: ["Disaster response", "Robotics"],
        timeline: "Hardware and AR era",
      },
      {
        name: "PathFindAR",
        description: "AR Apple Maps before it was cool.",
        href: "https://devpost.com/software/pathfindar",
        techStack: ["AR", "Mobile app", "Maps"],
        useCases: ["Navigation", "AR app"],
        timeline: "Hardware and AR era",
      },
      {
        name: "StepByStep",
        description:
          "A shoe that counts your steps and lets you compete with friends.",
        techStack: ["Wearables", "Sensors", "Mobile app"],
        useCases: ["Fitness", "Hardware"],
        timeline: "Hardware and AR era",
      },
      {
        name: "Mobile Mouse",
        description: "An app that turns your smartphone into a mouse.",
        techStack: ["Mobile app", "Input control", "Networking"],
        useCases: ["Utility", "Productivity"],
        timeline: "Hardware and AR era",
      },
      {
        name: "Vitamex AR app",
        description:
          "An AR marketing app that showcases features of a Vitamex blender.",
        techStack: ["AR", "Mobile app", "3D product demo"],
        useCases: ["Marketing", "AR app"],
        timeline: "Hardware and AR era",
      },
      {
        name: "AR Knights Tour",
        description:
          "A Microsoft HoloLens app that lets a user perform the Knight's Tour algorithm on a physical chessboard.",
        techStack: ["HoloLens", "AR", "Algorithms"],
        useCases: ["Education", "AR app"],
        timeline: "Hardware and AR era",
      },
      {
        name: "Visual Music Assistant",
        description:
          "A HoloLens app that teaches piano from a MIDI file, paired with a custom PCB using a microphone and FFT to detect acoustic piano notes.",
        techStack: ["HoloLens", "MIDI", "PCB design", "FFT", "Audio analysis"],
        useCases: ["Music education", "AR app"],
        timeline: "Hardware and AR era",
      },
      {
        name: "CarID",
        description: "AI that detects a car's color, make, and model.",
        techStack: ["Computer vision", "Machine learning"],
        useCases: ["AI utility", "Vision system"],
        timeline: "Hardware and AR era",
      },
      {
        name: "Stepper Motor Driver",
        description:
          "Stepper motor circuit boards and systems for swapping driver ICs and sense resistor values while testing drivers on a torque transducer.",
        techStack: ["PCB design", "Stepper motors", "Torque testing"],
        useCases: ["Hardware", "Test rig"],
        timeline: "Hardware and AR era",
      },
      {
        name: "Stepper accelerated testing",
        description:
          "A stepper-motor test rig simulating 10,000 movements on injection molded parts for reliability testing.",
        techStack: ["Stepper motors", "Reliability testing", "Automation"],
        useCases: ["Test rig", "Hardware"],
        timeline: "Hardware and AR era",
      },
      {
        name: "NASA SUITS",
        description:
          "In college, created a spacesuit user interface for astronaut spacewalks using Unity, Node, PHP, and MySQL.",
        techStack: ["Unity", "Node.js", "PHP", "MySQL"],
        useCases: ["Space UI", "Competition project"],
        timeline: "College",
      },
      {
        name: "VEX Robotics World Champion",
        description:
          "In high school, created a robot that competed at state, national, and world levels.",
        techStack: ["VEX Robotics", "Embedded systems", "Mechanical design"],
        useCases: ["Robotics", "Competition project"],
        timeline: "High school",
      },
      {
        name: "Elden-Ring",
        description: "A phone booth that plays music for a DJ.",
        techStack: ["Interactive installation", "Audio playback", "Hardware"],
        useCases: ["Music installation", "Hardware"],
        timeline: "Hardware and AR era",
      },
    ],
  },
] satisfies ProjectSection[];

export function slugifyProjectName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const projects = historySections.flatMap((section, sectionIndex) =>
  section.items.map((item) => ({
    ...item,
    hasDemo: Boolean(item.href),
    sectionPeriod: section.period,
    sectionTitle: section.title,
    slug: slugifyProjectName(item.name),
    timelineOrder: sectionIndex,
  })),
);

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getRelatedProjects(project: Project) {
  return projects
    .filter(
      (candidate) =>
        candidate.slug !== project.slug &&
        candidate.sectionPeriod === project.sectionPeriod,
    )
    .slice(0, 3);
}
