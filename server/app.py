from datetime import datetime
from flask import Flask, Response, abort, redirect, render_template, request
from mutagen.flac import FLAC
from werkzeug.utils import secure_filename
import hashlib
import json
import os
import random
import re

from phrasegen import gen_long, gen_long_random

def str_to_shortname(s):
    s = ''.join([c for c in s if c.isalpha() or c in " '"])
    return s.replace(' ', '-')

# load prompts
with open('text/focus_words.txt', 'r') as f:
    focus_words = f.read().strip().split('\n')

def load_prompts():
    prompts = {}
    for ent in os.scandir('prompts'):
        if not ent.name.endswith('.txt') or ent.name.startswith('.'):
            continue
        entries = []
        with open(ent.path) as f:
            for line in f:
                text = line.strip()
                if not text:
                    continue

                match = re.match((r'^(?P<text>.+)\s*' r'\((?P<name>[^)]+)\)' r'(?P<title>"[^"]+")?\s*$'), text)
                title = text
                name = str_to_shortname(text)
                if match:
                    text = match.group('text').strip()
                    name = match.group('name').strip()
                    if match.group('title'):
                        title = match.group('title').strip('" ')
                    else:
                        title = text
                entries.append({
                    "desc": text,
                    "name": title,
                    "short_name": name,
                })
        name = ent.name.rsplit('.', 1)[0]
        prompts[name] = entries
    return prompts

prompts = load_prompts()

# start app
app = Flask('noise_data')

@app.route('/upload', methods=['POST'])
def upload():
    form = request.form
    user = form.get('user')
    noise = request.files.get('noise')
    if not noise or not user:
        return abort(400)

    # TODO: group uploads by user?
    userdir = secure_filename(user)
    fulldir = os.path.join('upload', userdir)
    if not os.path.exists(fulldir):
        os.makedirs(fulldir)

    path = secure_filename(noise.filename)
    path = os.path.join('upload', userdir, path)
    base, ext = os.path.splitext(path)
    n = 0

    while os.path.exists(path):
        n += 1
        path = '{}-{}{}'.format(base, n, ext)

    noise.save(path)
    mic_name = form.get('mic')
    if mic_name:
        try:
            f = FLAC(path)
            f['microphone'] = str(mic_name)[:256]
            f.save()
        except Exception:
            import traceback
            traceback.print_exc()
    return 'ok'

@app.route('/noises')
def noises():
    single_words = []
    for i in range(5):
        for word in focus_words:
            single_words.append({
                'desc': word,
                'name': word,
                'short_name': '{}-{}'.format(word, i),
            })

    for i in range(500):
        text = gen_long(common=1)
        if not text.strip():
            continue
        single_words.append({
            "desc": text,
            "name": text,
            "short_name": str_to_shortname(text),
        })
    for prompt in prompts.values():
        single_words += prompt

    all_prompts = prompts.copy()
    all_prompts["Single Words"] = single_words
    prompts_json = json.dumps({'sounds': all_prompts['sentences']})
    return Response(prompts_json, mimetype='application/json')


@app.route('/')
def slash():
    return render_template('index.html')


if __name__ == '__main__':
    if not os.path.exists('upload'):
        os.makedirs('upload')
    app.run(port=5000, debug=True, threaded=True)
# `threaded=True` added due to Chrome fetch of resource, like noises.json, being extremely slow because there is a problem "related with the way Chrome uses connections and the default configuration of flask as mono threaded."
# More here: https://stackoverflow.com/questions/23639355/extremely-long-wait-time-when-loading-rest-resource-from-angularjs#answer-30670626
