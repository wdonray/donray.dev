import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  IntroAnimationContext,
  containerVariants,
  fadeInUp,
  fadeInUpWithDelay,
  imageScale,
  introAnimation,
  itemVariants,
  scaleIn,
  scaleInWithDelay,
  slideInLeft,
  slideInLeftWithDelay,
  useIntroAnimation,
} from "./animations";

describe("animation variants", () => {
  it("keeps motion fast with a 0.25s duration", () => {
    expect(fadeInUp.transition).toMatchObject({ duration: 0.25 });
    expect(itemVariants.visible.transition).toMatchObject({ duration: 0.25 });
    expect(scaleIn.transition).toMatchObject({ duration: 0.25 });
    expect(slideInLeft.transition).toMatchObject({ duration: 0.25 });
    expect(imageScale.transition).toMatchObject({ duration: 0.25 });
  });

  it("fadeInUp rises 8px while fading in", () => {
    expect(fadeInUp.initial).toEqual({ opacity: 0, y: 8 });
    expect(fadeInUp.animate).toEqual({ opacity: 1, y: 0 });
  });

  it("fadeInUpWithDelay applies the given delay", () => {
    const variant = fadeInUpWithDelay(0.15);
    expect(variant.transition).toMatchObject({ duration: 0.25, delay: 0.15 });
    expect(variant.initial).toEqual(fadeInUp.initial);
    expect(variant.animate).toEqual(fadeInUp.animate);
  });

  it("containerVariants staggers children subtly", () => {
    expect(containerVariants.hidden).toEqual({ opacity: 0 });
    expect(containerVariants.visible.transition).toMatchObject({
      staggerChildren: 0.05,
    });
  });

  it("itemVariants matches the fade-up shape with a transition", () => {
    expect(itemVariants.hidden).toEqual({ opacity: 0, y: 8 });
    expect(itemVariants.visible).toEqual({
      opacity: 1,
      y: 0,
      transition: { duration: 0.25 },
    });
  });

  it("scale variants start at 0.96 scale", () => {
    expect(scaleIn.initial).toEqual({ opacity: 0, scale: 0.96 });
    expect(scaleIn.animate).toEqual({ opacity: 1, scale: 1 });
    expect(scaleInWithDelay(0.2).transition).toMatchObject({
      duration: 0.25,
      delay: 0.2,
    });
  });

  it("slideInLeft moves horizontally", () => {
    expect(slideInLeft.initial).toEqual({ opacity: 0, x: -8 });
    expect(slideInLeft.animate).toEqual({ opacity: 1, x: 0 });
    expect(slideInLeftWithDelay(0.3).transition).toMatchObject({
      duration: 0.25,
      delay: 0.3,
    });
  });

  it("imageScale reuses the scale-in variant", () => {
    expect(imageScale).toEqual(scaleIn);
  });
});

describe("intro animations", () => {
  it("consumeIntroAnimation is true only on the first call per page lifetime", async () => {
    vi.resetModules();
    const { consumeIntroAnimation } = await import("./animations");
    expect(consumeIntroAnimation()).toBe(true);
    expect(consumeIntroAnimation()).toBe(false);
    expect(consumeIntroAnimation()).toBe(false);
  });

  it("introAnimation plays the variant untouched on initial load", () => {
    const variant = fadeInUpWithDelay(0.1);
    expect(introAnimation(true, variant)).toBe(variant);
  });

  it("introAnimation renders the final state immediately on navigations", () => {
    const variant = fadeInUpWithDelay(0.1);
    const result = introAnimation(false, variant);
    expect(result.initial).toBe(false);
    expect(result.animate).toEqual(variant.animate);
    expect(result.transition).toEqual(variant.transition);
  });

  it("useIntroAnimation defaults to playing outside a provider", () => {
    const { result } = renderHook(() => useIntroAnimation());
    expect(result.current).toBe(true);
  });

  it("useIntroAnimation reads the provider value", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <IntroAnimationContext.Provider value={false}>
        {children}
      </IntroAnimationContext.Provider>
    );
    const { result } = renderHook(() => useIntroAnimation(), { wrapper });
    expect(result.current).toBe(false);
  });
});
