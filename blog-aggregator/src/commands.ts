import { readConfig, setUser } from "./config.js";
import { createFeed, createFeedFollow, deleteFeedFollow, getFeedByUrl, getFeedFollowsForUser, getFeedsWithUser, getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds.js";
import { createPost, getPostsForUser } from "./lib/db/queries/posts.js";
import { createUser, deleteAllUsers, getUserByName, getUsers } from "./lib/db/queries/users.js";
import { Feed, User } from "./lib/db/schema.js";
import { fetchFeed } from "./lib/rss.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

export type CommandRegistry = Record<string, CommandHandler>;

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]): Promise<void> => {
        const config = readConfig();
        if (!config.currentUserName) {
            throw new Error("No user is currently logged in.");
        }

        const user = await getUserByName(config.currentUserName);
        if (!user) {
            throw new Error(`User '${config.currentUserName}' not found`);
        }

        return handler(cmdName, user, ...args);
    }
}

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length === 0) {
        throw new Error("A username is required for the login command.");
    }

    const username = args[0];

    const user = await getUserByName(username);
    if(!user) {
        throw new Error(`User '${username}' does not exist.`);
    }

    setUser(username);
    console.log(`Current user has been set to '${username}'`);
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length === 0) {
        throw new Error("A username is required for the register command");
    }

    const name = args[0];
    const existingUser = await getUserByName(name);

    if (existingUser) {
        throw new Error(`User '${name}' already exists.`);
    }

    const user = await createUser(name);
    setUser(name);
    console.log(`User '${name}' created successfully!`);
    console.log(user);
}

export async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    await deleteAllUsers();
    console.log("Database state has been reset successfully.");
}

export async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
    const config = readConfig();
    const allUsers = await getUsers();

    for (const user of allUsers) {
        if (user.name === config.currentUserName) {
            console.log(`* ${user.name} (current)`);
        } else {
            console.log(`* ${user.name}`);
        }
    }
}

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length < 1) {
        throw new Error("Usage: agg <time_between_reqs>");
    }

    const durationStr = args[0];
    const timeBetweenReqs = parseDuration(durationStr);

    console.log(`Collecting feeds every ${durationStr}`);

    const handleError = (err: any) => {
        console.error(`Error in scrapeFeeds: ${err.message}`);
    };

    await scrapeFeeds().catch(handleError);
    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, timeBetweenReqs);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("\nShutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
}

export function printFeed(feed: Feed, user: User): void {
    console.log(`ID:        ${feed.id}`);
    console.log(`Created:   ${feed.createdAt}`);
    console.log(`Updated:   ${feed.updatedAt}`);
    console.log(`Name:      ${feed.name}`);
    console.log(`URL:       ${feed.url}`);
    console.log(`User:      ${user.name}`);
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]): Promise<void> {
  if (args.length < 2) {
    throw new Error("Usage: addfeed <name> <url>");
  }

  const name = args[0];
  const url = args[1];

  const feed = await createFeed(name, url, user.id);
  const followRecord = await createFeedFollow(user.id, feed.id);

  console.log("Feed created successfully:");
  printFeed(feed, user);
  console.log(`Feed '${followRecord.feedName}' followed by user '${followRecord.userName}'.`);
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
  if (args.length < 1) {
    throw new Error("Usage: follow <url>");
  }

  const url = args[0];
  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error(`Feed with URL '${url}' not found.`);
  }

  const followRecord = await createFeedFollow(user.id, feed.id);
  console.log(`Feed '${followRecord.feedName}' followed by user '${followRecord.userName}'.`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]): Promise<void> {
  const follows = await getFeedFollowsForUser(user.name);
  for (const follow of follows) {
    console.log(follow.feedName);
  }
}

export async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void> {
    const feedsList = await getFeedsWithUser();

    for (const feed of feedsList) {
        console.log(`Feed Name: ${feed.name}`);
        console.log(`URL:       ${feed.url}`);
        console.log(`Created By: ${feed.userName}`);
        console.log("-----------------------------------");
    }
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length < 1) {
        throw new Error(`Usage: unfollow <url>`);
    }

    const url = args[0];
    await deleteFeedFollow(user.id, url);
    console.log(`User '${user.name}' successfully unfollowed '${url}'.`);
}

export function registerCommand(registry: CommandRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandRegistry, cmdName: string, ...args: string[]): Promise<void> {
    const handler = registry[cmdName];
    
    if (!handler) {
        throw new Error(`Command not found: ${cmdName}`);
    }

    await handler(cmdName, ...args);
}

export function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);

    if (!match) {
        throw new Error(`Invalid duration format: ${durationStr}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch(unit) {
        case "ms":
            return value;
        case "s":
            return value * 1000;
        case "m":
            return value * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        default:
            throw new Error(`Unknown time unit: ${unit}`);
    }
}

export async function scrapeFeeds(): Promise<void> {
    const feed = await getNextFeedToFetch();
    if (!feed) {
        console.log("No feeds found to fetch");
        return;
    }

    await markFeedFetched(feed.id);
    console.log(`Fetching feed: ${feed.name} (${feed.url})`);

    try {
        const rssFeed = await fetchFeed(feed.url);
        console.log(`--- ${rssFeed.channel.title} (Found ${rssFeed.channel.item.length} posts) ---`);
        for (const item of rssFeed.channel.item) {
            const pubDate = parseDate(item.pubDate || item.published);
            await createPost(
                item.title || "Untitled",
                item.link || "",
                item.description || null,
                pubDate,
                feed.id
            );
        }
        console.log(`Saved posts for feed: ${feed.name}`);
    } catch (err: any) {
        console.error(`Error fetching feed ${feed.url}: ${err.message}`);
    }
}

function parseDate(dateStr?: string): Date | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

export async function handlerBrowse(cmdName: str, user: User, ...args: string[]): Promise<void> {
    let limit = 2;
    if (args.length > 0) {
        const parsed = parseInt(args[0], 10);
        if (!isNaN(parsed) && parsed > 0) {
            limit = parsed;
        }
    }

    const userPosts = await getPostsForUser(user.id, limit);
    if (userPosts.length === 0) {
        console.log("No posts found. Make sure you are following feeds that have posts!");
        return;
    }

    for (const post of userPosts) {
        console.log(`[${post.feedName}] ${post.title}`);
        console.log(`URL: ${post.url}`);
        if (post.description) {
            console.log(`Description: ${post.description.substring(0, 150)}...`);
        }
        console.log(`Published: ${post.publishedAt ? post.publishedAt.toISOString() : "Unknown"}`);
        console.log("--------------------------------------------------");
    }
}


