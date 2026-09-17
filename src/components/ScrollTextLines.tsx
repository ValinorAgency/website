"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const ROLL_DURATION = 0.85;
const ROLL_EXIT_STAGGER = 0.3;
const CHAR_STAGGER = 0.045;
const LINE_HANDOFF_PAUSE = 0.25;
const LOOP_PAUSE = 2.2;

function tokenizeLine(text: string) {
  return text.split(/(\s+)/).reduce<{ token: string; isSpace: boolean; start: number }[]>(
    (acc, token) => {
      const isSpace = /^\s+$/.test(token);
      const prevEnd = acc.length > 0 ? acc[acc.length - 1].start + acc[acc.length - 1].token.length : 0;
      acc.push({ token, isSpace, start: prevEnd });
      return acc;
    },
    []
  );
}

function getLineRollSeconds(text: string) {
  const maxDelay = tokenizeLine(text).reduce((max, { token, isSpace, start }) => {
    if (isSpace) return max;
    return Math.max(max, (start + token.length - 1) * CHAR_STAGGER);
  }, 0);
  return maxDelay + ROLL_EXIT_STAGGER + ROLL_DURATION;
}

const LINE_META = [
  { direction: 1, tone: "primary" },
  { direction: -1, tone: "secondary" },
  { direction: 1, tone: "primary" },
] as const;

function RepeatedLine({ text }: { text: string }) {
  return (
    <>
      {[0, 1, 2].map((copy) => (
        <span key={copy}>
          {text}
          <i aria-hidden="true">•</i>
        </span>
      ))}
    </>
  );
}

function RollChar({ char, delay, playCount }: { char: string; delay: number; playCount: number }) {
  if (playCount === 0) {
    return <span className="scroll-roll-char-static">{char}</span>;
  }

  return (
    <span className="scroll-roll-char">
      <motion.span
        key={`enter-${playCount}`}
        className="scroll-roll-layer scroll-roll-layer-enter"
        initial={{ rotateX: 0, opacity: 1 }}
        animate={{ rotateX: 90, opacity: 0 }}
        transition={{ duration: ROLL_DURATION, ease: "easeIn", delay }}
      >
        {char}
      </motion.span>
      <motion.span
        key={`exit-${playCount}`}
        className="scroll-roll-layer scroll-roll-layer-exit"
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: ROLL_DURATION, ease: "easeIn", delay: delay + ROLL_EXIT_STAGGER }}
      >
        {char}
      </motion.span>
      <span className="scroll-roll-spacer">{char}</span>
    </span>
  );
}

function RollWord({ word, charOffset, playCount }: { word: string; charOffset: number; playCount: number }) {
  return (
    <span className="scroll-roll-word">
      {word.split("").map((char, i) => (
        <RollChar key={i} char={char} delay={(charOffset + i) * CHAR_STAGGER} playCount={playCount} />
      ))}
    </span>
  );
}

function RollLine({
  text,
  tone,
  reduceMotion,
  playCount,
}: {
  text: string;
  tone: string;
  reduceMotion: boolean | null;
  playCount: number;
}) {
  if (reduceMotion) {
    return <p className={`scroll-stack-line scroll-line-${tone}`}>{text}</p>;
  }

  const tokens = tokenizeLine(text);

  return (
    <p className={`scroll-stack-line scroll-line-${tone}`}>
      {tokens.map(({ token, isSpace, start }, index) =>
        isSpace ? (
          token
        ) : (
          <RollWord key={index} word={token} charOffset={start} playCount={playCount} />
        )
      )}
    </p>
  );
}

