# Python standard library imports
import os
# Flask imports
from flask import Flask, jsonify, render_template, request, url_for, redirect
from flask_cors import CORS
# SQLAlchemy imports
from sqlalchemy import text
# Project imports
from helpers import connectToDatabase


# Server setup
basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
CORS(app)

db = connectToDatabase(app)

# Server initialization finished


@app.route("/test", methods=["GET", "POST"])
def test():
    print("running")

    result = db.session.execute(text("SELECT * FROM users"))
    rows = result.fetchall()

    selected = []
    for user in rows:
        selected.append(
            {"id": user[0], "name": user[1], "email": user[2], "birth": user[3]}
        )

    return jsonify(selected), 200


# Entrypoint
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
