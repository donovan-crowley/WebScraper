# WebScraper & Wiki Game ML

**Donovan Crowley**
> donocrowley16@gmail.com

---

## Project Description
* A multi-component project showcasing my evolution of learning basic Node.js web scraper to an advanced machine learning-powered pathfinding algorithm using Python and semantic embedding

---

## How To Use:
1. **Installation**: Node.js and dependencies (`puppeteer`, `cheerio`, `axios`), and Python with `sentence-transformers`
2. **Run**:
```bash
node WebScraper.js
node WikipediaShortestPath.js
python WikiGameML.py
```


## Wiki Game
* Finding the shortest path between two unrelated Wikipedia pages

## Architecture

### 1. WebScraper (Node.js)
* **Details:** A lightweight utility providing a programmatic API to control headless Chrome browsers and extract structured data
* **Tech Stack:** Node.js, Puppeteer, Cheerio
* **Use Cases:** Simple, targeted implementations like fetching multiple data online at once

### 2. WikipediaShortestPath (JavaScript / Node.js)
* **Details:** My first attempt at the Wiki game using unweighted graph traversal
* **Tech Stack:** JavaScript, Axios, Breadth-First Search (BFS)
* **Use Cases:** Solving the Wiki game with direct API queries; This version was replaced due to high branching factors and performance bottlenecks

### 3. WikiGameML (Python)
* **Details:** Most complex and efficient iteration of the Wiki Game solver; It replaces naive graph traversal with heuristic-driven machine learning approach
* **Tech Stack:** Python, Hugging Face `SentenceTransformers`, A* Search, Cosine Similarity, Priority Queues
* **How It Works:**
    * Integrates an A* Search algorithm to efficiently prune irrelevant branches in the massive Wikipedia graph
  * Embeds candidate hyperlinks from a given Wiki pages into dense vector spaces using pretrained language models
    * Calculates semantic closeness to the target via **cosine similarity**, sorting links in a priority queue to guide the pathfinding agent toward the goal
    * Features automatic backtracking when a chosen path exceeds structural cost limits or hits the end
* **Performance:** Reduced multi-degree pathfinding times from hours (using basic BFS/Puppeteer setup) down to seconds for close nodes and roughly 17 minutes for complex 6-degree separations

## Key Learnings
1. **The Origin:** Started as an introductory project to understand web automation, data parsing, and basic API interactions and morphed into a complex machine learning approach
2. **The Development:** Transitioned away from heavy browser-automation tools and traditional unweighted graph algorithms
3. **MLOps & Embeddings:** Leveraging modern NLP via Sentence Transformers proved that semantic heuristics drastically outperform brute-force structural searches in complex web graph environments