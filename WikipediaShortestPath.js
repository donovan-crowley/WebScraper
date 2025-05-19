// May 19, 2025
// Code Developed by Donovan Crowley

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

(async () => {
    const start = "Case Western Reserve University";
    const end = "Egypt";

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
    const visited = new Set();
    const queue = [[start]];

    while(queue.length > 0){
        const path = queue.shift();
        const current = path[path.length - 1];

        if(visited.has(current)){
            continue;
        }
        visited.add(current);

        console.log(`Visited: ${current}`);

        if(current == end){
            await browser.close();
            return path;
        }
        try{
            const links = await getLinks(current, browser);
            for(let next of links){
                if(!visited.has(next)){
                    queue.push([...path, next]);
                }
            }
        } catch (error) {
            console.error(`Error processing ${current}`, error);
        }        
    }

    await browser.close();
    return null;
}

async function getLinks(title, browser){
    const page = await browser.newPage();
    const url = `https://en.wikipedia.org/wiki/${title}`;
    await page.goto(url, {waitUntil: "networkidle2"});

    const html = await page.content();
    const $ = cheerio.load(html);

    const links = new Set();

    // Ensure the links are internal
    $('#bodyContent a[href^="/wiki/"]').each((i, elem) =>{
        const href = $(elem).attr('href');
        if(href && !href.includes(':')){
            const title = decodeURIComponent(href.replace('/wiki/', '')).replace(/_/g, ' ');
            links.add(title);
        }
    })

    await page.close();
    return Array.from(links);
}