const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

(async () => {
    const start = "Case Western Reserve University";
    const end = "Rome";

    const path = await shortestPath(start, end);
    if(path){
        console.log("Found Path: ");
        console.log(path.join(" -> "));
    } else{
        console.log("No path found.");
    }
})();

// Bread-First Search
async function shortestPath(start, end){
    const browser = await puppeteer.launch({
        headless: "new"
    });

    // Create a queue starting at the start title



    await browser.close();
}

async function getLinks(title, browser){
    const page = await browser.newPage();
    const url = `https://en.wikipedia.org/wiki/${title}`;
    await page.goto(url, {waitUntil: "networkidle2"});

    const html = await page.content();
    const $ = cheerio.load(html);

    await page.close();
}