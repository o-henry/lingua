import { SrsCard } from "@/lib/types";
import { getTodayDateKey } from "@/domain/srsScheduler";
import { listFromStore, removeFromStore, upsertToStore } from "@/storage/db";

export async function getAll(): Promise<SrsCard[]> {
  return listFromStore("srsCards");
}

export async function getDue(date = getTodayDateKey()): Promise<SrsCard[]> {
  const now = Date.now();
  const all = await getAll();
  return all
    .filter((card) => {
      if (Number.isFinite(card.dueAt)) {
        return (card.dueAt as number) <= now;
      }
      return card.dueDate <= date;
    })
    .sort((a, b) => {
      const aDue = Number.isFinite(a.dueAt) ? (a.dueAt as number) : new Date(`${a.dueDate}T00:00:00`).getTime();
      const bDue = Number.isFinite(b.dueAt) ? (b.dueAt as number) : new Date(`${b.dueDate}T00:00:00`).getTime();
      return aDue - bDue;
    });
}

export async function getByMemoryId(memoryId: string): Promise<SrsCard | undefined> {
  const all = await getAll();
  return all.find((card) => card.memoryId === memoryId);
}

export async function upsert(card: SrsCard): Promise<void> {
  await upsertToStore("srsCards", card);
}

export async function remove(id: string): Promise<void> {
  await removeFromStore("srsCards", id);
}
