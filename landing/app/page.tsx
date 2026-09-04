"use client";

import Prism from "./components/Prism";
import CopyButton from "./components/CopyButton";
import { Tooltip } from "@/components/ui/tooltip-card";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black font-sans">
      <div className="absolute inset-0">
        <Prism
          animationType="hover"
          timeScale={0.5}
          height={3.5}
          baseWidth={4}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
          suspendWhenOffscreen={true}
        />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <Tooltip
          content="This is an X (Twitter) handle. Click to open in a new tab."
          containerClassName="text-zinc-50"
        >
          <a
            href="https://x.com/rsaipuneeth"
            target="_blank"
            rel="noopener noreferrer"
            className="text-5xl font-bold tracking-tight text-zinc-50 underline decoration-zinc-500 underline-offset-8 transition-colors hover:text-zinc-300 sm:text-6xl"
          >
            @rsaipuneeth
          </a>
        </Tooltip>
        <p className="max-w-md text-lg text-zinc-300">
          A portfolio{" "}
          <Tooltip
            content="A TUI (Text User Interface) is a terminal-based app you control with your keyboard — no browser needed."
            containerClassName="underline decoration-zinc-500 decoration-1 underline-offset-4"
          >
            <span className="font-semibold text-zinc-100">TUI</span>
          </Tooltip>{" "}
          built in{" "}
          <Tooltip
            content="Rust is a fast, memory-safe systems language loved for building reliable, high-performance tools."
            containerClassName="underline decoration-zinc-500 decoration-1 underline-offset-4"
          >
            <span className="font-semibold text-zinc-100">Rust</span>
          </Tooltip>{" "}
          with{" "}
          <Tooltip
            content="Ratatui is a Rust library for building rich terminal user interfaces with an Elm-inspired architecture."
            containerClassName="underline decoration-zinc-500 decoration-1 underline-offset-4"
          >
            <span className="font-semibold text-zinc-100">Ratatui</span>
          </Tooltip>{" "}
          — packaged with{" "}
          <Tooltip
            content="npm is the Node package manager — running one command installs and runs this TUI on any machine."
            containerClassName="underline decoration-zinc-500 decoration-1 underline-offset-4"
          >
            <span className="font-semibold text-zinc-100">npm</span>
          </Tooltip>{" "}
          and fully platform-independent.
        </p>
        <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-sm">
          <code className="font-mono text-sm text-zinc-100">
            npx portfoliotui@latest
          </code>
          <CopyButton />
        </div>
        <Tooltip
          content="This opens my portfolio website in a new window."
          containerClassName="text-zinc-50 -mt-7"
        >
          <a
            href="https://www.saipuneeth.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-100 underline decoration-zinc-500 underline-offset-4 transition-colors hover:text-white"
          >
            https://www.saipuneeth.me
          </a>
        </Tooltip>
      </div>
    </div>
  );
}
