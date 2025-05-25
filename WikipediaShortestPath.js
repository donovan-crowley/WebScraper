// May 19, 2025
// Code Developed by Donovan Crowley

// Testcase 1: Case Western Reserve University -> Cleveland Browns -> Egypt
// Testcase 2: Great Gatsby -> ... (I forgot the "The", so the code could not find the next page)
// Testcase 3: The Great Gatsby -> Daisy Buchanan
// Testcase 4: Freddie Mercury -> Eric Idle -> Holy Grail

const axios = require("axios");

(async () => {
    // Start -> End
    const path = await shortestPath("The Great Gatsby", "Daisy Buchanan");
    if(path){
        console.log("Found Path: ");
        console.log(path.join(" -> "));
    } else{
        console.log("No path found.");
    }
})();

// Bread-First search, treating links as nodes, to find the shortest path searching each level of the tree
async function shortestPath(start, end){
    const visited = new Set();
    const queue = [[start]];
    const cache = new Map();

    // Use queue for BFS
    while(queue.length > 0){
        const path = queue.shift();
        const current = path[path.length - 1];

        // Ignore duplicate links
        if(visited.has(current)){
            continue;
        }

        console.log(`Visited: ${current}`);
        visited.add(current);

        // Found the correct link
        if(current == end){
            return path;
        }

        // All the links (or children) on each page
        const links = await getLinks(current, cache);

        // Add all the new possible paths
        for(let next of links){
            console.log(`Visited: ${next}`);
            if(!visited.has(next)){
                queue.push([...path, next]);
            }
        }
    }
    return false;
}

async function getLinks(title, cache){
    // Eliminate Duplicate API calls in cache
    if(cache.has(title)){
        return cache.get(title);
    }

    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=links&pllimit=max&format=json&origin=*`;
    let links = [];

    try{
        const response = await axios.get(url);
        const pages = response.data.query.pages;

        // Extract all of the links
        for(let pageId in pages){
            const page = pages[pageId];
            if(page.links){
                links = page.links.map(link => link.title);
            }
        }
    } catch (error){
        console.error(`Error processing ${title}:`, error);
    }

    cache.set(title, links);
    return links;
}