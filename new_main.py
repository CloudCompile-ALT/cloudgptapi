import re
import requests
import json
import time
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from tinydb import TinyDB, Query
import uvicorn

app = FastAPI()
db = TinyDB('db.json')
settings_table = db.table('settings')
cache_table = db.table('lore_cache')

class FandomSettings(BaseModel):
    maxLoreTokens: int = 800
    autoSummarize: bool = True
    cacheMode: str = 'aggressive'
    preferredSources: List[str] = ['fandom', 'wikipedia']

class ExecuteRequest(BaseModel):
    messages: List[Dict]
    api_key_id: str
    settings: Optional[FandomSettings] = None

class SettingsUpdateRequest(BaseModel):
    enabled: Optional[bool] = None
    settings: Optional[FandomSettings] = None

def detect_entities(text: str) -> List[str]:
    # Match capitalized phrases
    capitalized_words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
    common_words = {'The', 'A', 'An', 'I', 'You', 'He', 'She', 'They', 'It', 'In', 'On', 'At', 'By', 'My', 'Our', 'Your', 'Me', 'Him', 'Her', 'Us', 'Them', 'When', 'How', 'Where', 'Why', 'Who', 'If', 'But', 'Or', 'And', 'So', 'No', 'Yes', 'Is', 'Are', 'Was', 'Were', 'Be', 'Been', 'Being', 'Have', 'Has', 'Had', 'Do', 'Does', 'Did', 'Will', 'Would', 'Shall', 'Should', 'Can', 'Could', 'May', 'Might', 'Must', 'Now', 'Then', 'Just', 'Very', 'Too', 'Also', 'Even', 'Only', 'First', 'Last', 'Next', 'Back', 'Up', 'Down', 'Left', 'Right', 'Some', 'Any', 'All', 'Every', 'Each', 'Other', 'Another', 'Such', 'More', 'Most', 'Less', 'Least', 'Good', 'Bad', 'New', 'Old', 'High', 'Low', 'Markdown', 'Emoji', 'Plot', 'Here'}
    return list(set([w for w in capitalized_words if w not in common_words and len(w) > 2]))

def get_cached_lore(entity: str, source: str) -> Optional[Dict]:
    Q = Query()
    # Cache expires after 24 hours
    one_day_ago = time.time() - (24 * 3600)
    res = cache_table.search((Q.entity == entity) & (Q.source == source) & (Q.timestamp > one_day_ago))
    if res:
        return res[0]['data']
    return None

def set_cached_lore(entity: str, source: str, data: Dict):
    Q = Query()
    cache_table.upsert({
        'entity': entity,
        'source': source,
        'data': data,
        'timestamp': time.time()
    }, (Q.entity == entity) & (Q.source == source))

def safe_get_json(url: str, headers: Dict, timeout: int = 5) -> Optional[Dict]:
    try:
        resp = requests.get(url, headers=headers, timeout=timeout)
        if resp.status_code != 200:
            return None
        if not resp.text or not resp.text.strip():
            return None
        try:
            return resp.json()
        except json.JSONDecodeError:
            return None
    except Exception:
        return None

def scrape_fandom(entity: str) -> Optional[Dict]:
    cached = get_cached_lore(entity, 'Fandom')
    if cached: return cached

    try:
        search_url = f'https://www.fandom.com/api.php?action=query&list=search&srsearch={entity}&format=json'
        headers = {'User-Agent': 'CloudGPT/1.0 (https://cloudgpt.com)'}
        resp = safe_get_json(search_url, headers)

        if resp and 'query' in resp and resp['query']['search']:
            title = resp['query']['search'][0]['title']
            snippet = resp['query']['search'][0]['snippet']
            clean_snippet = BeautifulSoup(snippet, 'html.parser').get_text()

            data = {
                'title': title,
                'content': clean_snippet,
                'source': 'Fandom'
            }
            set_cached_lore(entity, 'Fandom', data)
            return data
    except Exception as e:
        print(f'Fandom scrape error for {entity}: {e}')
    return None

def scrape_wikipedia(entity: str) -> Optional[Dict]:
    cached = get_cached_lore(entity, 'Wikipedia')
    if cached: return cached

    url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{entity.replace(" ", "_")}'
    headers = {'User-Agent': 'CloudGPT/1.0 (https://cloudgpt.com)'}
    try:
        resp = safe_get_json(url, headers)
        if resp and 'extract' in resp:
            data = {
                'title': resp.get('title', entity),
                'content': resp['extract'],
                'source': 'Wikipedia'
            }
            set_cached_lore(entity, 'Wikipedia', data)
            return data
    except Exception as e:
        print(f'Wikipedia scrape error for {entity}: {e}')
    return None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/settings/{api_key_id}")
def get_settings(api_key_id: str):
    Q = Query()
    res = settings_table.search(Q.api_key_id == api_key_id)
    if not res:
        return {"enabled": False, "settings": FandomSettings().dict()}
    return res[0]

@app.patch("/settings/{api_key_id}")
def update_settings(api_key_id: str, req: SettingsUpdateRequest):
    Q = Query()
    existing = settings_table.search(Q.api_key_id == api_key_id)
    update_data = {}
    if req.enabled is not None:
        update_data['enabled'] = req.enabled
    if req.settings is not None:
        update_data['settings'] = req.settings.dict()
    if existing:
        settings_table.update(update_data, Q.api_key_id == api_key_id)
    else:
        update_data['api_key_id'] = api_key_id
        if 'enabled' not in update_data: update_data['enabled'] = False
        if 'settings' not in update_data: update_data['settings'] = FandomSettings().dict()
        settings_table.insert(update_data)
    return {"success": True}

@app.post("/execute")
async def execute_plugin(req: ExecuteRequest):
    enabled = False
    settings = req.settings
    if not settings:
        Q = Query()
        res = settings_table.search(Q.api_key_id == req.api_key_id)
        if res:
            enabled = res[0].get('enabled', False)
            settings_data = res[0].get('settings', {})
            settings = FandomSettings(**settings_data)
        else:
            return {"messages": req.messages}
    if req.settings:
        enabled = True
        settings = req.settings
    if not enabled:
        return {"messages": req.messages}
    last_user_msg = next((m['content'] for m in reversed(req.messages) if m['role'] == 'user'), None)
    if not last_user_msg:
        return {"messages": req.messages}
    entities = detect_entities(last_user_msg)
    if not entities:
        return {"messages": req.messages}
    lore_snippets = []
    for entity in entities[:2]:
        lore = None
        for source in settings.preferredSources:
            if source.lower() == 'wikipedia':
                lore = scrape_wikipedia(entity)
            elif source.lower() == 'fandom':
                lore = scrape_fandom(entity)
            if lore:
                lore_snippets.append(lore)
                break
    if not lore_snippets:
        return {"messages": req.messages}
    lore_text = "\n\n".join([f"[Source: {l['source']}]\n{l['title']}: {l['content']}" for l in lore_snippets])
    system_msg = {
        "role": "system",
        "content": f"[Remote Fandom Plugin Active]\nUse this lore context to inform your response:\n\n{lore_text}"
    }
    new_messages = list(req.messages)
    system_idx = next((i for i, m in enumerate(new_messages) if m['role'] == 'system'), -1)
    if system_idx != -1:
        new_messages.insert(system_idx + 1, system_msg)
    else:
        new_messages.insert(0, system_msg)
    return {"messages": new_messages}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=80)
