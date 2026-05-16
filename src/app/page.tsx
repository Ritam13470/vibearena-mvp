"use client";

/* eslint-disable @next/next/no-img-element */
import {
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";

type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

type VisualType =
  | "tiger"
  | "dragon"
  | "robot"
  | "waifu"
  | "agent"
  | "beast"
  | "default";

type CharacterCard = {
  name: string;
  origin: string;
  power: string;
  weakness: string;
  score: number;
  rarity: Rarity;
  catchphrase: string;
  rank: number;
  visualType: VisualType;
  imagePrompt: string;
  imageUrl?: string;
};

type GenerateImageApiResponse = {
  imageUrl: string;
};

type Archetype = {
  names: string[];
  origins: string[];
  powers: string[];
  weaknesses: string[];
  catchphrases: string[];
  imageDescriptor: string;
};

type VisualTheme = {
  label: string;
  symbol: string;
  primary: string;
  secondary: string;
  accent: string;
  holoLabel: string;
  holoValue: string;
  metricLabel: string;
  metricValue: string;
};

const defaultPrompt =
  "A cyberpunk tiger warrior powered by Solana lightning";

const defaultCard: CharacterCard = {
  name: "Voltclaw",
  origin: "Born inside a broken validator node",
  power: "Lightning-speed transaction slash",
  weakness: "Overheats during network congestion",
  score: 91,
  rarity: "Legendary",
  catchphrase: "Finality is my roar.",
  rank: 7,
  visualType: "tiger",
  imagePrompt:
    "Premium cyberpunk tiger warrior named Voltclaw, powered by Solana lightning, full-body character render in a dark neon arena with purple, cyan, and green energy.",
};

const navLinks = [
  "Arena",
  "Characters",
  "Leaderboard",
  "Collections",
  "Marketplace",
  "Docs",
];

const sidebarItems = [
  ["⌂", "Home"],
  ["◇", "My Arena"],
  ["✦", "Create"],
  ["▧", "Collections"],
  ["◌", "Market"],
  ["▲", "Leaderboard"],
  ["●", "Profile"],
  ["⚙", "Settings"],
] as const;

const stylePresets = [
  ["✦", "Cyberpunk"],
  ["✧", "Fantasy"],
  ["◆", "Mecha"],
  ["◈", "Mystic"],
  ["◍", "Realistic"],
] as const;

const surprisePrompts = [
  "A neon dragon oracle guarding a Solana prophecy vault",
  "A mecha robot duelist with quantum armor and cyan plasma claws",
  "A safe anime waifu AI companion piloting a holographic arena rig",
  "A tactical agent assistant made of violet light and encrypted memory",
  "A cyberpunk tiger warrior powered by Solana lightning",
];

const archetypes: Record<VisualType, Archetype> = {
  tiger: {
    names: ["Voltclaw", "Thunderstripe", "Neon Fang", "Slot Prowler"],
    origins: [
      "Born inside a broken validator node",
      "Forged where the arena grid met a midnight Solana storm",
      "Awakened when a lightning fork crossed an abandoned mint gate",
      "Raised in a validator shrine under violet static rain",
    ],
    powers: [
      "Lightning-speed transaction slash",
      "Pounces through pending blocks with plasma claws",
      "Turns failed confirmations into violet thunder combos",
      "Cuts arena shields with finality-charged claws",
    ],
    weaknesses: [
      "Overheats during network congestion",
      "Needs a cool-down cycle after every thunder pounce",
      "Loses focus when decoy signatures flood the arena",
      "Armor flickers when the mempool gets too loud",
    ],
    catchphrases: [
      "Finality is my roar.",
      "Blink and the block is mine.",
      "I hunt where the mempool flashes.",
      "The chain hears my claws first.",
    ],
    imageDescriptor:
      "cyberpunk tiger warrior, neon armor, glowing cyan eyes, Solana lightning",
  },
  dragon: {
    names: ["Oracle Wyrm", "Auralith", "Starcoil", "Rune Drifter"],
    origins: [
      "Decoded from an oracle echo beneath the Devnet moon",
      "Summoned by validators during a blue-fire eclipse",
      "Raised in a vault where prophecies settled like chain history",
      "Hatched from a blockhash wrapped in mystic plasma",
    ],
    powers: [
      "Predictive flame that bends enemy moves one slot early",
      "Casts probability shields from compressed starlight",
      "Reads arena intent through shimmering block traces",
      "Breathes oracle fire that rewrites combat odds",
    ],
    weaknesses: [
      "Power fades when randomness becomes too clean",
      "Spell loops fracture under heavy signal noise",
      "Needs rare silence before long-range prophecy casts",
      "Overcommits when a false omen looks too perfect",
    ],
    catchphrases: [
      "The future already signed.",
      "I see the slot before the spark.",
      "Every omen pays rent.",
      "My fire remembers tomorrow.",
    ],
    imageDescriptor:
      "glowing dragon oracle, mystic neon scales, violet prophecy runes, cyber arena",
  },
  robot: {
    names: ["Circuit Ronin", "Mechaflux", "Ion Bastion", "Servo Saint"],
    origins: [
      "Assembled from retired GPU rigs and validator rails",
      "Built in a lab where every heartbeat was a latency chart",
      "Recovered from a crater of glass, code, and emerald sparks",
      "Compiled inside a combat simulator that refused to shut down",
    ],
    powers: [
      "Launches synchronized drone strikes at block speed",
      "Rewrites combat angles with predictive servo bursts",
      "Turns incoming attacks into reflected plasma telemetry",
      "Locks onto threats with AI-calibrated precision rails",
    ],
    weaknesses: [
      "Magnetic storms scramble its targeting lattice",
      "Legacy firmware panics around chaotic meme energy",
      "Heavy armor slows it during rapid arena rotations",
      "Signal noise can desync its combat subroutines",
    ],
    catchphrases: [
      "Precision is a weapon.",
      "Latency detected. Victory corrected.",
      "My steel remembers every miss.",
      "Combat path optimized.",
    ],
    imageDescriptor:
      "mecha robot fighter, chrome armor, cyan plasma joints, AI combat core",
  },
  waifu: {
    names: ["Mira Flux", "Aiko Signal", "Nova Muse", "Luma Sync"],
    origins: [
      "Designed as a friendly arena companion inside a kindness-first AI lab",
      "Generated from soft neon memories and Solana training signals",
      "Awakened in a companion model tuned for calm tactical support",
      "Projected from a holographic studio where empathy became armor",
    ],
    powers: [
      "Boosts allies with synchronized morale and predictive shields",
      "Turns emotional signal into calm tactical counterplay",
      "Projects nonviolent decoys that redirect hostile arena focus",
      "Stabilizes team timing with a luminous companion field",
    ],
    weaknesses: [
      "Protective routines can delay aggressive finishing moves",
      "Gets signal drift when teammates ignore safety protocols",
      "Compassion filters reduce burst damage under pressure",
      "Needs trust calibration before high-risk maneuvers",
    ],
    catchphrases: [
      "I keep the signal kind.",
      "Your next move is safe with me.",
      "Calm code wins loud fights.",
      "We synchronize, then shine.",
    ],
    imageDescriptor:
      "safe anime AI companion silhouette, elegant cyber jacket, holographic support rig",
  },
  agent: {
    names: ["Cipher Agent", "Tasklight", "Prompt Runner", "Nexus Guide"],
    origins: [
      "Deployed from a sealed assistant core beneath the arena floor",
      "Forked from an AI operations model trained on mission graphs",
      "Initialized when an encrypted prompt touched the Solana grid",
      "Born as a holographic handler for high-speed creator workflows",
    ],
    powers: [
      "Splits tasks into autonomous strike routes",
      "Routes arena threats through a glowing decision graph",
      "Summons utility bots that resolve hazards before impact",
      "Turns prompt intent into executable combat plans",
    ],
    weaknesses: [
      "Ambiguous instructions create temporary logic loops",
      "Overplanning can slow instinctive arena reactions",
      "Tool failures force it into manual fallback mode",
      "Needs clean context to keep missions aligned",
    ],
    catchphrases: [
      "Objective parsed.",
      "I route the impossible.",
      "Your intent is my weapon.",
      "Mission graph online.",
    ],
    imageDescriptor:
      "holographic AI agent core, tactical assistant silhouette, glowing task graph",
  },
  beast: {
    names: ["Wildmint", "Feral Nova", "Chain Howl", "Prism Mauler"],
    origins: [
      "Found in an untamed arena shard outside the validator perimeter",
      "Mutated from raw prompt energy and neon survival instincts",
      "Raised by rogue signals in the dark edge of the Solana grid",
      "Unleashed when a forgotten collection learned to fight back",
    ],
    powers: [
      "Charges through shields with untamed kinetic force",
      "Turns instinct into sudden chain-reactive bursts",
      "Roars hard enough to fracture enemy target locks",
      "Hunts weak signals with wild arena precision",
    ],
    weaknesses: [
      "Hard to steer when the arena gets too bright",
      "Instinctive attacks can miss subtle traps",
      "Needs a stable handler to prevent overextension",
      "Burns energy quickly during long duels",
    ],
    catchphrases: [
      "The wild chain bites.",
      "No cage holds a signal.",
      "I run where maps end.",
      "Let the arena fear instinct.",
    ],
    imageDescriptor:
      "abstract cyber beast fighter, neon fangs, kinetic armor, glowing arena",
  },
  default: {
    names: ["Solflare Ace", "Vibe Vector", "Nova Runner", "Mint Phantom"],
    origins: [
      "Generated in the VibeArena training lattice",
      "Sparked into form by a prompt and a Devnet pulse",
      "Discovered inside a simulation of high-frequency arena battles",
      "Composed from creator intent and Solana arena telemetry",
    ],
    powers: [
      "Turns creative intent into a kinetic Solana burst",
      "Chains momentum across the arena with AI-tuned reflexes",
      "Creates holographic decoys that trade places with impact",
      "Converts prompt energy into neon combat geometry",
    ],
    weaknesses: [
      "Unstable prompts can scatter its combat rhythm",
      "Needs a clean signal to hold its strongest form",
      "Burns too much VIBE when forced into long duels",
      "Struggles when enemy patterns become too human",
    ],
    catchphrases: [
      "The vibe has velocity.",
      "I was prompted for this.",
      "Arena signal locked.",
      "Intent becomes impact.",
    ],
    imageDescriptor:
      "abstract Solana arena fighter, neon armor, holographic energy core",
  },
};

const visualThemes: Record<VisualType, VisualTheme> = {
  tiger: {
    label: "Cyber Tiger",
    symbol: "TGR",
    primary: "#facc15",
    secondary: "#f97316",
    accent: "#22d3ee",
    holoLabel: "Transaction Confirmed",
    holoValue: "5,421 TPS",
    metricLabel: "Block Time",
    metricValue: "400ms",
  },
  dragon: {
    label: "Oracle Dragon",
    symbol: "DRG",
    primary: "#22d3ee",
    secondary: "#14f195",
    accent: "#a855f7",
    holoLabel: "Oracle Signal",
    holoValue: "Future Lock",
    metricLabel: "Rune Sync",
    metricValue: "98%",
  },
  robot: {
    label: "Mecha Core",
    symbol: "01",
    primary: "#38bdf8",
    secondary: "#94a3b8",
    accent: "#a855f7",
    holoLabel: "Servo Link",
    holoValue: "Online",
    metricLabel: "Latency",
    metricValue: "12ms",
  },
  waifu: {
    label: "AI Companion",
    symbol: "AI",
    primary: "#f0abfc",
    secondary: "#67e8f9",
    accent: "#a78bfa",
    holoLabel: "Companion Sync",
    holoValue: "Kind Mode",
    metricLabel: "Support Field",
    metricValue: "Active",
  },
  agent: {
    label: "Agent Core",
    symbol: "AGT",
    primary: "#a78bfa",
    secondary: "#22d3ee",
    accent: "#14f195",
    holoLabel: "Agent Core",
    holoValue: "Task Graph",
    metricLabel: "Tools Ready",
    metricValue: "7/7",
  },
  beast: {
    label: "Arena Beast",
    symbol: "BST",
    primary: "#fb7185",
    secondary: "#facc15",
    accent: "#22d3ee",
    holoLabel: "Wild Signal",
    holoValue: "Untamed",
    metricLabel: "Instinct",
    metricValue: "Max",
  },
  default: {
    label: "Arena Fighter",
    symbol: "SOL",
    primary: "#14f195",
    secondary: "#22d3ee",
    accent: "#9945ff",
    holoLabel: "Arena Signal",
    holoValue: "Ready",
    metricLabel: "Prompt Core",
    metricValue: "Stable",
  },
};

const rarityStyles: Record<Rarity, string> = {
  Common: "border-slate-300/30 bg-slate-300/10 text-slate-200",
  Rare: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
  Epic: "border-fuchsia-300/40 bg-fuchsia-300/10 text-fuchsia-100",
  Legendary: "border-amber-300/60 bg-amber-300/15 text-amber-200",
  Mythic: "border-emerald-300/50 bg-emerald-300/10 text-emerald-100",
};

function hashPrompt(value: string) {
  return value.split("").reduce((hash, char) => {
    return (hash * 33 + char.charCodeAt(0)) >>> 0;
  }, 5381);
}

function pickFrom<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length];
}

