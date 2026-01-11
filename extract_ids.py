import json

with open('poe_models_fixed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    for model in data.get('data', []):
        print(model.get('id'))
