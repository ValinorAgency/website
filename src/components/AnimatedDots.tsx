"use client";

import { motion, useReducedMotion } from "framer-motion";

type AnimatedDotsProps = {
  className?: string;
  variant?: "hero" | "panel";
};

type Dot = {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  color: string;
};

const dots: Dot[] = [
  { left: "8%", top: "14%", size: 8, delay: 0, duration: 12, color: "var(--brand)" },
  { left: "16%", top: "62%", size: 5, delay: 0.8, duration: 14, color: "var(--ink-faint)" },
  { left: "27%", top: "26%", size: 4, delay: 0.4, duration: 11, color: "var(--brand)" },
  { left: "41%", top: "18%", size: 10, delay: 1.2, duration: 15, color: "var(--ink-muted)" },
  { left: "52%", top: "67%", size: 6, delay: 0.6, duration: 13, color: "var(--ink-faint)" },
  { left: "63%", top: "22%", size: 5, delay: 1, duration: 16, color: "var(--brand)" },
  { left: "76%", top: "48%", size: 9, delay: 0.2, duration: 14, color: "var(--ink-muted)" },
  { left: "84%", top: "16%", size: 4, delay: 1.4, duration: 12, color: "var(--ink-faint)" },
  { left: "90%", top: "63%", size: 7, delay: 0.7, duration: 15, color: "var(--brand)" },
];

export default function AnimatedDots({
  className = "",
  variant = "hero",
}: AnimatedDotsProps) {
  const reduceMotion = useReducedMotion();

  const isPanel = variant === "panel";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.86 0 0 / 0.5) 1px, transparent 1px)",
          backgroundSize: isPanel ? "30px 30px" : "34px 34px",
        }}
      />

      <div
        className="absolute rounded-full"
        style={{
          width: isPanel ? 360 : 720,
          height: isPanel ? 360 : 720,
          left: isPanel ? "-12%" : "auto",
          right: isPanel ? "auto" : "-12%",
          top: isPanel ? "10%" : "-10%",
          background:
            "radial-gradient(circle, oklch(0.18 0 0 / 0.09) 0%, transparent 70%)",
          filter: "blur(42px)",
        }}
      />

      <div
        className="absolute rounded-full"
        style={{
          width: isPanel ? 280 : 560,
          height: isPanel ? 280 : 560,
          left: isPanel ? "auto" : "-8%",
          right: isPanel ? "-10%" : "auto",
          bottom: isPanel ? "-14%" : "-12%",
          background:
            "radial-gradient(circle, oklch(0.3 0 0 / 0.08) 0%, transparent 70%)",
          filter: "blur(36px)",
        }}
      />

      {dots.map((dot, index) => (
        <motion.span
          key={`${dot.left}-${dot.top}-${index}`}
          className="absolute rounded-full"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            background: dot.color,
            opacity: isPanel ? 0.55 : 0.4,
            filter: "blur(0.25px)",
          }}
          animate={
            reduceMotion
              ? { opacity: isPanel ? 0.5 : 0.35 }
              : {
                  y: [0, -14, 0],
                  opacity: [0.35, 0.85, 0.35],
                }
          }
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