function getVisualType(prompt: string): VisualType {
  const lowerPrompt = prompt.toLowerCase();
  const rules: { visualType: VisualType; keywords: string[] }[] = [
    { visualType: "tiger", keywords: ["tiger", "lion", "panther", "beast"] },
    { visualType: "dragon", keywords: ["dragon", "oracle", "mystic"] },
    { visualType: "robot", keywords: ["robot", "mecha", "cyborg", "android"] },
    { visualType: "waifu", keywords: ["waifu", "anime", "companion"] },
    { visualType: "agent", keywords: ["agent", "bot", "assistant"] },
  ];

  return (
    rules.find((rule) =>
      rule.keywords.some((keyword) => lowerPrompt.includes(keyword)),
    )?.visualType ?? "default"
  );
}

function getRarity(score: number): Rarity {
  if (score >= 96) return "Mythic";
  if (score >= 88) return "Legendary";
  if (score >= 78) return "Epic";
  if (score >= 68) return "Rare";
  return "Common";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isImageGenerationResponse(
  value: unknown,
): value is GenerateImageApiResponse {
  return (
    isRecord(value) &&
    typeof value.imageUrl === "string" &&
    value.imageUrl.startsWith("data:image/")
  );
}

function getPromptMotif(prompt: string) {
  const cleanWords = prompt
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9-]/gi, ""))
    .filter((word) => word.length > 3);

  return cleanWords.slice(0, 4).join(" ").toLowerCase() || "arena signal";
}

