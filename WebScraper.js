// May 17, 2025
// Code Developed by Donovan Crowley
// Multi-threaded web scraper using Puppeteer and Cheerio

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

// target urls to scrape
const TARGET_URLS = [
    { name: "San Francisco Weather", url: "https://weather.com/us/california/city/san-francisco/tenday", type: "weather" },
    { name: "Inspiring Quotes", url: "https://inspiringquotes.com/", type: "quote" },
    { name: "Quotes to Scrape", url: "http://quotes.toscrape.com/", type: "quotes_sandbox" },
    { name: "Books to Scrape", url: "http://books.toscrape.com/", type: "books_sandbox" },
    { name: "Hacker News", url: "https://news.ycombinator.com/", type: "hackernews" },
    { name: "Python.org", url: "https://www.python.org/", type: "generic_title" },
    { name: "Node.js Blog", url: "https://nodejs.org/en/blog", type: "generic_title" },
    { name: "GitHub Trending", url: "https://github.com/trending", type: "github_trending" },
    { name: "Dev.to", url: "https://dev.to/", type: "generic_title" },
    { name: "Internet Archive", url: "https://archive.org/", type: "generic_title" },
    { name: "Wikipedia Current Events", url: "https://en.wikipedia.org/wiki/Portal:Current_events", type: "wikipedia" },
    { name: "Wiktionary Word of the Day", url: "https://en.wiktionary.org/wiki/Wiktionary:Word_of_the_day", type: "wiktionary" },
    { name: "NASA Breaking News", url: "https://www.nasa.gov/news/all-news/", type: "generic_title" },
    { name: "MIT News", url: "https://news.mit.edu/", type: "generic_title" },
    { name: "Crunchbase News", url: "https://news.crunchbase.com/", type: "generic_title" },
    { name: "NPR News Feed", url: "https://www.npr.org/sections/news/", type: "generic_title" },
    { name: "BBC Science", url: "https://www.bbc.com/news/science_and_environment", type: "generic_title" },
    { name: "Weather Underground SF", url: "https://www.wunderground.com/weather/us/ca/san-francisco", type: "wunderground" },
    { name: "Reddit Technology", url: "https://old.reddit.com/r/technology/", type: "reddit" },
    { name: "Example Domain Tracker", url: "https://example.com/", type: "generic_title" }
];

// concurrency limit to avoid memory leaks
const CONCURRENCY_LIMIT = 4;

// unified parser router based on types
function parseAndDisplayData(target, html) {
    const $ = cheerio.load(html);

    switch (target.type) {
        case "weather": {
            const today = $("[data-testid='daypartDate']").first().text() || $(".DailyContent--daypartDate--KXrEE").first().text() || "Today";
            const forecast = $("[data-testid='narrative']").first().text() || $(".DailyContent--narrative--jqi6P").first().text() || "Forecast unavailable";
            console.log(`[Weather] ${target.name} (${today}): ${forecast.trim()}`);
            break;
        }
        case "quote": {
            const quoteText = $(".quote-card__quote").first().text().trim();
            const author = $(".quote-card__author").first().text().trim();
            console.log(`[Quote] "${quoteText}" — ${author}`);
            break;
        }
        case "quotes_sandbox": {
            const firstQuote = $(".quote .text").first().text().trim();
            console.log(`[Sandbox Quote] ${target.name}: ${firstQuote}`);
            break;
        }
        case "books_sandbox": {
            const firstBook = ".product_pod h3 a";
            const bookTitle = $(firstBook).attr("title") || $(firstBook).text().trim();
            console.log(`[Book Scrape] ${target.name}: Featured -> ${bookTitle}`);
            break;
        }
        case "hackernews": {
            const topStory = $(".titleline > a").first().text().trim();
            console.log(`[Tech News] ${target.name}: ${topStory}`);
            break;
        }
        case "github_trending": {
            const topRepo = "h2.h3.lh-condensed a";
            const repoName = $(topRepo).first().text().replace(/\s+/g, ' ').trim();
            console.log(`[GitHub] ${target.name}: Top Repo -> ${repoName}`);
            break;
        }
        case "reddit": {
            const postTitle = "div.entry div.top-sub-row p.title a.title";
            const title = $(postTitle).first().text().trim();
            console.log(`[Reddit] ${target.name}: ${title}`);
            break;
        }
        default: {
            const pageTitle = $("title").first().text().trim();
            console.log(`[Generic] ${target.name}: Page Title -> "${pageTitle}"`);
            break;
        }
    }
}

// scrape the page
async function scrapeTarget(target) {
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"] 
        });
        const page = await browser.newPage();
        
        // agent mimicing standard browser traffic
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        
        //console.log(`Scraping: ${target.name}`);

        // idle to avoid overload
        await page.goto(target.url, { waitUntil: "networkidle2", timeout: 35000 });
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        
        parseAndDisplayData(target, html);

    } catch (error) {
        console.error(`[-] Error scraping ${target.name}:`, error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// worker pool for async control staying under limit
async function runPool(items, limit, fn) {
    let index = 0;
    async function worker() {
        while (index < items.length) {
            const currentIndex = index++;
            await fn(items[currentIndex]);
        }
    }
    const workers = Array(Math.min(limit, items.length)).fill(null).map(() => worker());
    await Promise.all(workers);
}

// main block
(async () => {
    console.log(`Initializing Scraper (${TARGET_URLS.length} Targets, Concurrency: ${CONCURRENCY_LIMIT})`);
    const startTime = Date.now();
    
    await runPool(TARGET_URLS, CONCURRENCY_LIMIT, scrapeTarget);
    
    console.log(`Completed in ${(Date.now() - startTime) / 1000}s`);
})();