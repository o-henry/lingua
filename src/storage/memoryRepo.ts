import { MemoryItem } from "@/lib/types";
import { getFromStore, listFromStore, removeFromStore, upsertToStore } from "@/storage/db";

export async function getAll(): Promise<MemoryItem[]> {
  return listFromStore("memoryItems");
}

export async function getById(id: string): Promise<MemoryItem | undefined> {
  return getFromStore("memoryItems", id);
}

export async function create(memoryItem: MemoryItem): Promise<void> {
  await upsertToStore("memoryItems", memoryItem);
}

export async function update(memoryItem: MemoryItem): Promise<void> {
  await upsertToStore("memoryItems", memoryItem);
}

export async function remove(id: string): Promise<void> {
  await removeFromStore("memoryItems", id);
}

export async function getByClipId(clipId: string): Promise<MemoryItem[]> {
  const all = await getAll();
  return all.filter((item) => item.ref.clipId === clipId);
}
