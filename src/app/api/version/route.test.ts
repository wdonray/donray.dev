import { GET } from "./route";
import { version } from "../../../../package.json";

describe("GET /api/version", () => {
  it("returns the package version with no-store caching", async () => {
    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(await res.json()).toEqual({ version });
    expect(typeof version).toBe("string");
  });
});
