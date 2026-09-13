import { db } from "../index.js";
import { feedFollows, feeds, users } from "../schema.js";
import { eq, and, sql } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db
        .insert(feeds)
        .values({
            name,
            url,
            userId,
        })
        .returning();
    return result;
}

export async function getFeedsWithUser() {
    const result = await db
        .select({
            id: feeds.id,
            name: feeds.name,
            url: feeds.url,
            createdAt: feeds.createdAt,
            updatedAt: feeds.updatedAt,
            userId: feeds.userId,
            userName: users.name,
        })
        .from(feeds)
        .innerJoin(users, eq(feeds.userId, users.id));
    return result;
}

export async function getFeedByUrl(url: string) {
    const [result] = await db
        .select()
        .from(feeds)
        .where(eq(feeds.url, url))
        .limit(1);
    return result;
}

export async function createFeedFollow(userId: string, feedId: string) {
    const [newFollow] = await db
        .insert(feedFollows)
        .values({ userId, feedId })
        .returning();

    const [result] = await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            userId: feedFollows.userId,
            feedId: feedFollows.feedId,
            feedName: feeds.name,
            userName: users.name,
            feedUrl: feeds.url,
        })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.id, newFollow.id))
        .limit(1);

    return result;
}

export async function getFeedFollowsForUser(userName: string) {
    return await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            userId: feedFollows.userId,
            feedId: feedFollows.feedId,
            feedName: feeds.name,
            userName: users.name,
            feedUrl: feeds.url,
        })
        .from(feedFollows)
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .where(eq(users.name, userName));
}

export async function deleteFeedFollow(userId: string, url: string) {
    const feed = await getFeedByUrl(url);
    if (!feed) {
        throw new Error(`Feed with URL '${url}' not found`);
    }

    const result = await db
        .delete(feedFollows)
        .where(
            and(
                eq(feedFollows.userId, userId),
                eq(feedFollows.feedId, feed.id)
            )
        )
        .returning();

        return result[0];
}

export async function markFeedFetched(feedId: string) {
    const [result] = await db
        .update(feeds)
        .set({
            lastFetchedAt: new Date().toISOString(),
            updatedAt: new Date(),
        })
        .where(eq(feeds.id, feedId))
        .returning();
    return result;
}

export async function getNextFeedToFetch() {
    const [result] = await db
        .select()
        .from(feeds)
        .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
        .limit(1);
    return result;
}
