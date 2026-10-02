import { describe, expect, it } from "vitest";
import {
  containerVariants,
  fadeInUp,
  fadeInUpWithDelay,
  imageScale,
  itemVariants,
  scaleIn,
  scaleInWithDelay,
  slideInLeft,
  slideInLeftWithDelay,
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
