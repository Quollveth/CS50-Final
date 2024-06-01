# Python standard library imports
import os
from enum import Enum
import base64
import uuid

# Library imports
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image

# Flask imports
from flask import Flask, jsonify, request, send_from_directory, session, make_response, send_file
from flask_cors import CORS, cross_origin

# Project imports
from helpers.sql_helper import MySQL, User
from helpers.validation import validateUsername, validadePassword, validateEmail, login_required


# Server setup
app_dir = os.path.abspath(os.path.dirname(__file__)) # ./server/src
basedir = os.path.join(app_dir, '..', '..') # ./

app = Flask(__name__) 

# Load environment variables
if not os.getenv('IN_DOCKER',False):
    from dotenv import load_dotenv
    load_dotenv()
    os.environ['DB_HOST'] = '127.0.0.1'
    os.environ['DB_PORT'] = '3306'


# CORS, all origins
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "*"}}
)

# HTTPS stuff
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
cert_pem = os.getenv('CERT_PATH')
key_pem = os.getenv('KEY_PATH')

# Session
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"


# Connect to database
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_name = os.getenv("DB_NAME")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")

dbConnection = "{}:{}@{}:{}/{}".format(db_user,db_pass,db_host,db_port,db_name)

db = MySQL(dbConnection)

# Extras
app.config['STATIC_FOLDER'] = f'{os.path.abspath(basedir)}/static/'


# Server initialization finished
@app.route("/health", methods=["GET"])
def hello():
    return "",200

# Check if username exists in the database
def userExists(username):
    user = username.lower()

    usernames = db.get_usernames()

    for name in usernames:
        if user == name[0]:
            return True
    
    return False

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


#### Registration
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


##### Login
@app.route("/login",methods=['POST'])
def login():
    session.clear()

    username = request.form.get('username')
    password = request.form.get('password')

    user = db.get_user_data(username=username.lower())

    if not user:
        return jsonify({
            'result':'INVALID'
        }),400

    if not check_password_hash(user.phash,password):
        return jsonify({
            'result':'INVALID'
        }),400

    session['user'] = user.uid

    return '',200


##### Logout
@app.route("/logout",methods=['GET'])
def logout():
    session.clear()
    return '',200


#### User data
@app.route('/get-udata',methods=['GET'])
@login_required
def get_user_data():
    uid = session.get("user")

    user = db.get_user_data(uid=uid)

    # Ensure image exists
    if not os.path.exists(f'{app.config["STATIC_FOLDER"]}/{user.picture}.png'):
        user.picture = 'DEFAULT'

    return jsonify({
        'username':user.name,
        'email':user.email,
        'picture':f'{user.picture}.png'
    }),200


#### Update user data
@app.route('/update-udata',methods=['POST'])
@login_required
def update_user_data():
    uid = session.get("user")

    # Get current data
    curr = db.get_user_data(uid=uid)

    # Save image to static folder
    image = request.form.get('picture')
    if image:
        imageId = str(uuid.uuid4())
        binaryData = base64.b64decode(image)
        with open(f'{app.config["STATIC_FOLDER"]}/{imageId}.png','wb') as f:
            f.write(binaryData)

            # Check if image is valid
            try:
                img = Image.open(f'{app.config["STATIC_FOLDER"]}/{imageId}.png')

                if img.format != 'PNG':
                    os.remove(f'{app.config["STATIC_FOLDER"]}/{imageId}.png')
                    imageId = 'DEFAULT'
                    print('Image must be a png')
                    return '',400

                # Resize image
                img.thumbnail((600,600))
                img.close()

            except Exception as e:
                print(e)
                os.remove(f'{app.config["STATIC_FOLDER"]}/{imageId}.png')
                imageId = 'DEFAULT'
                print('Invalid file type')
                return '',400

    else:
        imageId = curr.picture

    username = request.form.get('username')

    if username:
        if not validateUsername(username):
            print('Invalid username')
            return '',400

        if userExists(username) and username.lower() != curr.name.lower():
            print('Username already exists')
            return '',400
    else:
        username = curr.name

    # Update user data
    new_data = {
        'name':username,
        'picture':imageId,
    }

    db.update_user(uid,new_data)

    return '',200


#### Validate password
@app.route('/validate-password',methods=['POST'])
@login_required
def validate_password():
    uid = session.get("user")

    password = request.form.get('password')

    if not password:
        return '',400
    
    user = db.get_user_data(uid=uid)
    if not check_password_hash(user.phash,password):
        return '',400

    return '',200



#### Delete user
@app.route('/delete-user',methods=['POST'])
@login_required
def delete_user():
    uid = session.get("user")
    password = request.form.get('password')
    user = db.get_user_data(uid=uid)
    if not check_password_hash(user.phash,password):
        return '',400

    db.delete_user(uid)

    return '',200

@app.route('/image/<path:filename>',methods=['GET'])
def serve_image(filename):
    return send_from_directory(app.config['STATIC_FOLDER'],filename)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, ssl_context=(cert_pem, key_pem), port=5000)