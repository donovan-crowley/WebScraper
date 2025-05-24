""" 
May 23, 2025
Developed by Donovan Crowley
"""

# Testcase 1: The Great Gatsby -> Daisy Buchanan
# Testcase 2: The Great Gatsby -> Associated Press -> Rome
# Testcase 3: Great Gatsby -> The Great Gatsby -> Daisy Buchanan
# Testcase 4: Marrige -> Hangman (This ran for an hour because Hangman is ambiguous)
# Testcase 5: Toy -> Poetry

import requests
from sentence_transformers import SentenceTransformer
import heapq

model = SentenceTransformer("all-MiniLM-L6-v2")

def getLinks(title):
    # Visit API and gather links on the page
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={title}&prop=links&pllimit=max&format=json&origin=*"
    try:
        response = requests.get(url).json()
        pages = response['query']['pages']
        for page_id in pages:
            links = pages[page_id].get('links', [])
            return [link['title'] for link in links]
    except Exception as e:
        print(f"Error getting links for {title}: {e}")
        return []

def embed(word):
    return model.encode(word) # Use pretrained sentence transformers LM

def cosineSimilarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = pow(sum(pow(a, 2) for a in vec1), 0.5)
    mag2 = pow(sum(pow(b, 2) for b in vec2), 0.5)
    return dot_product / (mag1 * mag2) if mag1 and mag2 else 0

def a_star_search(start, end):
    priority_queue = [(0, 0, [start])]
    goal_embedding = embed([end])[0]
    print(goal_embedding)
    visited = set()
    cache = {}

    while priority_queue:
        total, cost, path = heapq.heappop(priority_queue)
        current = path[-1]

        if current in visited:
            continue

        visited.add(current)
        print(f"Visited: {current}")

        if current == end:
            return path

        if current not in cache:
            cache[current] = getLinks(current)

        next = cache[current]

        if not next:
            continue

        next_embeddings = embed(next)

        for neighbor, neighbor_vec in zip(next, next_embeddings):
            if neighbor in visited:
                continue
            # Compare the goal link with the links on the page
            heuristic = 1 - cosineSimilarity(goal_embedding, neighbor_vec)
            heapq.heappush(priority_queue, (cost + 1 + heuristic, cost + 1, path + [neighbor]))
    return False

if __name__ == "__main__":
    path = a_star_search("Toy", "Poetry")
    if path:
        print("Found Path: ")
        print(" -> ".join(path))
    else:
        print("No path found.")