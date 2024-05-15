from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/hello", methods=["POST"])
def say_hello():
    print(request.form)
    return jsonify({'message':'Hello from Flask server!'}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)

