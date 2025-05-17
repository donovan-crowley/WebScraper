// May 17, 2025
// Code Developed by Donovan Crowley

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");


(async () =>{
    const browser = await puppeteer.launch({
        defaultViewport: {
            width: 500,
            height: 500,
        },
    });
    const page = await browser.newPage();
    await page.goto("https://craftdlondon.com/products/connell-silver-2mm?variant=32424252080210");

    /*await page.screenshot({path: "image.png"})*/

    const pageData = await page.evaluate(() =>{
        return{
            html: document.documentElement.innerHTML,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
        };
    });



    const $ = cheerio.load(pageData.html);
    const elementPrice = $(".money");

    console.log(element.text());

    await browser.close();
})();