// May 17, 2025
// Code Developed by Donovan Crowley

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const WEATHER_URL = "https://weather.com/weather/tenday/l/6594bd988ad8d62279951252d2be55f03043bee93ced5605230072de15a4c00e";

(async () =>{
    try{
        const {browser, page} = await launchBrowser();
        const html = await getPageHTML(page, WEATHER_URL);
        const weatherData = parseWeatherData(html);
        displayWeather(weatherData);
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
    const dates = $(".DailyContent--daypartDate--KXrEE").map((i, el) => $(el).text()).get();
    const forecasts = $(".DailyContent--narrative--jqi6P").map((i, el) => $(el).text()).get();
    return {dates, forecasts};
}

function displayWeather({dates, forecasts}){
    for(let i = 0; i < Math.min(dates.length, forecasts.length); i++){
        console.log(`${dates[i]}: ${forecasts[i]}`);
    }
}