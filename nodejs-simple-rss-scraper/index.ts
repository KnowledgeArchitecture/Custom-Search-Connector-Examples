import { XMLParser } from 'fast-xml-parser';
import { writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { htmlToLlmText } from './htmlToLlmText.js';


const API_URL = 'https://api.knowledge-architecture.com/api';

const { CONNECTOR_ID, API_KEY, CATEGORY } = fetchVarsFromEnv();

const RSS_URL = `https://www.knowledge-architecture.com/blog/category/${CATEGORY}?format=rss`;

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

async function fetchAndParseRSS() {
    const response = await fetch(RSS_URL);
    const xmlData = await response.text();

    const parser = new XMLParser();
    return parser.parse(xmlData);

}

(async () => {
    const json = await fetchAndParseRSS();
    
    const rssItems = json.rss.channel.item;
    console.log('total items:', rssItems.length);

    // take the rss items and save them to an object with a hash of the link as the key
    // this allows us to easily look up the items later
    const map: Record<string, any> = {};
    rssItems.forEach((item: any) => {
        // md5 hash the item.link to use as the key
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
    
    // write the map to a JSON file with nice formatting
    writeFileSync('data/content.json', JSON.stringify(map, null, 2));

    for (const [key, item] of Object.entries(map)) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // delay to stay within api rate limits
        // item but without lastSaved or lastSubmitted
        delete item.lastSaved;
        delete item.lastSubmitted;
        await submitItem(item);
        map[key].lastSubmitted = new Date().toISOString();
    }

})();

async function submitItem(sourceItem: Record<string, any>) {
    const fullUrl = `${API_URL}/SourceItem`;
    const apiKey = CONNECTOR_ID + ":" + API_KEY;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-Api-Key", apiKey);
    myHeaders.append("Accept", "*/*");
    const body = JSON.stringify(sourceItem);

    const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: myHeaders,
        body: body,
    });
    console.log('Response headers:', response.headers);

    const text = await response.text();
    try{
        return JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return null;
    }
}

