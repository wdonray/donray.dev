import { describe, expect, it } from "vitest";
import { getFaqJsonLd, getPersonJsonLd } from "./schema";

describe("getPersonJsonLd", () => {
  it("returns a valid Person schema", () => {
    const schema = getPersonJsonLd();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe("Donray Williams");
    expect(schema.jobTitle).toBe("Engineering Manager");
    expect(schema.worksFor.name).toBe("Justworks");
    expect(schema.url).toBe("https://www.donray.dev");
  });

  it("links the public profiles via sameAs", () => {
    const { sameAs } = getPersonJsonLd();
    expect(sameAs).toContain("https://github.com/wdonray");
    expect(sameAs).toContain("https://www.linkedin.com/in/donrayxwilliams/");
  });

  it("serializes to JSON without errors", () => {
    expect(() => JSON.stringify(getPersonJsonLd())).not.toThrow();
  });
});

describe("getFaqJsonLd", () => {
  it("returns a valid FAQPage schema", () => {
    const schema = getFaqJsonLd([
      { question: "What?", answer: "This." },
      { question: "Why?", answer: "Because." },
    ]);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0].name).toBe("What?");
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe("This.");
  });
});
