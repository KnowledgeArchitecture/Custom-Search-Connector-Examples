import { XMLParser } from 'fast-xml-parser';
import { writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { htmlToLlmText } from './htmlToLlmText.js';

const API_URL = 'https://api.knowledge-architecture.com/api';

function fetchVarsFromEnv() {
    const { CONNECTOR_ID, API_KEY, CATEGORY } = process.env;
    console.log('Fetched environment variables:', {
        CONNECTOR_ID: Boolean(CONNECTOR_ID),
        API_KEY: Boolean(API_KEY),
        CATEGORY: Boolean(CATEGORY),
    });
    if (!CONNECTOR_ID || !API_KEY || !CATEGORY) {
        throw new Error('Please set CONNECTOR_ID, API_KEY, and CATEGORY in the environment variables');
    }
    return { CONNECTOR_ID, API_KEY, CATEGORY };
}

async function fetchAndParseRSS(rssUrl: string) {
    const response = await fetch(rssUrl);
    const xmlData = await response.text();
    const parser = new XMLParser();
    return parser.parse(xmlData);
}

async function submitItem(sourceItem: Record<string, any>, connectorId: string, apiKey: string) {
    const fullUrl = `${API_URL}/SourceItem`;
    const apiKeyHeader = connectorId + ":" + apiKey;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-Api-Key", apiKeyHeader);
    myHeaders.append("Accept", "*/*");
    const body = JSON.stringify(sourceItem);

    const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: myHeaders,
        body: body,
    });

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return null;
    }
}

type Logger = Console['log'];

export async function main(logger:Logger) {
        const { CONNECTOR_ID, API_KEY, CATEGORY } = fetchVarsFromEnv();
        const RSS_URL = `https://www.knowledge-architecture.com/blog/category/${CATEGORY}?format=rss`;

        const json = await fetchAndParseRSS(RSS_URL);
        const rssItems = json.rss.channel.item;
        logger('total items:', rssItems.length);

        const map: Record<string, any> = {};
        rssItems.forEach((item: any) => {
            const linkHash = createHash('md5').update(item.link).digest('hex');
            const rfcDate = new Date(item.pubDate);
            const isoDate = rfcDate.toISOString();
            const body = item['content:encoded'] || item.description || '';
            map[linkHash] = {
                sourceItemId: linkHash,
                sourceItemUrl: item.link,
                sourceItemLastUpdatedAt: isoDate,
                sourceItemCreatedAt: isoDate,
                displayName: item.title,
                body: htmlToLlmText(body, {
                    preserveLinks: true,
                    includeUrls: true,
                    listBullet: '• '
                }),
                additionalSearchTerms: [item.category],
                lastSaved: new Date().toISOString(),
                lastSubmitted: null,
            };
        });

        writeFileSync('data/content.json', JSON.stringify(map, null, 2));

        for (const [key, item] of Object.entries(map)) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // delay to stay within api rate limits
            delete item.lastSaved;
            delete item.lastSubmitted;
            await submitItem(item, CONNECTOR_ID, API_KEY);
            map[key].lastSubmitted = new Date().toISOString();
        }
}