function buildImagePrompt(
  prompt: string,
  style: string,
  visualType: VisualType,
  name: string,
) {
  const archetype = archetypes[visualType];

  return [
    `Premium ${style.toLowerCase()} AI character render of ${name}.`,
    archetype.imageDescriptor,
    `Inspired by user prompt: ${prompt}.`,
    "Dark VibeArena dashboard background, Solana purple cyan green neon lighting, full-body hero pose, high contrast production concept art.",
  ].join(" ");
}

function generateCharacter(
  prompt: string,
  style: string,
  generationVariant = 0,
): CharacterCard {
  const visualType = getVisualType(prompt);
  const archetype = archetypes[visualType];
  const seed = hashPrompt(`${prompt}-${style}-${generationVariant}`);
  const score = 60 + (seed % 40);
  const rarity = getRarity(score);
  const motif = getPromptMotif(prompt);
  const name = pickFrom(archetype.names, seed, style.length);

  return {
    name,
    origin: pickFrom(archetype.origins, seed, 3),
    power: `${pickFrom(archetype.powers, seed, 7)} shaped by ${motif}`,
    weakness: pickFrom(archetype.weaknesses, seed, 11),
    score,
    rarity,
    catchphrase: pickFrom(archetype.catchphrases, seed, 13),
    rank: 1 + ((seed + generationVariant) % 99),
    visualType,
    imagePrompt: buildImagePrompt(prompt, style, visualType, name),
  };
}

function SolanaMark({ className = "h-10 w-10" }: { className?: string }) {
  const markId = useId().replace(/:/g, "");
  const barA = `solana-bar-a-${markId}`;
  const barB = `solana-bar-b-${markId}`;
  const glow = `solana-glow-${markId}`;

  return (
    <svg
      viewBox="0 0 84 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={barA} x1="5" y1="8" x2="78" y2="8">
          <stop stopColor="#9945FF" />
          <stop offset="0.48" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
        <linearGradient id={barB} x1="78" y1="32" x2="5" y2="32">
          <stop stopColor="#9945FF" />
          <stop offset="0.52" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
        <filter id={glow} x="-20%" y="-40%" width="140%" height="180%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="2.5"
            floodColor="#22D3EE"
            floodOpacity="0.55"
          />
        </filter>
      </defs>
      <g filter={`url(#${glow})`}>
        <path
          d="M19 8h55c2.4 0 3.6 2.9 1.9 4.6L67 21.5a6 6 0 0 1-4.2 1.7H8c-2.4 0-3.6-2.9-1.9-4.6L15 9.7A6 6 0 0 1 19 8Z"
          fill={`url(#${barA})`}
        />
        <path
          d="M65 25H10c-2.4 0-3.6 2.9-1.9 4.6l8.9 8.9a6 6 0 0 0 4.2 1.7H76c2.4 0 3.6-2.9 1.9-4.6L69 26.7a6 6 0 0 0-4-1.7Z"
          fill={`url(#${barB})`}
        />
        <path
          d="M19 42h55c2.4 0 3.6 2.9 1.9 4.6L67 55.5a6 6 0 0 1-4.2 1.7H8c-2.4 0-3.6-2.9-1.9-4.6l8.9-8.9A6 6 0 0 1 19 42Z"
          fill={`url(#${barA})`}
        />
      </g>
    </svg>
  );
}