export default function ScrollTextLines() {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const stackInView = useInView(stackRef, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const t = useTranslations("scrollLines");
  const lineTexts = t.raw("lines") as string[];
  const lines = LINE_META.map((meta, index) => ({ ...meta, text: lineTexts[index] }));

  const [activeLine, setActiveLine] = useState(0);
  const [playCounts, setPlayCounts] = useState<number[]>(() => lines.map(() => 0));
  const startedRef = useRef(false);

  useEffect(() => {
    if (!stackInView || reduceMotion || startedRef.current) return;
    startedRef.current = true;
    setPlayCounts((counts) => counts.map((c, i) => (i === 0 ? c + 1 : c)));
  }, [stackInView, reduceMotion]);

  const activeLineText = lines[activeLine]?.text ?? "";
  const lineCount = lines.length;

  useEffect(() => {
    if (!stackInView || reduceMotion) return;
    const isLastLine = activeLine === lineCount - 1;
    const pause = isLastLine ? LOOP_PAUSE : LINE_HANDOFF_PAUSE;
    const seconds = getLineRollSeconds(activeLineText) + pause;
    const id = setTimeout(() => {
      const next = (activeLine + 1) % lineCount;
      setActiveLine(next);
      setPlayCounts((counts) => counts.map((c, i) => (i === next ? c + 1 : c)));
    }, seconds * 1000);
    return () => clearTimeout(id);
  }, [activeLine, stackInView, reduceMotion, activeLineText, lineCount]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineOneX = useTransform(scrollYProgress, [0, 1], ["-7%", "5%"]);
  const lineTwoX = useTransform(scrollYProgress, [0, 1], ["4%", "-8%"]);
  const lineThreeX = useTransform(scrollYProgress, [0, 1], ["-5%", "7%"]);
  const transforms = [lineOneX, lineTwoX, lineThreeX];

  return (
    <section
      ref={sectionRef}
      className="scroll-text-lines"
      aria-label={t("ariaLabel")}
    >
      <p className="sr-only">
        {lineTexts.join(" ")}
      </p>

      <div className="scroll-lines-visual" aria-hidden="true">
        {lines.map((line, index) => (
          <div className="scroll-line-clip" key={line.text}>
            <motion.div
              className={`scroll-line scroll-line-${line.tone}`}
              style={{ x: reduceMotion ? 0 : transforms[index] }}
            >
              <RepeatedLine text={line.text} />
            </motion.div>
          </div>
        ))}
      </div>

      <div className="scroll-lines-stack" aria-hidden="true" ref={stackRef}>
        {lines.map((line, index) => (
          <RollLine
            key={line.text}
            text={line.text}
            tone={line.tone}
            reduceMotion={reduceMotion}
            playCount={playCounts[index]}
          />
        ))}
      </div>

      <style>{`
        .scroll-text-lines {
          position: relative;
          z-index: 15;
          overflow: hidden;
          padding: clamp(3.5rem, 7vw, 6rem) 0 clamp(5rem, 9vw, 8rem);
          background: #08090d;
        }

        .scroll-lines-visual {
          display: grid;
          gap: clamp(.2rem, 1vw, .8rem);
          transform: rotate(-1.2deg) scale(1.025);
        }

        .scroll-line-clip {
          overflow: hidden;
        }

        .scroll-line {
          display: flex;
          width: max-content;
          align-items: center;
          white-space: nowrap;
          font-family: var(--font-display-stack);
          font-size: clamp(3.25rem, 8.4vw, 6rem);
          font-weight: 620;
          line-height: .9;
          letter-spacing: -.04em;
          will-change: transform;
        }

        .scroll-line span {
          display: inline-flex;
          align-items: center;
        }

        .scroll-line i {
          margin-inline: .22em;
          color: #24d6bc;
          font-size: .36em;
          font-style: normal;
        }

        .scroll-line-primary {
          color: #f1f1f3;
        }

        .scroll-line-secondary {
          color: #8e8e9a;
        }

        .scroll-lines-stack {
          display: none;
        }

        .scroll-stack-line {
          font-family: var(--font-display-stack);
          font-weight: 620;
          line-height: 1.15;
          letter-spacing: -.03em;
          margin: 0;
          perspective: 400px;
        }

        .scroll-roll-word {
          display: inline-block;
          white-space: nowrap;
        }

        .scroll-roll-char {
          position: relative;
          display: inline-block;
          perspective: 300px;
          transform-style: preserve-3d;
        }

        .scroll-roll-layer {
          position: absolute;
          top: 0;
          left: 0;
          display: inline-block;
          backface-visibility: hidden;
          will-change: transform;
        }

        .scroll-roll-layer-enter {
          transform-origin: 50% 25%;
        }

        .scroll-roll-layer-exit {
          transform-origin: 50% 100%;
        }

        .scroll-roll-spacer {
          visibility: hidden;
        }

        .scroll-roll-char-static {
          display: inline-block;
        }

        @media (max-width: 640px) {
          .scroll-text-lines {
            padding-block: 4rem 5.5rem;
          }

          .scroll-lines-visual {
            display: none;
          }

          .scroll-lines-stack {
            display: flex;
            flex-direction: column;
            gap: 2.2rem;
            padding-inline: 1.25rem;
          }

          .scroll-stack-line {
            font-size: clamp(2.3rem, 10vw, 3.1rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-line {
            will-change: auto;
          }
        }
      `}</style>
    </section>
  );
}