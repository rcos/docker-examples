from flask import Flask
import flask
import json
app = Flask(__name__)

@app.route("/")
def hello():
    res = flask.Response(json.dumps([{ 'name': 'alex', 'handle': 'aescko' },
        { 'name': 'adrian', 'handle': 'adriancollado' }]))
    res.headers['Access-Control-Allow-Origin'] = '*'
    return res
if __name__ == "__main__":
    app.run()