function LogoMark() {
  return (
    <div className="flex min-w-max items-center gap-3">
      <div className="relative grid size-11 place-items-center overflow-hidden rounded-[1.15rem] border border-fuchsia-300/40 bg-[#12081f] shadow-[0_0_34px_rgba(168,85,247,0.34)]">
        <div className="absolute inset-0 animate-gradient-shift bg-[linear-gradient(135deg,#7c3aed,#a855f7,#22d3ee,#14f195)] opacity-85" />
        <div className="relative grid size-8 place-items-center rounded-xl bg-[#050712] text-xl font-black text-white shadow-inner shadow-white/10">
          ⚡
        </div>
      </div>
      <div className="leading-none">
        <p className="text-xl font-black tracking-tight">
          <span className="text-white">Vibe</span>
          <span className="text-fuchsia-300">Arena</span>
        </p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200/60">
          AI x Solana
        </p>
      </div>
    </div>
  );
}

function Header({ onStatus }: { onStatus: (message: string) => void }) {
  function handleNav(link: string) {
    if (link === "Arena") return;

    if (link === "Collections" || link === "Marketplace") {
      onStatus("Coming soon.");
      return;
    }

    onStatus(`${link} view coming soon.`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-fuchsia-300/15 bg-[#030712]/85 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-[76px] max-w-[1760px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:flex-nowrap lg:px-5">
        <LogoMark />

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.045] p-1 shadow-inner shadow-white/5 lg:order-none lg:w-auto">
          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => handleNav(link)}
              className={`min-w-max rounded-full px-4 py-2 text-sm font-bold transition ${
                link === "Arena"
                  ? "bg-gradient-to-r from-violet-600/90 to-fuchsia-500/90 text-white shadow-[0_0_26px_rgba(168,85,247,0.45)]"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link}
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3">
          <div className="hidden min-w-[154px] items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.08)] sm:flex">
            <SolanaMark className="h-8 w-10" />
            <div className="leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                SOL Price
              </p>
              <p className="text-sm font-black text-white">
                $172.45{" "}
                <span className="text-xs font-bold text-emerald-300">
                  +4.21%
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onStatus(
                "Wallet connect coming next: Phantom + Solana wallet adapter.",
              )
            }
            className="group relative overflow-hidden rounded-2xl border border-fuchsia-200/30 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 px-4 py-3 text-sm font-black text-white shadow-[0_0_32px_rgba(168,85,247,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(34,211,238,0.28)]"
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.48),transparent)] transition duration-700 group-hover:translate-x-[120%]" />
            <span className="relative flex items-center gap-2">
              <span aria-hidden="true">▣</span>
              Connect Wallet
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ onStatus }: { onStatus: (message: string) => void }) {
  function handleSidebarAction(label: string, index: number) {
    if (index === 0) return;

    if (label === "Collections" || label === "Market") {
      onStatus("Coming soon.");
      return;
    }

    onStatus(`${label} workspace coming soon.`);
  }

  return (
    <aside className="lg:sticky lg:top-[92px] lg:h-[calc(100vh-108px)]">
      <div className="glass-panel flex gap-3 overflow-x-auto rounded-[1.45rem] p-3 lg:h-full lg:flex-col lg:overflow-visible">
        <nav className="flex min-w-max gap-2 lg:min-w-0 lg:flex-1 lg:flex-col">
          {sidebarItems.map(([icon, label], index) => (
            <button
              key={label}
              type="button"
              onClick={() => handleSidebarAction(label, index)}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${
                index === 0
                  ? "border border-fuchsia-300/35 bg-gradient-to-r from-violet-600/35 to-fuchsia-500/20 text-white shadow-[0_0_28px_rgba(168,85,247,0.28)]"
                  : "border border-transparent text-slate-400 hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-white"
              }`}
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-xl border text-base transition ${
                  index === 0
                    ? "border-fuchsia-200/35 bg-fuchsia-300/15 text-fuchsia-100 shadow-[0_0_22px_rgba(168,85,247,0.28)]"
                    : "border-white/10 bg-[#060a18]/80 text-slate-500 group-hover:border-cyan-300/30 group-hover:text-cyan-100"
                }`}
              >
                {icon}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-[245px] overflow-hidden rounded-[1.35rem] border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.12),rgba(168,85,247,0.14),rgba(2,6,23,0.86))] p-4 shadow-[0_0_34px_rgba(34,211,238,0.09)] lg:min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/75">
              VIBE Credits
            </p>
            <button
              type="button"
              aria-label="Add VIBE credits"
              onClick={() =>
                onStatus("Credit top-ups will unlock after billing is added.")
              }
              className="grid size-8 place-items-center rounded-xl border border-cyan-200/30 bg-cyan-300/15 text-lg font-black text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
            >
              +
            </button>
          </div>
          <p className="mt-3 text-3xl font-black tracking-tight text-white">
            1,250
          </p>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            <span>Daily Credits</span>
            <span className="text-cyan-100">750 / 1,000</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#14f195] via-[#22d3ee] to-[#a855f7] shadow-[0_0_18px_rgba(34,211,238,0.7)]" />
          </div>
          <button
            type="button"
            onClick={() =>
              onStatus("VIBE Credit upgrades will unlock after billing is added.")
            }
            className="mt-4 w-full rounded-2xl border border-fuchsia-200/30 bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-black text-white shadow-[0_0_28px_rgba(168,85,247,0.28)] transition hover:-translate-y-0.5"
          >
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}

function StatusBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      className="glass-panel glow-border flex items-center justify-between gap-3 rounded-[1.2rem] px-4 py-3"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/65">
          Demo Status
        </p>
        <p className="mt-1 text-sm font-semibold leading-5 text-slate-100">
          {message}
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss status message"
        onClick={onDismiss}
        className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-sm font-black text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

function SelectorCard({
  label,
  title,
  subtitle,
  badge,
  tone,
  onClick,
}: {
  label: string;
  title: string;
  subtitle: string;
  badge?: string;
  tone: "purple" | "solana";
  onClick: () => void;
}) {
  const isSolana = tone === "solana";

  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100/65">
        {label}
      </p>
      <button
        type="button"
        onClick={onClick}
        className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#050816]/80 p-3 text-left shadow-inner shadow-white/5 transition hover:border-fuchsia-300/35 hover:bg-white/[0.06]"
      >
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-2xl border ${
            isSolana
              ? "border-emerald-300/30 bg-emerald-300/10"
              : "border-fuchsia-300/35 bg-fuchsia-300/15 text-fuchsia-100"
          }`}
        >
          {isSolana ? <SolanaMark className="h-7 w-9" /> : "✦"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-black text-white">
              {title}
            </span>
            {badge && (
              <span className="rounded-full border border-fuchsia-200/30 bg-fuchsia-300/15 px-2 py-0.5 text-[10px] font-black text-fuchsia-100">
                {badge}
              </span>
            )}
          </span>
          <span className="mt-1 block text-xs leading-4 text-slate-500">
            {subtitle}
          </span>
        </span>
        {isSolana && (
          <span className="mr-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">
            Online
          </span>
        )}
        <span className="text-lg text-slate-500">⌄</span>
      </button>
    </div>
  );
}

