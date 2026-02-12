import { beforeEach, describe, expect, it, vi } from "vitest";

describe("storage fallback and migration detection", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("persists clips through localStorage-backed repo", async () => {
    const clipRepo = await import("@/storage/clipRepo");

    await clipRepo.upsert({
      id: "clip-1",
      youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
      videoId: "dQw4w9WgXcQ",
      title: "test",
      durationSec: 30,
      captionsAvailable: "unknown",
    });

    const clips = await clipRepo.getAll();
    expect(clips).toHaveLength(1);
    expect(clips[0].id).toBe("clip-1");
  });

  it("marks migrationRequired when legacy keys exist", async () => {
    localStorage.setItem(
      "lingoplay_clips",
      JSON.stringify([{ id: "legacy-clip", sentences: [{ id: "s1", text: "legacy" }] }])
    );

    const metaRepo = await import("@/storage/metaRepo");
    const status = await metaRepo.getStorageStatus();

    expect(status.migrationRequired).toBe(true);
  });
});
