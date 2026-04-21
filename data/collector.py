import requests

# Simple arXiv fetch (sample)
def fetch_arxiv(query="AI", max_results=5):
    url = f"http://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results={max_results}"
    r = requests.get(url)
    return r.text

if __name__ == "__main__":
    data = fetch_arxiv()
    with open("raw_data.xml","w") as f:
        f.write(data)
    print("Downloaded sample data")
