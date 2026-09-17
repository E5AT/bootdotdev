import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { asc, eq, desc } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getChirps(authorId?: string, sortOrder: "asc" | "desc" = "asc") {
  const orderFn = sortOrder == "desc" ? desc : asc;

  if (authorId) {
    return await db
      .select()
      .from(chirps)
      .where(eq(chirps.userId, authorId))
      .orderBy(orderFn(chirps.createdAt));
  }

  return await db
    .select()
    .from(chirps)
    .orderBy(orderFn(chirps.createdAt));
}

export async function getChirpById(id: string) {
  const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, id));
  return result;
}

export async function deleteChirpById(id: string) {
  const [result] = await db
    .delete(chirps)
    .where(eq(chirps.id, id))
    .returning();
  return result;
}