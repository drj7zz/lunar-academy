"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";

type StoryIntroProps = {
  callsign: string;
  onSkip: () => void;
  onComplete: () => void;
};

const STORY_BEATS = [
  {
    step: "THE SIGNAL",
    title: "A call from Shackleton Crater",
    narration: "Far below Earth, a small habitat blinks against the crater's shadow. Its crew has sent a message: supplies are running low.",
    art: "signal",
  },
  {
    step: "THE CREW",
    title: "Meet Pip and the explorers",
    narration: "Pip rolls out to greet you. Four lunar explorers have kept the base running, but they need a teammate to help with the hard choices.",
    art: "crew",
  },
  {
    step: "THE JOURNEY",
    title: "Set course for the Moon",
    narration: "You climb aboard the Starling and leave Earth behind. Ahead, Shackleton Crater grows brighter in the shuttle window.",
    art: "flight",
  },
  {
    step: "TOUCHDOWN",
    title: "Home on the lunar surface",
    narration: "The Starling settles beside the habitat. Outside is silent, dusty, and cold. Inside, your crew is waiting.",
    art: "landing",
  },
  {
    step: "THE CHALLENGE",
    title: "Every system is connected",
    narration: "Power runs the heaters. Water supports life and helps shield the crew. Each plan helps one system and may strain another.",
    art: "systems",
  },
  {
    step: "YOUR MISSION",
    title: "Lead the next seven days",
    narration: "Choose a plan each day, watch the five base systems, and ask Earth for advice. You're mission lead now, {callsign}.",
    art: "mission",
  },
] as const;

type StoryArt = (typeof STORY_BEATS)[number]["art"];

function Astronaut({ x, accent }: { x: number; accent: string }) {
  return (
    <g transform={`translate(${x} 310)`}>
      <path d="m17 48-5 25m29-25 6 25m-31-18-9 10m39-11 8 9" fill="none" stroke="var(--art-suit)" strokeLinecap="round" strokeWidth="8" />
      <path d="M13 38h34l4 25H9l4-25Z" fill="var(--art-suit)" stroke="var(--art-outline)" strokeWidth="3" />
      <path d="M20 50h20v7H20z" fill={accent} />
      <rect x="17" y="5" width="27" height="31" rx="13" fill="var(--art-suit)" stroke="var(--art-outline)" strokeWidth="3" />
      <path d="M21 19c0-7 4-10 10-10s10 4 10 10v6H21v-6Z" fill="var(--art-glass)" stroke="var(--art-glass-light)" strokeWidth="2" />
      <path d="M23 16c3-4 8-5 12-3" fill="none" stroke="var(--art-suit)" strokeLinecap="round" strokeWidth="2" />
      <path d="M14 68h13m10 0h12" stroke={accent} strokeLinecap="round" strokeWidth="5" />
    </g>
  );
}

function Pip() {
  return (
    <g transform="translate(360 316)">
      <path d="M28 0v11m-5-9h10" stroke="var(--art-suit)" strokeLinecap="round" strokeWidth="4" />
      <rect x="4" y="12" width="48" height="40" rx="13" fill="var(--art-pip-shell)" stroke="var(--art-outline)" strokeWidth="3" />
      <rect x="10" y="20" width="36" height="17" rx="7" fill="var(--art-pip-display)" />
      <circle cx="21" cy="28" r="3" fill="var(--air-water)" />
      <circle cx="35" cy="28" r="3" fill="var(--air-water)" />
      <path d="M21 33q7 7 14 0m-20 20v8m26-8v8M4 28H0m56 0h-4" fill="none" stroke="var(--art-pip-highlight)" strokeLinecap="round" strokeWidth="4" />
      <path d="M15 51v5m26-5v5" stroke="var(--art-outline)" strokeLinecap="round" strokeWidth="4" />
    </g>
  );
}

