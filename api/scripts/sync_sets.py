import requests
import time

def fetch_sets_records():
    local_url = "http://localhost:8090/api/collections/sets/records?page=1&perPage=500&skipTotal=1"
    prod_url = "https://gimgine-tcg.pockethost.io/api/collections/sets/records"

    try:
        response = requests.get(local_url)
        response.raise_for_status()
        
        data = response.json()
        reqs = [
            {"tcgplayer": item["tcgplayer"], "code": item["code"]}
            for item in data.get("items", [])
        ]
        
        for i, req in enumerate(reqs, start=1):
            try:
                post_response = requests.post(prod_url, json=req)
                post_response.raise_for_status()
                print(f"[{i}/{len(reqs)}] Successfully posted: {req}")
            except requests.exceptions.RequestException as e:
                print(f"[{i}/{len(reqs)}] Failed to post {req}: {e}")
            time.sleep(0.25)
    
    except requests.exceptions.RequestException as e:
        print(f"Error making initial request: {e}")

if __name__ == "__main__":
    fetch_sets_records()
