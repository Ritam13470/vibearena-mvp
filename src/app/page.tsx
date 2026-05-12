"use client";

import { useState } from "react";

type BattleCard = {
  name: string;
  title: string;
  power: string;
  weakness: string;
  score: number;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [card, setCard] = useState<BattleCard | null>(null);

  function generateBattleCard() {
    if (!prompt.trim()) {
      alert("Please describe your character first.");
      return;
    }

    const randomScore = Math.floor(Math.random() * 41) + 60;

    const newCard: BattleCard = {
      name: "Solana Shadow",
      title: "AI-Born Arena Fighter",
      power: `Uses ${prompt} energy to dominate the arena.`,
      weakness: "Gets distracted by meme coins and shiny NFTs.",
      score: randomScore,
    };

    setCard(newCard);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-4 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
          Consumer Crypto x AI on Solana
        </p>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          VibeArena
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
          Generate AI-powered battle characters, connect your Solana wallet,
          and share your creations with the world.
        </p>

        <div className="mt-10 w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
          <label className="mb-3 block text-left text-sm font-medium text-zinc-300">
            Describe your character
          </label>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="h-32 w-full resize-none rounded-xl border border-zinc-700 bg-black p-4 text-white outline-none placeholder:text-zinc-500 focus:border-purple-500"
            placeholder="Example: A cyberpunk tiger warrior powered by Solana lightning..."
          />

          <button
            onClick={generateBattleCard}
            className="mt-4 w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-500"
          >
            Generate Battle Card
          </button>
        </div>

        {card && (
          <div className="mt-10 w-full max-w-xl rounded-3xl border border-purple-500/40 bg-gradient-to-br from-zinc-950 to-purple-950/40 p-6 text-left shadow-2xl">
            <p className="text-sm text-purple-300">Generated Battle Card</p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              {card.name}
            </h2>

            <p className="mt-1 text-zinc-400">{card.title}</p>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-purple-300">Power</p>
                <p className="mt-1 text-zinc-200">{card.power}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-purple-300">
                  Weakness
                </p>
                <p className="mt-1 text-zinc-200">{card.weakness}</p>
              </div>

              <div className="rounded-2xl border border-zinc-700 bg-black p-4">
                <p className="text-sm text-zinc-400">Battle Score</p>
                <p className="mt-1 text-4xl font-bold text-purple-300">
                  {card.score}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="font-semibold text-purple-300">AI Generated</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Create characters from simple prompts.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="font-semibold text-purple-300">Solana Ready</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Wallet connect and crypto features coming next.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="font-semibold text-purple-300">Shareable</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Turn every generated card into social content.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}