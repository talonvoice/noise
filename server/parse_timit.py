import re
import json

sentences = []
with open('prompts.txt') as f:
    for line in f:
        if line.startswith(';'):
            continue
        match = re.match(r'^(.+) \(([^)]+)\)$', line)
        if not match: print(line)
        sentences.append(match.groups())

data = {'sounds': []}
for words, sid in sentences:
    data['sounds'].append({
        'name': words,
        'short_name': sid,
        'desc': words,
    })

with open('timit.json', 'w') as f:
    f.write(json.dumps(data))
