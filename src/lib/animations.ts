// Motion is intentionally fast and subtle: short travel, quick easing, no
// compounding per-item delays. Reduced-motion is handled globally via
// <MotionConfig reducedMotion="user">, transforms are dropped and only
// opacity remains for users who request reduced motion.

const DURATION = 0.25;

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION } },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION },
};

export const fadeInUpWithDelay = (delay: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION, delay },
});

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: DURATION },
};

export const scaleInWithDelay = (delay: number) => ({
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: DURATION, delay },
});

export const slideInLeft = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: DURATION },
};

export const slideInLeftWithDelay = (delay: number) => ({
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: DURATION, delay },
});

export const imageScale = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: DURATION },
};

// --- Intro animations --------------------------------------------------
// Hero entrance animations play exactly once per page lifetime: on the
// initial load. Client-side navigations already crossfade via the View
// Transitions API, and replaying mount animations on top of that reads
// as a double blink (most visible on the hero headshot).

import { createContext, useContext } from "react";

let introAnimationPlayed = false;

/** True only on the first call per page lifetime (resets on full reload). */
export function consumeIntroAnimation(): boolean {
  if (introAnimationPlayed) return false;
  introAnimationPlayed = true;
  return true;
}

type MountVariant = {
  initial: { opacity: number; [key: string]: number };
  animate: { opacity: number; [key: string]: number };
  transition: { duration: number; delay?: number };
};

/**
 * Mount-animation props for the hero. When `play` is false the element
 * renders immediately in its final state (`initial: false`).
 */
export function introAnimation(play: boolean, variant: MountVariant) {
  return play ? variant : { ...variant, initial: false as const };
}

/**
 * Provided by ClientLayout (which persists across SPA navigations).
 * True only for the initial page load.
 */
export const IntroAnimationContext = createContext(true);

export function useIntroAnimation() {
  return useContext(IntroAnimationContext);
}
