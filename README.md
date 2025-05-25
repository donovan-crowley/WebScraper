# WebScraper
Webscraper using Puppeteer from the Node.js library to provide an API for controlling headless Chrome browsers and Cheerio from the jQuery library to parse HTML and manipulate DOM in Node.js. Only used for simple implementation such as daily quote and weather.

The WikipediaShortestPath uses the Axios library to find the shortest path using Breadth-First Search in Javascript.

The WikiGameML is most complex and efficient than the WikipediaShortestPath. I switched to Python to use the SentenceTransformers library and implement the pretrained language model to develop a greedy algorithm with machine learning. The algorithm uses A* Search to embed each link on the given Wikipedia page and use cosine similarity to develop a heuristic value based on the SentenceTransformers library to sort the links in a priority queue until the page is found or the cost (or degree of separation between each page) is too large.