# Python standard library imports
import os
import uuid
from enum import Enum

# Flask imports
from flask import Flask, jsonify, render_template, request, url_for, redirect
from flask_cors import CORS
from flask_session import Session

# Project imports
from helpers.sql_helper import MySQL
from helpers.validation import validateUsername, validadePassword, validateEmail


# Server setup
basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
CORS(app)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Connect to database
db_user = os.getenv("DB_USER", "root")
db_pass = os.getenv("DB_PASS", "password")
db_host = os.getenv("DB_HOST", "127.0.0.1")
db_port = os.getenv("DB_PORT", "3306")
db_name = os.getenv("DB_NAME", "Chatterer")

dbConnection = "{}:{}@{}:{}/{}".format(db_user,db_pass,db_host,db_port,db_name)

db = MySQL(dbConnection)

# Server initialization finished


@app.route("/test", methods=["GET", "POST"])
def test():
    print("running")

    
    # Perform database query
    

    return jsonify('success'), 200


# Validade server side session
@app.route("/validate", methods=["POST"])
def validate():
    print(f'Validating token')
    return jsonify({
        'valid':False,
        'token':'session token'
    }),200

class RegistResult(Enum):
    INVALID = 'INVALID' #Invalid data
    EXISTS = 'EXISTS' # User already exists
    SUCCESS = 'SUCCESS' # Success

@app.route("/register", methods=["POST"])
def register():
    
    print('Received register request:')
    keys = request.form.keys()
    for key in keys:
        print(f'{key}:{request.form.get(key)}')

    username = request.form.get('username')
    password = request.form.get('password')
    email = request.form.get('email')

    # Validate form data
    if not username or not password or not email:
        return jsonify({
            'result':RegistResult.INVALID.value,
            'error':'Missing required field'
        }), 400

    if not validateUsername(username):
        return jsonify({
            'result':RegistResult.INVALID.value,
            'error':'Invalid username'
        }), 400

    if not validadePassword(password):
        return jsonify({
            'result':RegistResult.INVALID.value,
            'error':'Invalid password'
        }), 400

    if not validateEmail(email):
        return jsonify({
            'result':RegistResult.INVALID.value,
            'error':'Invalid email'
        }), 400

    # Check if username already exists
    # TODO:Perform DB Query

    return jsonify({
        'result':RegistResult.SUCCESS.value
    }), 200


# Entrypoint
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
