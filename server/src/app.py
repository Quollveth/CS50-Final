# Python standard library imports
import os

# Flask imports
from flask import Flask, jsonify, render_template, request, url_for, redirect
from flask_cors import CORS

# SQLAlchemy imports
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

# Project imports

# Basic setup
basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
CORS(app)

# Read environment variables passed in by docker
db_user = os.getenv("DB_USER", "root")
db_pass = os.getenv("DB_PASS", "password")
db_name = os.getenv("DB_NAME", "Whiteboard")
db_host = os.getenv("DB_HOST", "localhost")

# Connect to MySQL database
print(f"Connecting to mysql://{db_user}:{db_pass}@{db_host}/{db_name}")

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+mysqlconnector://{db_user}:{db_pass}@{db_host}/{db_name}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Project initialization finished


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
