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
            $('div').each((index, el) => {
                log.debug(`index ${index}...`);
                data.push({
                    title: $(el).find('a').text(),
                });
            });
            await Apify.pushData({
                url: request.url,
                title,
                data,
            });
        },
        handleFailedRequestFunction: async ({ request }) => {
            log.debug(`Request ${request.url} failed twice.`);
        },
    });
    await crawler.run();
    log.debug('Crawler finished.');
});
