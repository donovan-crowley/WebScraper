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



import requests
from sentence_transformers import SentenceTransformer
import heapq

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
    ignore = ("Wikipedia:", "Help:", "Category:", "Talk:", "Portal:", "Template:")
    return [link for link in links if not link.startswith(ignore)]


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

def a_star_search(start, end, max_depth = 5, top_k = 10):
    priority_queue = [(0, 0, [start])]
    goal_embedding = embed(end)
    visited = set()

    while priority_queue:
        total, cost, path = heapq.heappop(priority_queue)
        current = path[-1]

        if current in visited:
            continue

        visited.add(current)
        print(f"Visited: {current}")

        if current == end:
            return path
        
        if cost >= max_depth:
            continue

        next = getLinks(current)
        if not next:
            continue

        vectors = model.encode(next, batch_size = 32, show_progress_bar = False)
        scored = [(neighbor, vec, cosineSimilarity(goal_embedding, vec))
                  for neighbor, vec in zip(next, vectors)]
        top_neighbors = sorted(scored, key = lambda x: -x[2])[:top_k]

        for neighbor, vec, sim in top_neighbors:
            if neighbor in visited:
                continue

            embed_cache[neighbor] = embed_cache.get(neighbor, vec)
            h = 1 - sim
            heapq.heappush(priority_queue, (cost + 1 + h, cost + 1, path + [neighbor]))

    return False

if __name__ == "__main__":
    path = a_star_search("Marriage", "Hangman (game)", max_depth = 6, top_k = 10)
    if path:
        print("Found Path: ")
        print(" -> ".join(path))
    else:
        print("No path found.")