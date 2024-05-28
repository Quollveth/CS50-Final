# Python standard library imports
import os
from enum import Enum

# Library imports
from werkzeug.security import generate_password_hash, check_password_hash

# Flask imports
from flask import Flask, jsonify, render_template, request, url_for, redirect, session
from flask_cors import CORS
from flask_session import Session

# Project imports
from helpers.sql_helper import MySQL, User
from helpers.validation import validateUsername, validadePassword, validateEmail


# Server setup
basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "*"}}
)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Connect to database
db_user = os.getenv("DB_USER", "root")
db_pass = os.getenv("DB_PASS", "password")
db_host = os.getenv("DB_HOST", "127.0.0.1")
db_port = os.getenv("DB_PORT", "3306")
db_name = os.getenv("DB_NAME", "dashboard")

dbConnection = "{}:{}@{}:{}/{}".format(db_user,db_pass,db_host,db_port,db_name)

db = MySQL(dbConnection)

# Server initialization finished

def userExists(username):
    user = username.lower()

    usernames = db.session\
        .query(User)\
        .filter(User.name == user)\
        .all()
    
    return len(usernames) > 0

# Verify if username exists
@app.route("/check-user", methods=["POST"])
def check_user():
    toCheck = request.form.get('username')

    if not toCheck:
        return '',400

    exists = userExists(toCheck)

    return jsonify({
        'exists':exists
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
        }), 400

    if not validateUsername(username):
        return jsonify({
            'result':RegistResult.INVALID.value,
        }), 400

    if not validadePassword(password):
        return jsonify({
            'result':RegistResult.INVALID.value,
        }), 400

    if not validateEmail(email):
        return jsonify({
            'result':RegistResult.INVALID.value,
        }), 400

    # Check if username already exists
    if userExists(username):
        return jsonify({
            'result':RegistResult.EXISTS.value
        }), 400

    # Assemble object
    userData = User(
        name=username.lower(),
        email=email.lower(),
        phash=generate_password_hash(password)
    )

    # DB Insertion
    db.insert(userData)

    return jsonify({
        'result':RegistResult.SUCCESS.value
    }), 200


@app.route("/login",methods=['POST'])
def login():
    session.clear()

    username = request.form.get('username')
    password = request.form.get('password')

    user = db.session\
        .query(User)\
        .filter(User.name == username)\
        .first()

    if not user:
        return jsonify({
            'result':'INVALID'
        }),400

    if not check_password_hash(user.phash,password):
        return jsonify({
            'result':'INVALID'
        }),400

    session['user'] = user.uid

    # Create session
    return '',200

@app.route('/get-user',methods=['GET'])
def get_user():
    uid = session.get('user',None)
    if not uid:
        return '',400

    uname = db.session\
        .query(User)\
        .filter(User.uid == uid)\
        .first()

    if not uname:
        return '',400

    response = jsonify({
        'id':uid,
        'name':uname.name
    })

    return response, 200

# Entrypoint
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
