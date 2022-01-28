const Apify = require('apify');
const { log } = Apify.utils;
log.setLevel(log.LEVELS.DEBUG);
Apify.main(async () => {
    const { startUrls } = await Apify.getInput();
    const requestList = await Apify.openRequestList('start-urls', startUrls);
    const crawler = new Apify.CheerioCrawler({
        requestList,
        minConcurrency: 10,
        maxConcurrency: 50,
        maxRequestRetries: 1,
        handlePageTimeoutSecs: 30,
        maxRequestsPerCrawl: 10,
        handlePageFunction: async ({ request, $ }) => {
            log.debug(`Processing ${request.url}...`);
            const title = $('title').text();
            log.debug(`title ${title}...`);
            const data = [];
            const Branches = [];
            $('.CobstoreDesc').each((index, el) => {
                Branches.push({
                    "Code": $(el).find('span[data-yext-field="address1"]').attr('data-yext-id'),
                    "Name": $(el).find('h4').text(),
                    "Url": "https://www.cashwise.com/" + $(el).find('.button').attr('href'),
                });
            });
            // await data.push({"Branches": Branches});
            await Apify.pushData({
                Branches: Branches
            });
        },
        handleFailedRequestFunction: async ({ request }) => {
            log.debug(`Request ${request.url} failed twice.`);
        },
    });
    await crawler.run();
    log.debug('Crawler finished.');
});