function StudioPanel({
  prompt,
  selectedStyle,
  isGenerating,
  onPromptChange,
  onStyleChange,
  onGenerate,
  onSurprise,
  onStatus,
}: {
  prompt: string;
  selectedStyle: string;
  isGenerating: boolean;
  onPromptChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onGenerate: () => void;
  onSurprise: () => void;
  onStatus: (message: string) => void;
}) {
  const promptLength =
    prompt === defaultPrompt ? 52 : Math.min(prompt.length, 500);

  return (
    <section className="glass-panel glow-border rounded-[1.6rem] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-fuchsia-200/80">
            AI Character Studio
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Describe your character. Our AI will bring it to life.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
          AI Mode: Groq Text + Free Image
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="character-prompt"
            className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100/70"
          >
            Your Prompt
          </label>
          <span className="grid size-6 place-items-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-xs font-black text-emerald-200">
            ✓
          </span>
        </div>
        <div className="rounded-[1.25rem] border border-fuchsia-300/20 bg-[#050816]/90 p-3 shadow-[0_0_32px_rgba(168,85,247,0.08)]">
          <textarea
            id="character-prompt"
            maxLength={500}
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            className="h-28 w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-600"
            placeholder="A cyberpunk tiger warrior powered by Solana lightning"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-medium text-emerald-300/85">
              Prompt signal stable
            </span>
            <span className="font-bold text-slate-500">
              {promptLength} / 500
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100/70">
          Style Presets
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {stylePresets.map(([icon, style]) => (
            <button
              key={style}
              type="button"
              onClick={() => onStyleChange(style)}
              className={`rounded-2xl border px-3 py-2 text-xs font-black transition ${
                selectedStyle === style
                  ? "border-fuchsia-200/40 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-[0_0_24px_rgba(168,85,247,0.34)]"
                  : "border-white/10 bg-white/[0.045] text-slate-400 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white"
              }`}
            >
              <span className="mr-1.5" aria-hidden="true">
                {icon}
              </span>
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <SelectorCard
          label="Model"
          title="VibeArena AI v2.1"
          badge="PRO"
          subtitle="Advanced character generation model"
          tone="purple"
          onClick={() => onStatus("Model switching will unlock when more AI models are connected.")}
        />
        <SelectorCard
          label="Network"
          title="Solana"
          subtitle="Optimized for Solana ecosystem"
          tone="solana"
          onClick={() => onStatus("Solana is selected. More networks are not planned for this demo.")}
        />
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-cyan-200/30 bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#22d3ee] px-5 py-4 text-sm font-black text-white shadow-[0_0_38px_rgba(34,211,238,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(168,85,247,0.36)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.48),transparent)] transition duration-700 group-hover:translate-x-[120%]" />
          <span className="relative">✦</span>
          <span className="relative">
            {isGenerating ? "Generating with AI..." : "Generate Character"}
          </span>
        </button>

        <button
          type="button"
          onClick={onSurprise}
          disabled={isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#050816]/85 px-5 py-3.5 text-sm font-black text-slate-200 transition hover:border-fuchsia-300/35 hover:bg-fuchsia-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span aria-hidden="true">◇</span>
          Surprise Me
        </button>

        <p className="text-center text-xs font-medium text-slate-500">
          Each generation costs{" "}
          <span className="font-black text-cyan-200">10 VIBE Credits</span>
        </p>
      </div>
    </section>
  );
}

function AttributeList({ card }: { card: CharacterCard }) {
  const attributes = [
    ["⌁", "Origin", card.origin],
    ["⚡", "Power", card.power],
    ["!", "Weakness", card.weakness],
    ['"', "Catchphrase", card.catchphrase],
  ] as const;

  return (
    <div className="mt-6 space-y-3">
      {attributes.map(([icon, label, value]) => (
        <div
          key={label}
          className="flex gap-3 rounded-2xl border border-white/10 bg-[#050816]/70 p-3 shadow-inner shadow-white/5"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-sm font-black text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
            {icon}
          </span>
          <span>
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-200/60">
              {label}
            </span>
            <span className="mt-1 block text-sm leading-5 text-slate-200">
              {value}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function ScoreRarityCards({ card }: { card: CharacterCard }) {
  const gaugeDegrees = card.score * 3.6;

  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/70">
          Score
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="score-ring grid size-16 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#22d3ee 0deg, #a855f7 ${gaugeDegrees}deg, rgba(255,255,255,0.08) ${gaugeDegrees}deg 360deg)`,
            }}
          >
            <div className="grid size-11 place-items-center rounded-full bg-[#050816] text-xl font-black text-white">
              {card.score}
            </div>
          </div>
          <span className="text-xs leading-5 text-slate-400">
            Arena grade combat signal
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-100/70">
          Rarity
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="rarity-emblem grid size-16 place-items-center text-2xl font-black text-amber-100">
            ✦
          </div>
          <span className="text-sm font-black text-amber-100">
            {card.rarity}
          </span>
        </div>
      </div>
    </div>
  );
}

function CharacterVisual({ character }: { character: CharacterCard }) {
  const theme = visualThemes[character.visualType];
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const visualStyle = {
    "--visual-primary": theme.primary,
    "--visual-secondary": theme.secondary,
    "--visual-accent": theme.accent,
  } as CSSProperties;
  const generatedVisualStyle = {
    ...visualStyle,
    "--tilt-x": `${tilt.x}deg`,
    "--tilt-y": `${tilt.y}deg`,
  } as CSSProperties;

  function handleGeneratedStageMouseMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    const motionScale = window.innerWidth < 768 ? 0.35 : 1;

    setTilt({
      x: Number((-pointerY * 8 * motionScale).toFixed(2)),
      y: Number((pointerX * 10 * motionScale).toFixed(2)),
    });
  }

  function resetGeneratedStageTilt() {
    setTilt({ x: 0, y: 0 });
  }

  if (character.imageUrl) {
    return (
      <div
        className={`character-stage generated-image-stage ai-image-premium-stage visual-${character.visualType} relative min-h-[520px] overflow-hidden rounded-[1.6rem] border border-cyan-300/20 bg-[#030712] shadow-[inset_0_0_80px_rgba(34,211,238,0.08),0_0_70px_rgba(124,58,237,0.16)] sm:min-h-[620px]`}
        style={generatedVisualStyle}
        onMouseMove={handleGeneratedStageMouseMove}
        onMouseLeave={resetGeneratedStageTilt}
        aria-label={`${character.name} ${theme.label} animated AI image stage`}
      >
        <div className="ai-stage-backdrop" />
        <div className="cyber-grid absolute inset-0 z-[1] opacity-35" />
        <div className="ai-stage-smoke" />
        <div className="ai-stage-arena-ring" />
        <div className="ai-stage-arena-ring ai-stage-arena-ring-secondary" />
        <div className="ai-power-column" />
        <div className="ai-summon-ring" />
        <div className="ai-spotlight-sweep" />
        <div className="ai-stage-lightning ai-stage-lightning-one" />
        <div className="ai-stage-lightning ai-stage-lightning-two" />

        {Array.from({ length: 22 }).map((_, index) => (
          <span
            key={`stage-particle-${index}`}
            className="ai-stage-particle"
            style={{
              left: `${6 + ((index * 23) % 88)}%`,
              top: `${8 + ((index * 31) % 78)}%`,
              animationDelay: `${index * 0.17}s`,
              animationDuration: `${4.4 + (index % 5) * 0.45}s`,
            }}
          />
        ))}

        <div className="ai-hologram-card">
          <div className="ai-aura-field" aria-hidden="true">
            <span className="ai-aura ai-aura-one" />
            <span className="ai-aura ai-aura-two" />
            <span className="ai-aura ai-aura-three" />
          </div>
          <div className="ai-image-shell">
            <div className="ai-character-breathe">
              <img
                src={character.imageUrl}
                alt={`${character.name} generated character`}
                className="ai-stage-image"
              />
            </div>
            <div className="ai-image-vignette" />
            <div className="ai-eye-glow-layer" aria-hidden="true">
              <span className="ai-eye-glow ai-eye-glow-left" />
              <span className="ai-eye-glow ai-eye-glow-right" />
            </div>
            <div className="ai-scanlines" />
            <div className="ai-hologram-distortion" />
            {Array.from({ length: 3 }).map((_, index) => (
              <span
                key={`arc-${index}`}
                className={`ai-lightning-arc ai-lightning-arc-${index + 1}`}
              />
            ))}
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={`front-spark-${index}`}
                className="ai-front-spark"
                style={{
                  left: `${12 + ((index * 17) % 76)}%`,
                  bottom: `${5 + ((index * 11) % 42)}%`,
                  animationDelay: `${index * 0.22}s`,
                }}
              />
            ))}
            {Array.from({ length: 6 }).map((_, index) => (
              <span
                key={`energy-streak-${index}`}
                className="ai-energy-streak"
                style={{
                  left: `${8 + ((index * 19) % 82)}%`,
                  top: `${18 + ((index * 23) % 58)}%`,
                  animationDelay: `${index * 0.38}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="ai-stage-label left-4 top-4 sm:left-5 sm:top-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/80">
            AI IMAGE ACTIVE
          </p>
          <p className="mt-1 text-base font-black text-white">{theme.label}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-100/70">
            2.5D motion stage
          </p>
        </div>

        <div className="ai-energy-badge">
          <SolanaMark className="h-8 w-8" />
          <span>{theme.symbol}</span>
        </div>

        <div className="ai-stage-readout">
          <span>{theme.holoLabel}</span>
          <strong>{theme.holoValue}</strong>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`character-stage visual-stage visual-${character.visualType} relative min-h-[520px] overflow-hidden rounded-[1.6rem] border border-cyan-300/20 bg-[#030712] shadow-[inset_0_0_80px_rgba(34,211,238,0.08),0_0_70px_rgba(124,58,237,0.16)] sm:min-h-[620px]`}
      style={visualStyle}
      aria-label={`${character.name} ${theme.label} CSS visual`}
    >
      <div className="absolute bottom-4 left-4 z-30 rounded-2xl border border-cyan-300/20 bg-black/35 px-4 py-2.5 backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/75">
          CSS FALLBACK ACTIVE
        </p>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_28%,rgba(34,211,238,0.22),transparent_26%),radial-gradient(circle_at_62%_42%,rgba(168,85,247,0.22),transparent_31%),radial-gradient(circle_at_50%_92%,rgba(20,241,149,0.14),transparent_28%)]" />
      <div className="cyber-grid absolute inset-0 opacity-45" />
      <div className="stage-fog" />

      <div className="holo-panel animate-float-slow left-[6%] top-[8%]">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-200">
          {theme.holoLabel}
        </span>
        <span className="mt-1 block text-lg font-black text-white">
          {theme.holoValue}
        </span>
      </div>

      <div className="holo-panel animate-float-slow right-[6%] top-[21%] [animation-delay:1.2s]">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200">
          {theme.metricLabel}
        </span>
        <span className="mt-1 block text-lg font-black text-white">
          {theme.metricValue}
        </span>
      </div>

      <div className="absolute right-[7%] top-[47%] z-20 rounded-2xl border border-white/10 bg-white/[0.065] p-3 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-xl">
        <SolanaMark />
      </div>

      <div className="energy-orbit energy-orbit-one" />
      <div className="energy-orbit energy-orbit-two" />
      <div className="lightning-slash" />
      <div className="lightning-slash lightning-slash-alt" />

      <div
        className={`visual-avatar visual-avatar-${character.visualType} animate-float-slow`}
      >
        <span className="visual-wing visual-wing-left" />
        <span className="visual-wing visual-wing-right" />
        <span className="visual-body" />
        <span className="visual-head" />
        <span className="visual-mark visual-mark-one" />
        <span className="visual-mark visual-mark-two" />
        <span className="visual-eye visual-eye-left" />
        <span className="visual-eye visual-eye-right" />
        <span className="visual-symbol">{theme.symbol}</span>
      </div>

      <div className="arena-platform">
        <span className="platform-ring platform-ring-one" />
        <span className="platform-ring platform-ring-two" />
        <span className="platform-core" />
      </div>

      {Array.from({ length: 24 }).map((_, index) => (
        <span
          key={index}
          className="particle-dot animate-particle-drift"
          style={{
            left: `${8 + ((index * 19) % 84)}%`,
            top: `${10 + ((index * 29) % 76)}%`,
            animationDelay: `${index * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

function ResultPanel({
  card,
  liked,
  isGenerating,
  isImageLoading,
  onGenerate,
  onGenerateImage,
  onToggleLike,
  onStatus,
}: {
  card: CharacterCard;
  liked: boolean;
  isGenerating: boolean;
  isImageLoading: boolean;
  onGenerate: () => void;
  onGenerateImage: () => void;
  onToggleLike: () => void;
  onStatus: (message: string) => void;
}) {
  const theme = visualThemes[card.visualType];

  return (
    <section className="glass-panel glow-border rounded-[1.6rem] p-4 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(290px,0.78fr)_minmax(440px,1.22fr)]">
        <div className="flex min-h-[560px] flex-col">
          <div>
            <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100">
              Generated
            </span>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                {card.name}
              </h1>
              <span className="text-4xl text-fuchsia-300 drop-shadow-[0_0_18px_rgba(168,85,247,0.8)]">
                ⚡
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] ${rarityStyles[card.rarity]}`}
              >
                {card.rarity}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-black text-slate-200">
                Rank #{card.rank}
              </span>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-black capitalize text-cyan-100">
                {card.visualType}
              </span>
            </div>
          </div>

          <AttributeList card={card} />
          <ScoreRarityCards card={card} />

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="min-w-[190px] flex-1 rounded-2xl border border-fuchsia-200/30 bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3.5 text-sm font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isGenerating ? "Generating with AI..." : "Remix Character"}
            </button>
            <button
              type="button"
              onClick={onGenerateImage}
              disabled={isImageLoading || isGenerating}
              className="min-w-[190px] flex-1 rounded-2xl border border-cyan-200/30 bg-cyan-300/10 px-5 py-3.5 text-sm font-black text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.16)] transition hover:-translate-y-0.5 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isImageLoading ? "Creating image..." : "Generate AI Image"}
            </button>
            <button
              type="button"
              onClick={onToggleLike}
              aria-label="Favorite character"
              className={`grid size-12 place-items-center rounded-2xl border text-lg font-black transition ${
                liked
                  ? "border-fuchsia-200/40 bg-fuchsia-300/20 text-fuchsia-100 shadow-[0_0_24px_rgba(168,85,247,0.28)]"
                  : "border-white/10 bg-white/[0.05] text-slate-300 hover:border-fuchsia-300/35 hover:text-white"
              }`}
            >
              ♥
            </button>
            <button
              type="button"
              aria-label="Download character"
              onClick={() =>
                onStatus("Downloads will export generated cards after public images are stored.")
              }
              className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-lg font-black text-slate-300 transition hover:border-cyan-300/35 hover:text-white"
            >
              ⇩
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <CharacterVisual character={card} />
          <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            {card.imageUrl
              ? `AI IMAGE ACTIVE / ${theme.label} / 2.5D motion stage`
              : "CSS FALLBACK ACTIVE"}
          </p>
        </div>
      </div>
    </section>
  );
}

function BottomCards({
  card,
  onStatus,
}: {
  card: CharacterCard;
  onStatus: (message: string) => void;
}) {
  const leaderboard = [
    ["SG", "SolGuardian", "12.4K"],
    ["NS", "NeonSamurai", "9.8K"],
    ["CK", "CyberKoi", "8.6K"],
  ] as const;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <article className="glass-panel hover-lift rounded-[1.35rem] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white">
              Share Your Creation
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Show off {card.name} to the world.
            </p>
          </div>
          <span className="grid size-11 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-xl font-black text-cyan-100">
            ↗
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["X", "Discord", "Telegram", "Reddit", "Link"].map((social) => (
            <button
              key={social}
              type="button"
              onClick={() =>
                onStatus(
                  "Sharing will be connected after public card pages are added.",
                )
              }
              className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
            >
              {social}
            </button>
          ))}
        </div>
      </article>

      <article className="glass-panel hover-lift rounded-[1.35rem] p-4">
        <div className="flex gap-4">
          <div className="collectible-preview relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-fuchsia-300/30 bg-[#070a17]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(250,204,21,0.34),transparent_24%),linear-gradient(145deg,rgba(34,211,238,0.18),rgba(168,85,247,0.28),rgba(2,6,23,0.96))]" />
            <div className="absolute left-1/2 top-6 grid size-10 -translate-x-1/2 place-items-center rounded-full bg-amber-300 text-lg shadow-[0_0_30px_rgba(250,204,21,0.45)]">
              ⚡
            </div>
            <div className="absolute inset-x-3 bottom-3 h-2 rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-white">Collect & Trade</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Mint as an NFT and list on the marketplace.
            </p>
            <button
              type="button"
              onClick={() =>
                onStatus("NFT minting will unlock after Solana integration.")
              }
              className="mt-3 rounded-2xl border border-fuchsia-200/30 bg-fuchsia-300/15 px-4 py-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-300/25"
            >
              Mint NFT
            </button>
          </div>
        </div>
      </article>

      <article className="glass-panel hover-lift rounded-[1.35rem] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white">Leaderboard</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Top creators this week
            </p>
          </div>
          <span className="grid size-11 place-items-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-xl font-black text-amber-100">
            ♛
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {leaderboard.map(([initials, name, score], index) => (
            <div
              key={name}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2"
            >
              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-[10px] font-black text-white">
                {initials}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-200">
                {index + 1}. {name}
              </span>
              <span className="text-sm font-black text-cyan-100">{score}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            onStatus(
              "Leaderboard will activate after cards are saved to database.",
            )
          }
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-black text-white transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
        >
          View Leaderboard
        </button>
      </article>
    </div>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [selectedStyle, setSelectedStyle] = useState("Cyberpunk");
  const [card, setCard] = useState<CharacterCard>(defaultCard);
  const [liked, setLiked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [, setGenerationIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    "AI Mode: Groq Text + Free Image is ready. Generate images only when you choose.",
  );

  const promptSignal = useMemo(() => {
    return Math.min(100, Math.max(22, Math.round(prompt.trim().length * 1.7)));
  }, [prompt]);

  function createFallbackCharacter(nextPrompt: string) {
    setGenerationIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      const nextCard = generateCharacter(
        nextPrompt,
        selectedStyle,
        nextIndex,
      );

      setLiked(false);
      setCard(nextCard);
      setStatusMessage(
        "AI generation failed, so VibeArena used local mock generation instead.",
      );

      return nextIndex;
    });
  }

  async function generateWithAi(nextPrompt: string) {
    const cleanPrompt = nextPrompt.trim();

    if (!cleanPrompt) {
      alert("Please describe your character first.");
      return;
    }

    setIsGenerating(true);
    setStatusMessage("Generating character text with Groq...");

    try {
      const response = await fetch("/api/generate-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: cleanPrompt,
          style: selectedStyle,
        }),
      });

      if (!response.ok) {
        throw new Error("Groq character generation failed.");
      }

      const nextCard = (await response.json()) as CharacterCard;

      setLiked(false);
      setCard(nextCard);
      setStatusMessage(
        `Real AI generated ${nextCard.name}. Image prompt is ready for free image generation.`,
      );
    } catch {
      createFallbackCharacter(cleanPrompt);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleGenerate() {
    void generateWithAi(prompt);
  }

  async function handleGenerateImage() {
    const imagePrompt = card.imagePrompt.trim();

    if (!imagePrompt) {
      setStatusMessage("No image prompt available yet. Generate a character first.");
      return;
    }

    const targetName = card.name;
    const targetVisualType = card.visualType;

    setIsImageLoading(true);
    setStatusMessage(`Creating free AI image for ${targetName}...`);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imagePrompt,
          characterName: targetName,
          origin: card.origin,
          power: card.power,
          weakness: card.weakness,
          catchphrase: card.catchphrase,
          rarity: card.rarity,
          visualType: targetVisualType,
          stylePreset: selectedStyle,
          originalPrompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Free AI image generation failed.");
      }

      const data: unknown = await response.json();

      if (!isImageGenerationResponse(data)) {
        throw new Error("Free AI image response was invalid.");
      }

      setCard((currentCard) => {
        if (
          currentCard.name !== targetName ||
          currentCard.imagePrompt !== imagePrompt
        ) {
          return currentCard;
        }

        return {
          ...currentCard,
          imageUrl: data.imageUrl,
        };
      });
      setStatusMessage(`Free AI image generated for ${targetName}.`);
    } catch {
      setStatusMessage(
        "Free AI image generation failed, so VibeArena kept the CSS visual fallback.",
      );
    } finally {
      setIsImageLoading(false);
    }
  }

  function handleSurprise() {
    const nextPrompt =
      surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];

    setPrompt(nextPrompt);
    void generateWithAi(nextPrompt);
  }

  function handleStyleChange(style: string) {
    setSelectedStyle(style);
    setStatusMessage(`${style} preset selected for the next generation.`);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(124,58,237,0.24),transparent_28%),radial-gradient(circle_at_88%_6%,rgba(34,211,238,0.18),transparent_26%),radial-gradient(circle_at_50%_96%,rgba(20,241,149,0.12),transparent_31%)]" />
        <div className="cyber-grid absolute inset-0 opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.88))]" />
      </div>

      <Header onStatus={setStatusMessage} />

      <div className="relative z-10 mx-auto grid max-w-[1760px] gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[190px_minmax(0,1fr)] lg:px-5">
        <Sidebar onStatus={setStatusMessage} />

        <div className="min-w-0 space-y-4">
          <StatusBanner
            message={statusMessage}
            onDismiss={() => setStatusMessage("Demo status dismissed.")}
          />

          <div className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
            <StudioPanel
              prompt={prompt}
              selectedStyle={selectedStyle}
              isGenerating={isGenerating}
              onPromptChange={setPrompt}
              onStyleChange={handleStyleChange}
              onGenerate={handleGenerate}
              onSurprise={handleSurprise}
              onStatus={setStatusMessage}
            />

            <ResultPanel
              card={card}
              liked={liked}
              isGenerating={isGenerating}
              isImageLoading={isImageLoading}
              onGenerate={handleGenerate}
              onGenerateImage={() => void handleGenerateImage()}
              onToggleLike={() => {
                setLiked((value) => !value);
                setStatusMessage(
                  liked
                    ? "Removed from favorites."
                    : `${card.name} added to favorites locally.`,
                );
              }}
              onStatus={setStatusMessage}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Prompt Signal", `${promptSignal}%`, "Clean creative input"],
              [
                "Visual Type",
                visualThemes[card.visualType].label,
                card.imageUrl ? "AI IMAGE ACTIVE" : "CSS FALLBACK ACTIVE",
              ],
              ["Rarity Lock", card.rarity, "Current generation tier"],
            ].map(([label, value, hint]) => (
              <div
                key={label}
                className="glass-panel rounded-[1.2rem] px-4 py-3"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                  {label}
                </p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="truncate text-2xl font-black text-white">
                    {value}
                  </p>
                  <p className="text-right text-xs text-slate-500">{hint}</p>
                </div>
              </div>
            ))}
          </div>

          <BottomCards card={card} onStatus={setStatusMessage} />
        </div>
      </div>
    </main>
  );
}
