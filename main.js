const Apify = require('apify');

// Apify.utils contains various utilities, e.g. for logging.
// Here we use debug level of logging to improve the debugging experience.
// This functionality is optional!
const { log } = Apify.utils;
log.setLevel(log.LEVELS.DEBUG);

// Apify.main() function wraps the crawler logic (it is optional).
Apify.main(async () => {
    // Create an instance of the RequestList class that contains a list of URLs to crawl.
    // Add URLs to a RequestList
    const { startUrls } = await Apify.getInput();
    const requestList = await Apify.openRequestList('start-urls', startUrls);
    // Create an instance of the CheerioCrawler class - a crawler
    // that automatically loads the URLs and parses their HTML using the cheerio library.
    const crawler = new Apify.CheerioCrawler({
        // Let the crawler fetch URLs from our list.
        requestList,

        // The crawler downloads and processes the web pages in parallel, with a concurrency
        // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
        // Here we define some hard limits for the concurrency.
        minConcurrency: 10,
        maxConcurrency: 50,

        // On error, retry each page at most once.
        maxRequestRetries: 1,

        // Increase the timeout for processing of each page.
        handlePageTimeoutSecs: 30,

        // Limit to 10 requests per one crawl
        maxRequestsPerCrawl: 10,

        // This function will be called for each URL to crawl.
        // It accepts a single parameter, which is an object with options as:
        // https://sdk.apify.com/docs/typedefs/cheerio-crawler-options#handlepagefunction
        // We use for demonstration only 2 of them:
        // - request: an instance of the Request class with information such as URL and HTTP method
        // - $: the cheerio object containing parsed HTML
        handlePageFunction: async ({ request, $ }) => {
            log.debug(`Processing ${request.url}...`);
            // Extract data from the page using cheerio.
            const title = $('h1').text();
            log.debug(`title ${title}...`);
            // const h1texts = [];
            const data = [];
            // $('#mdf_menu').each((index, el) => {
            //     log.debug(`index ${index}...`);
            //     h1texts.push({
            //         random: 'jhhsdshe',
            //         text: $(el).text(),
            //         number: index,
            //     });
            // });
            $('.powered-by-container').each((index, el) => {
                log.debug(`index ${index}...`);
                data.push({
                    title: $(el).find('a').text(),
                });
            });
            // const href = 'http://www.google.com';
            // h1texts.push({
            //     // text: $('a[href="#nd"]').text(),
            //     random: elements.length,
            // });
            // h1texts.push({
            //     text: $('a[href="#mn"]').text(),
            //     random: 'csok',
            // });
            // h1texts.push({
            //     text: $('a[href="#wolods"]').text(),
            //     random: 'csdsadokok',
            // });
            // Store the results to the default dataset. In local configuration,
            // the data will be stored as JSON files in ./apify_storage/datasets/default
            await Apify.pushData({
                url: request.url,
                title,
                data,
            });
        },

        // This function is called if the page processing failed more than maxRequestRetries+1 times.
        handleFailedRequestFunction: async ({ request }) => {
            log.debug(`Request ${request.url} failed twice.`);
        },
    });

    // Run the crawler and wait for it to finish.
    await crawler.run();

    log.debug('Crawler finished.');
});
