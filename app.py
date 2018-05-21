import os
from datetime import datetime
from flask import Flask, Response, abort, redirect, render_template, request
from werkzeug.utils import secure_filename

app = Flask('noise_data')

@app.route('/upload', methods=['POST'])
def upload():
    form = request.form
    noise = request.files.get('noise')
    if not noise:
        return abort(400)

    # TODO: group uploads by user?
    path = secure_filename(noise.filename)
    path = os.path.join('upload', path)
    base, ext = os.path.splitext(path)
    n = 0
    while os.path.exists(path):
        n += 1
        path = '{}-{}{}'.format(base, n, ext)

    noise.save(path)
    return 'ok'

@app.route('/noises')
def noises():
    with open('noises.json', 'r') as f:
        noises = f.read()
    return Response(noises, mimetype='application/json')

@app.route('/')
def slash():
    return render_template('index.html')

if __name__ == '__main__':
    if not os.path.exists('upload'):
        os.makedirs('upload')
    app.run(port=5000, debug=True)
