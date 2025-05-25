""" 
May 23, 2025
Developed by Donovan Crowley
"""

# Testcase 1: The Great Gatsby -> Daisy Buchanan
# Testcase 2: The Great Gatsby -> Associated Press -> Rome
# Testcase 3: Great Gatsby -> The Great Gatsby -> Daisy Buchanan
# Testcase 4: Marrige -> ... -> Hangman (This ran for an hour because Hangman is ambiguous and could not be found)
# Testcase 5: Toy -> Wikipedia:WikiProject Countering systemic bias -> Religious text
# Testcase 6: Toy -> Age of Enlightenment -> Religious text (Updated to filter links)
# Testcase 7: Pangaea -> ... -> Hammer (Ran for an extremely long time) -- Algorithm struggles with 3 degrees or higher of separation
# Testcase 8: Hammer -> Wood
# Testcase 9: Hammer -> Wood -> Woody plant
# Testcase 10: Hammer
# Testcase 11: Pangaea -> Sea -> Gold -> Hammer (Found within seconds)
# Testcase 12: Marriage -> Play (activity) -> Board game -> Hangman (game)
# Testcase 13: Athletics at the 1953 Arab Games -> Alexandria -> Cairo–Alexandria desert road (~4.78s) - be careful with the dash
# Testcase 14: Athletics at the 1953 Arab Games -> Alexandria -> Cairo–Alexandria desert road -> Highway (~46.92s)
# Testcase 15: Athletics at the 1953 Arab Games -> 100 metres -> Indianapolis -> Interstate Highway System -> State highway (~3 minutes 34.6 seconds)
# Testcase 16: Athletics at the 1953 Arab Games -> 100 metres -> Edmonton -> Alberta Highway 16 -> Saskatchewan Highway 1 -> Saskatchewan Highway 999 (~6 minutes 40.66 seconds)
# Testcase 17: Athletics at the 1953 Arab Games -> Marathon -> Street racing -> Controlled-access highway -> Numbered highways in Canada -> Saskatchewan Highway 999 -> List of highways numbered 999 (~17 minutes 16.01 second)

import requests
from sentence_transformers import SentenceTransformer
import heapq
import wikipediaapi
import time

model = SentenceTransformer("all-MiniLM-L6-v2")

embed_cache = {}
link_cache = {}

def getLinks(title):
    if title in link_cache:
        return link_cache[title]

    # Visit API and gather links on the page
    url = "https://en.wikipedia.org/w/api.php"
    params = { "action": "query",
        "titles": title,
        "prop": "links",
        "pllimit": "max",
        "format": "json",
        "origin": "*"
    }

    all_links = []
    while True:
        response = requests.get(url, params=params).json()
        pages = response['query']['pages']
        for page_id in pages:
            links = pages[page_id].get('links', [])
            all_links.extend(link['title'] for link in links)
        
        if "continue" in response:
            params.update(response["continue"])
        else:
            break
    filtered = filter(all_links)
    link_cache[title] = filtered
    return filtered

def filter(links):
    ignore = ("Wikipedia:", "Help:", "Category:", "Talk:", "Portal:", "Template:", "User talk:", "Module:", "User:", "File:", "Wikipedia talk: ", "Template talk:", "MOS:")
    filteredLinks = []
    for link in links:
        if not link.startswith(ignore):
            filteredLinks.append(link)
    return filteredLinks

def embed(title):
    if title in embed_cache:
        return embed_cache[title]
    vec = model.encode([title])[0]
    embed_cache[title] = vec
    return vec

def cosineSimilarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = pow(sum(pow(a, 2) for a in vec1), 0.5)
    mag2 = pow(sum(pow(b, 2) for b in vec2), 0.5)
    if mag1 and mag2:
        return dot_product / (mag1 * mag2)
    else:
        return 0

def a_star_search(start, end):
    priority_queue = [(0, 0, [start])]
    goal_embedding = embed(end)
    visited = set()

    while priority_queue:
        # Guess next link at top of min-heap
        priority, cost, path = heapq.heappop(priority_queue)
        current = path[-1]

        # Skip if visited
        if current in visited:
            continue

        visited.add(current)
        print(f"Visited: {current}")

        # Return the correct path to end page
        if current == end:
            return path
        
        # Prevent deep searches
        if cost >= 6:
            continue

        # Explore guess
        next = getLinks(current)
        if not next:
            continue

        # Embed links
        link_vectors = model.encode(next, batch_size = 32)

        # Calculate similarity
        scored = []
        for neighbor, vec in zip(next, link_vectors):
            sim = cosineSimilarity(goal_embedding, vec)
            scored.append((neighbor, vec, sim))
        
        # Sort the links and cutoff irrelevant ones
        most_similar = sorted(scored, key = lambda x: -x[2])[:10] # Only top 10

        for neighbor, vec, sim in most_similar:
            if neighbor not in visited:
                embed_cache[neighbor] = embed_cache.get(neighbor, vec)
                heuristic = 1 - sim # Lower is closer
                heapq.heappush(priority_queue, (cost + 1 + heuristic, cost + 1, path + [neighbor]))
    return False

if __name__ == "__main__":
    start = input("Start Wiki page title: ")
    end = input("End Wiki page title: ")

    # Ensure the pages API exist
    wiki_api = wikipediaapi.Wikipedia(user_agent = 'WikiGameML.py', language = 'en')
    start_page = wiki_api.page(start)
    end_page = wiki_api.page(end)
    
    # Start the timer
    start_time = time.time()

    if(start_page.exists() and end_page.exists()):
        path = a_star_search(start, end)
        if path:
            # Print shortest path
            print("Found Path: ")
            print(" -> ".join(path))

            # Print the time it took for the algorithm to find the path
            end_time = time.time()
            difference = end_time - start_time
            print(f"Found in {difference:.2f} seconds")
        else:
            print("No path found.")
    else:
        print("Error fetching Wikipedia page. Please check existence and spelling of both pages")