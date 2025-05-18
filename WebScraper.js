// May 17, 2025
// Code Developed by Donovan Crowley

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const WEATHERHOME_URL = "https://weather.com/weather/tenday/l/6594bd988ad8d62279951252d2be55f03043bee93ced5605230072de15a4c00e";
const QUOTE_URL = "https://inspiringquotes.com/";

(async () =>{
    try{
        const {browser, page} = await launchBrowser();

        // Weather
        const weatherHTML = await getPageHTML(page, WEATHERHOME_URL);
        const weatherData = parseWeatherData(weatherHTML);
        displayWeatherToday(weatherData);

        // Quote of the Day
        const quoteHTML = await getPageHTML(page, QUOTE_URL);
        const quoteData = parseQuoteData(quoteHTML);
        displayQuote(quoteData);

        await browser.close();
    } catch(error){
        console.error("An error has occured: ", error);
    }
})();

async function launchBrowser(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    return { browser, page };
}

async function getPageHTML(page, url){
    await page.goto(url, {waitUntil: "networkidle2"});
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    return html;
}

function parseWeatherData(html){
    const $ = cheerio.load(html);
    const today = $(".DailyContent--daypartDate--KXrEE").first().text();
    const forecast = $(".DailyContent--narrative--jqi6P").first().text();
    return {today, forecast};
}

function displayWeatherToday({today, forecast}){
    console.log(`Weather Today ${today}: ${forecast}`)
}

function parseQuoteData(html){
    const $ = cheerio.load(html);
    const quoteText = $(".quote-card__quote").first().text();
    const author = $(".quote-card__author").first().text();
    return { quoteText, author };
}

function displayQuote({ quoteText, author }){
    console.log(`"${quoteText}"\n - ${author}`);
}