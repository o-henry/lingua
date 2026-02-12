import { SrsCard } from "@/lib/types";
import { getTodayDateKey } from "@/domain/srsScheduler";
import { listFromStore, removeFromStore, upsertToStore } from "@/storage/db";

export async function getAll(): Promise<SrsCard[]> {
  return listFromStore("srsCards");
}

export async function getDue(date = getTodayDateKey()): Promise<SrsCard[]> {
  const all = await getAll();
  return all
    .filter((card) => card.dueDate <= date)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
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