function Habitat() {
  return (
    <g className="story-habitat">
      <ellipse cx="382" cy="414" rx="224" ry="15" fill="var(--art-shadow)" opacity=".35" />
      <path d="M274 344c0-53 43-96 96-96h27c53 0 96 43 96 96v59H274v-59Z" fill="var(--art-habitat)" stroke="var(--art-outline)" strokeWidth="7" />
      <path d="M293 346c0-42 34-76 76-76h29c42 0 76 34 76 76v39H293v-39Z" fill="var(--art-habitat-glass)" stroke="var(--art-outline)" strokeWidth="5" />
      <path d="M389 273v111m-94-38h180" stroke="var(--art-habitat)" strokeWidth="6" />
      <path d="M228 365h-69v34h69m260-34h71v34h-71" fill="var(--art-panel)" stroke="var(--art-outline)" strokeLinejoin="round" strokeWidth="5" />
      <path d="M167 370h51m276 0h52" stroke="var(--stage-water)" strokeWidth="3" />
      <path d="m185 367 5 29m15-29 5 29m248-29-5 29m-15-29-5 29" stroke="var(--art-glass-light)" strokeWidth="2" />
    </g>
  );
}

function StoryIllustration({ art }: { art: StoryArt }) {
  return (
    <svg
      aria-hidden="true"
      className={`story-illustration illustration-${art}`}
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 760 470"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="illustration-stars" fill="var(--art-star)">
        <path d="m125 73 5 13 13 5-13 5-5 13-5-13-13-5 13-5 5-13Z" />
        <path d="m550 82 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z" />
        <path d="m294 45 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />
        <circle cx="220" cy="126" r="3" />
        <circle cx="612" cy="165" r="3" />
        <circle cx="478" cy="58" r="2.5" />
      </g>

      <g className="illustration-earth">
        <circle cx="637" cy="105" r="39" fill="var(--art-earth-ocean)" stroke="var(--art-glass-light)" strokeWidth="4" />
        <path d="m609 91 9-12 10 2 6 9-7 6-2 12-8 3-6-10-8-2zm38-13 11 4 5 9-9 6-4 13-8-4-3-11 5-9z" fill="var(--art-earth-land)" />
        <path d="M615 84c8-9 18-13 29-14" fill="none" stroke="var(--art-suit)" strokeLinecap="round" strokeOpacity=".7" strokeWidth="3" />
      </g>
      <g className="illustration-moon">
        <circle cx="118" cy="120" r="42" fill="var(--art-moon)" stroke="var(--art-outline)" strokeWidth="4" />
        <circle cx="104" cy="108" r="7" fill="var(--art-moon-crater)" />
        <circle cx="133" cy="132" r="10" fill="var(--art-moon-crater)" />
        <circle cx="124" cy="95" r="4" fill="var(--art-moon-crater)" />
      </g>

      {art === "flight" ? (
        <g className="story-flight">
          <path d="M177 253c103-134 281-157 399-54" fill="none" stroke="var(--art-route)" strokeDasharray="9 12" strokeLinecap="round" strokeWidth="4" />
          <g transform="translate(365 195) rotate(34)">
            <path d="M27 5c16 17 20 47 10 68H17C7 52 11 22 27 5Z" fill="var(--art-suit)" stroke="var(--art-outline)" strokeLinejoin="round" strokeWidth="5" />
            <circle cx="27" cy="34" r="9" fill="var(--art-glass)" stroke="var(--art-outline)" strokeWidth="3" />
            <path d="m17 56-15 17h20m15-17 15 17H32" fill="var(--art-amber)" stroke="var(--art-outline)" strokeLinejoin="round" strokeWidth="4" />
            <path d="M22 73h10l-5 18-5-18Z" fill="var(--art-coral)" />
          </g>
          <path d="m283 265 6-18m26-28 4-18" stroke="var(--art-star)" strokeLinecap="round" strokeWidth="5" />
        </g>
      ) : (
        <>
          <path d="M0 400q150-90 290-38t267 4q112-42 203 4v100H0Z" fill="var(--art-surface-far)" />
          <path d="M0 428q170-47 305-16t246 0q130-33 209-3v61H0Z" fill="var(--art-surface)" />
          <path d="M63 417q105-33 202 0m265-12q74-25 150-1" fill="none" stroke="var(--art-surface-mark)" strokeLinecap="round" strokeWidth="5" opacity=".65" />
          <path d="M0 393q122-80 246 0m268-5q125-80 246 0" fill="none" stroke="var(--art-surface-mark)" strokeWidth="5" opacity=".7" />
          {(art === "signal" || art === "landing" || art === "systems") && <Habitat />}
          {art === "signal" && (
            <g className="story-signal">
              <path d="M500 291q31 25 0 51m15-65q49 40 0 79m14-94q67 54 0 109" fill="none" stroke="var(--art-warm-light)" strokeLinecap="round" strokeWidth="6" />
              <circle cx="502" cy="317" r="8" fill="var(--art-warm-light)" />
            </g>
          )}
          {art === "crew" && (
            <>
              <Astronaut accent="var(--art-amber)" x={231} />
              <Astronaut accent="var(--art-coral)" x={305} />
              <Astronaut accent="var(--art-mint)" x={480} />
              <Pip />
              <path d="m421 297 6 14 14 6-14 6-6 14-6-14-14-6 14-6 6-14Z" fill="var(--art-warm-light)" />
            </>
          )}
          {art === "landing" && (
            <>
              <Astronaut accent="var(--art-amber)" x={274} />
              <Astronaut accent="var(--art-coral)" x={424} />
              <g transform="translate(565 302)">
                <path d="m26 5 24 27-8 31H10L2 32 26 5Z" fill="var(--art-amber)" stroke="var(--art-outline)" strokeLinejoin="round" strokeWidth="4" />
                <circle cx="26" cy="31" r="7" fill="var(--art-glass)" stroke="var(--art-outline)" strokeWidth="3" />
                <path d="m11 56-10 18h18m20-18 10 18H31" fill="none" stroke="var(--art-suit)" strokeLinecap="round" strokeWidth="5" />
              </g>
            </>
          )}
          {art === "systems" && (
            <g className="story-system-orbits">
              <circle cx="379" cy="188" r="20" fill="var(--power)" stroke="var(--art-outline)" strokeWidth="4" />
              <circle cx="314" cy="147" r="15" fill="var(--air-water)" stroke="var(--art-outline)" strokeWidth="4" />
              <circle cx="444" cy="148" r="15" fill="var(--shields)" stroke="var(--art-outline)" strokeWidth="4" />
              <circle cx="300" cy="224" r="15" fill="var(--food)" stroke="var(--art-outline)" strokeWidth="4" />
              <circle cx="458" cy="223" r="15" fill="var(--crew-heat)" stroke="var(--art-outline)" strokeWidth="4" />
              <path d="m364 189-38-31m67 18 37-21m-67 38-42 26m67-22 44 21" stroke="var(--art-suit)" strokeDasharray="5 6" strokeWidth="3" />
            </g>
          )}
          {art === "mission" && (
            <>
              <Astronaut accent="var(--art-amber)" x={240} />
              <Astronaut accent="var(--art-coral)" x={323} />
              <Astronaut accent="var(--art-mint)" x={448} />
              <Pip />
              <path d="m390 205 6 15 15 6-15 6-6 15-6-15-15-6 15-6 6-15Zm-64-31 4 9 9 4-9 4-4 9-4-9-9-4 9-4 4-9Z" fill="var(--art-warm-light)" />
            </>
          )}
        </>
      )}
    </svg>
  );
}

