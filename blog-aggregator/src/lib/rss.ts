import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    const response = await fetch(feedURL, {
        headers: {
            "User-Agent": "gator",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }

    const xmlText = await response.text();

    const parser = new XMLParser({
        processEntities: false,
        ignoreAttributes: false,
    });

    const parsed = parser.parse(xmlText);

    if (!parsed.rss || !parsed.rss.channel) {
        throw new Error("Invalid RSS feed structure: missing channel field.");
    }

    const channel = parsed.rss.channel;

    const title = typeof channel.title === "string" ? channel.title : "";
    const link = typeof channel.link === "string" ? channel.link : "";
    const description = typeof channel.description === "string" ? channel.description : "";

    if (!title || !link) {
        throw new Error("Invalid RSS channel metadata: missing title or link");
    }

    let rawItems = channel.item;
    const items: RSSItem[] = [];

    if (rawItems) {
        const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems];

        for (const item of itemArray) {
            const itemTitle = typeof item.title === "string" ? item.title : "";
            const itemLink = typeof item.link === "string" ? item.link : "";
            const itemDescription = typeof item.description === "string" ? item.description : "";
            const itemPubDate = typeof item.pubDate === "string" ? item.pubDate : "";

            if (!itemTitle || !itemLink) {
                continue;
            }

            items.push({
                title: itemTitle,
                link: itemLink,
                description: itemDescription,
                pubDate: itemPubDate,
            });
        }
    }

            return {
                channel: {
                    title,
                    link,
                    description,
                    item: items,
                },
            };
}
