""" 
May 23, 2025
Developed by Donovan Crowley
"""

import requests
import math
import heapq
import numpy as np

def getLinks(title):
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

def toToken(word):
    return word.lower().split()

def embed(input):
    words = toToken(input)
    freq = {}
    for word in words:
        freq[word] = freq.get(word, 0) + 1
    return freq

def cosineSimilarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude_vec1 = pow(sum(pow(a, 2) for a in vec1), 0.5)
    magnitude_vec2 = pow(sum(pow(b, 2) for b in vec2), 0.5)
    return dot_product / (magnitude_vec1 * magnitude_vec2)

def a_star_search(start, end):
    priority_queue = [(0, start, [])]
    visited = set()
    cache = {}

    goal_embedding = embed([end])[0]

    while priority_queue:
        totalCost, cost, path = heapq.heappop(priority_queue)
        current = path[-1]

        if current in visited:
            continue

        visited.add(current)

        if current == end:
            return path

        if current not in cache:
            cache[current] = getLinks(current)

        next = cache[current]

        if not next:
            continue

        next_embeddings = embed(next)
        similarity = cosineSimilarity([goal_embedding], next_embeddings)[0]

        for neighbor, sim in zip(next, similarity):
            if neighbor in visited:
                continue
            heuristic = 1 - sim
            heapq.heappush(priority_queue, (cost + 1 + heuristic, cost + 1, path + [neighbor]))

    return None

if __name__ == "__main__":
    path = a_star_search("The Great Gatsby", "Daisy Buchanan")
    if path:
        print("Found Path: ")
        print(" -> ".join(path))
    else:
        print("No path found.")