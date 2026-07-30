"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const lines = [
  { text: "Sitios que comunican.", direction: 1, tone: "primary" },
  { text: "Tiendas que venden.", direction: -1, tone: "secondary" },
  { text: "Sistemas que ordenan.", direction: 1, tone: "primary" },
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

export default function ScrollTextLines() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
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
      aria-label="Soluciones digitales orientadas a objetivos"
    >
      <p className="sr-only">
        Sitios que comunican. Tiendas que venden. Sistemas que ordenan.
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

        @media (max-width: 640px) {
          .scroll-text-lines {
            padding-block: 2rem 5.5rem;
          }

          .scroll-lines-visual {
            gap: .45rem;
            transform: rotate(-1deg) scale(1.03);
          }

          .scroll-line {
            font-size: clamp(2.85rem, 15vw, 4.4rem);
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