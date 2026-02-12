import { Clip } from "@/lib/types";
import { getFromStore, listFromStore, removeFromStore, upsertToStore } from "@/storage/db";

export async function getAll(): Promise<Clip[]> {
  return listFromStore("clips");
}

export async function getById(id: string): Promise<Clip | undefined> {
  return getFromStore("clips", id);
}

export async function upsert(clip: Clip): Promise<void> {
  await upsertToStore("clips", clip);
}

export async function remove(id: string): Promise<void> {
  await removeFromStore("clips", id);
}
