import azureFunctions from '@azure/functions';
import { main } from '../nodejs-simple-rss-scraper';
const { app } = azureFunctions;
type InvocationContext = azureFunctions.InvocationContext;
type Timer = azureFunctions.Timer;

app.timer('rssScraperTimer', {
    schedule: process.env.RSS_SCRAPER_SCHEDULE ?? '0 0 * * * *',
    handler: async (_myTimer: Timer, context: InvocationContext) => {
        await main(context.log);
    }
});