export default function StoryIntro({
  callsign,
  onSkip,
  onComplete,
}: StoryIntroProps) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceError, setVoiceError] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const beat = STORY_BEATS[beatIndex];
  const progress = ((beatIndex + 1) / STORY_BEATS.length) * 100;
  const isLastBeat = beatIndex === STORY_BEATS.length - 1;

  useEffect(() => {
    setVoiceAvailable(
      "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
    );
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (!voiceAvailable || !voiceEnabled) {
      setVoicePlaying(false);
      return;
    }

    let active = true;
    const utterance = new SpeechSynthesisUtterance(
      beat.narration.replace("{callsign}", callsign),
    );
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1.04;
    utterance.onstart = () => {
      if (active) setVoicePlaying(true);
    };
    utterance.onend = () => {
      if (!active) return;
      setVoicePlaying(false);
      if (beatIndex === STORY_BEATS.length - 1) onComplete();
      else setBeatIndex((index) => index + 1);
    };
    utterance.onerror = (event) => {
      if (!active || event.error === "canceled" || event.error === "interrupted") return;
      setVoicePlaying(false);
      setVoiceError(true);
    };

    window.speechSynthesis.cancel();
    utteranceRef.current = utterance;
    setVoiceError(false);
    setVoicePlaying(true);
    window.speechSynthesis.speak(utterance);

    return () => {
      active = false;
      utterance.onstart = null;
      utterance.onend = null;
      utterance.onerror = null;
      window.speechSynthesis.cancel();
      if (utteranceRef.current === utterance) utteranceRef.current = null;
    };
  }, [beat.narration, beatIndex, callsign, onComplete, replayKey, voiceAvailable, voiceEnabled]);

  return (
    <section aria-label="Mission story introduction" className="story-screen">
      <div className="story-topline">
        <a aria-label="Lunar Academy" className="brand-lockup" href="/">
          <span aria-hidden="true" className="brand-mark">◕</span>
          <span>LUNAR <strong>ACADEMY</strong></span>
        </a>
        <div className="story-audio-controls">
          <button
            aria-pressed={voiceAvailable && voiceEnabled}
            className="story-voice"
            disabled={!voiceAvailable}
            onClick={() => setVoiceEnabled((enabled) => !enabled)}
            type="button"
          >
            {voiceEnabled ? <Volume2 aria-hidden="true" size={17} /> : <VolumeX aria-hidden="true" size={17} />}
            {voiceAvailable ? (voiceEnabled ? "Voice on" : "Voice off") : "Voice unavailable"}
          </button>
          {voiceAvailable && voiceEnabled && (
            <button
              aria-label="Replay this scene"
              className="story-replay"
              onClick={() => setReplayKey((key) => key + 1)}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={17} />
            </button>
          )}
          <button className="story-skip" onClick={onSkip} type="button">
            <SkipForward aria-hidden="true" size={16} /> Skip story
          </button>
        </div>
      </div>

      <div className={`story-card story-art-${beat.art}`}>
        <div className="story-sky">
          <div className="story-scene-heading">
            <span>SHACKLETON CRATER</span>
            <span>MOON BASE · {callsign.toUpperCase()}</span>
          </div>
          <StoryIllustration art={beat.art} />
          <div className="story-surface-label">LUNAR SURFACE · 1/6 EARTH GRAVITY</div>
        </div>

        <div className="story-copy">
          <div className="story-progress-label">
            <span>YOUR STORY</span>
            <strong>0{beatIndex + 1} <span>/ 0{STORY_BEATS.length}</span></strong>
          </div>
          <div
            aria-label={`Story progress ${Math.round(progress)} percent`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(progress)}
            className="story-progress"
            role="progressbar"
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <nav aria-label="Story scenes" className="story-scene-nav">
            {STORY_BEATS.map((item, index) => (
              <button
                aria-current={index === beatIndex ? "step" : undefined}
                aria-label={`Scene ${index + 1}: ${item.step}`}
                className={index === beatIndex ? "is-current" : ""}
                key={item.step}
                onClick={() => setBeatIndex(index)}
                type="button"
              >
                {item.step}
              </button>
            ))}
          </nav>
          <p className="eyebrow">{beat.step}</p>
          <h1 aria-live="polite">{beat.title}</h1>
          <p className="story-narration" key={beat.title}>
            {beat.narration.replace("{callsign}", callsign)}
          </p>
          <p aria-live="polite" className="story-voice-status" role="status">
            {voiceError
              ? "Voice playback stopped. Use Next scene to continue."
              : voicePlaying
                ? "Listening to this scene…"
                : voiceEnabled && voiceAvailable
                  ? "Scene narration complete."
                  : "Read the scene, then continue when you're ready."}
          </p>
          <div className="story-navigation">
            <button
              aria-label="Previous story scene"
              className="story-previous"
              disabled={beatIndex === 0}
              onClick={() => setBeatIndex((index) => Math.max(0, index - 1))}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={18} />
              Back
            </button>
            <button
              className="story-next"
              onClick={() => {
                if (isLastBeat) onComplete();
                else setBeatIndex((index) => index + 1);
              }}
              type="button"
            >
              {isLastBeat ? "Start mission" : "Next scene"}
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </div>
          <p className="story-footer-note">
            {isLastBeat ? "YOUR CREW IS COUNTING ON YOU" : "TAKE YOUR TIME · YOUR ADVENTURE IS JUST BEGINNING"}
          </p>
        </div>
      </div>
    </section>
  );
}
