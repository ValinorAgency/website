"use client";

import { cubicBezier, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const expo = cubicBezier(0.16, 1, 0.3, 1);

type FeatureCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
  className?: string;
  children?: ReactNode;
  delay?: number;
};

export default function FeatureCard({
  title,
  description,
  icon,
  accent,
  className = "",
  children,
  delay = 0,
}: FeatureCardProps) {
  const reduceMotion = useReducedMotion();
  const iconBackground =
    accent === "var(--brand)"
      ? "var(--brand-xlight)"
      : accent === "var(--accent)"
        ? "var(--accent-light)"
        : "var(--accent-2-light)";

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduceMotion ? 0 : 0.55, delay, ease: expo }}
      className={`surface-card rounded-[1.5rem] p-6 sm:p-7 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: iconBackground }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{description}</p>
        </div>
      </div>

      {children ? <div className="mt-5 border-t border-[var(--border)] pt-5">{children}</div> : null}
    </motion.article>
  );
}
