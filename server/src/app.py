# Python standard library imports
from datetime import datetime
from dateutil.parser import isoparse
import os
from enum import Enum
from base64 import b64decode
import uuid
from shutil import move

# Library imports
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image

# Flask imports
from flask import Flask, jsonify, request, send_from_directory, session, make_response, send_file
from flask_cors import CORS, cross_origin

# Project imports
from helpers.sql_helper import MySQL, User, Order, Submission, TakenOrder, Document
from helpers.validation import validateUsername, validadePassword, validateEmail, login_required

#### Initial setup
IN_DOCKER = os.getenv('IN_DOCKER',False)

# The database information comes from docker as it is set in the docker-compose file
# If we are not in docker, we create these variables ourselves, and load the .env file to get the others
if not IN_DOCKER:
    print('\nRunning outside of docker\n')

    from dotenv import load_dotenv
    load_dotenv() # Get the .env file for database info

    # Create missing environment variables that should come from docker
    os.environ['DB_HOST'] = '127.0.0.1'
    os.environ['DB_PORT'] = '3306'

is_debug = os.getenv('IN_DEBUG',None)
IN_DEBUG = is_debug == 'True'

if IN_DEBUG:
    def print(*args):
        import builtins
        builtins.print('\033[91mDEBUG:', *args, '\033[0m')
    print('\nRunning in debug mode!\n')

#### Paths setup

## Docker paths
# ./
#  \_ app
#    \_ src
#      \_ app.py
#  \_ server-data
#    \_ static


## Local paths
# ./
#  \_ server
#    \_ src
#      \_ app.py
#  \_ static

## We can only get app_dir, where the app.py is located
## We need to know where the base directory and the static folder are
app_dir = os.path.abspath(os.path.dirname(__file__))
base_dir = os.path.abspath(os.path.join(app_dir, '..', '..',)) # Go down two directories

if IN_DOCKER:
    static_dir = os.path.abspath(f'{(base_dir)}server-data/static/')  # From base go up to server-data and then to static
else:
    static_dir = os.path.abspath(f'{(base_dir)}/static/')    # From base go up to static

## Subpaths in static folder
submission_folder = os.path.join(static_dir,'submissions')
if not os.path.exists(submission_folder):
    os.makedirs(submission_folder)

profile_folder = os.path.join(static_dir,'profile')
if not os.path.exists(profile_folder):
    os.makedirs(profile_folder)

if IN_DEBUG:
    print(f'App dir: {app_dir}')
    print(f'Base dir: {base_dir}')
    print(f'Static dir: {static_dir}')

# Default profile image has to be in static folder for the CDN to work
# Docker can't copy to the volume during build, so we create the folder and copy the image here
if IN_DOCKER:
    if not os.path.exists(static_dir):
        # Static folder won't exist on first run
        os.makedirs(static_dir)
        if IN_DEBUG:
            print('Created static folder')

    source_file = os.path.abspath(os.path.join(base_dir, 'app', 'static', 'DEFAULT.png'))
    destination_file = os.path.join(profile_folder, 'DEFAULT.png')

    if IN_DEBUG:
        print(f'Source: {source_file}')
        print(f'Destination: {destination_file}')

    try:
        move(source_file, destination_file)
        if IN_DEBUG:
            print('Moved default image to static folder')

    except Exception as e:
        print(e)
        print('Failed to move default image to static folder')

#### Inital setup finished, server initializes here

if IN_DEBUG:
    print()
    print('Initial setup finished, server initializing\n')

app = Flask(__name__)

# CORS, all origins
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "*"}}
)

# HTTPS stuff
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
cert_pem = os.path.join(app_dir, 'localhost.pem')
key_pem = os.path.join(app_dir, 'localhost.key')

if IN_DEBUG:
    print(f'Cert: {cert_pem}')
    print(f'Key: {key_pem}')

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

if IN_DEBUG:
    print(f'DB Connection: {dbConnection}')

db = MySQL(dbConnection)


# Extras
app.config['STATIC_FOLDER'] = static_dir

if IN_DEBUG:
    print()
    print('Server initialized\n')

#### Server initialization finished

@app.route("/health", methods=["GET"])
def health():
    return "",200

####### User Management

# Check if username exists in the database
def userExists(username:str):
    if not username:
        return False

    user = username.lower()

    if db.read.user(username=user):
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

    if IN_DEBUG:
        keys = request.form.keys()
        print('Received register request:')
        for key in keys:
            print(f'{key}:{request.form.get(key)}')

    username = request.form.get('username')
    password = request.form.get('password')
    email = request.form.get('email')

    # Validate form data
    if not username or not password or not email:
        if IN_DEBUG:
            print('Invalid data')
        return jsonify({
            'result':RegistResult.INVALID.value,
        }), 400

    if not validateUsername(username):
        if IN_DEBUG:
            print('Invalid username')
        return jsonify({
            'result':RegistResult.INVALID.value,
        }), 400

    if not validadePassword(password):
        if IN_DEBUG:
            print('Invalid password')
        return jsonify({
            'result':RegistResult.INVALID.value,
        }), 400

    if not validateEmail(email):
        if IN_DEBUG:
            print('Invalid email')
        return jsonify({
            'result':RegistResult.INVALID.value,
        }), 400

    if IN_DEBUG:
        print('Data validated')

    # Check if username already exists
    if userExists(username):
        if IN_DEBUG:
            print('User already exists')
        return jsonify({
            'result':RegistResult.EXISTS.value
        }), 400

    # Assemble object
    userData = User(
        name=username.lower(),
        email=email.lower(),
        phash=generate_password_hash(password)
    )

    if IN_DEBUG:
        print('User object created')
        print(f'ID: {userData.uid}')
        print(f'Name: {userData.name}')
        print(f'Email: {userData.email}')
        print(f'Password: {userData.phash}')

    # DB Insertion
    db.Create.user(userData)

    return jsonify({
        'result':RegistResult.SUCCESS.value
    }), 200


##### Login
@app.route("/login",methods=['POST'])
def login():
    session.clear()

    username = request.form.get('username')
    password = request.form.get('password')

    if IN_DEBUG:
        print('Received login request:')
        keys = request.form.keys()
        for key in keys:
            print(f'{key}:{request.form.get(key)}')

    if not username or not password:
        return jsonify({
            'result':False
        }),400

    user = db.read.user(username=username.lower())

    if not user:
        return jsonify({
            'result':False
        }),400

    if not check_password_hash(user.phash,password):
        return jsonify({
            'result':False
        }),400

    session['user'] = user.uid

    return jsonify({
        'result':True,
        'uid':user.uid
    }),200


##### Logout
@app.route("/logout",methods=['GET'])
@login_required
def logout():
    session.clear()
    return '',200


#### User data
@app.route('/get-udata',methods=['GET'])
@login_required
def get_user_data():
    uid = session.get("user")

    user = db.Read.user(uid=uid)

    if not user:
        return '',400

    # Ensure image exists
    if not os.path.exists(f'{profile_folder}/{user.picture}.png'):
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

    if IN_DEBUG:
        print(f'Received update request for user {uid}:')
        keys = request.form.keys()
        for key in keys:
            print(f'{key}:{request.form.get(key)}')
        print()

    current_user = db.Read.user(uid=uid)
    if not current_user:
        return '',400

    username = request.form.get('username',current_user.name)
    email = current_user.email
    phash = current_user.phash

    # Upload image
    image = request.files.get('picture',None)
    if image:
        if IN_DEBUG:
            print('Received image')

        if image.content_type != 'image/png':
            if IN_DEBUG:
                print('Invalid image type')
            return '',400

        newImageName = str(uuid.uuid4())
        image.save(f'{profile_folder/{newImageName}.png}')

        if IN_DEBUG:
            print(f'Image saved as {newImageName}.png')

        # Delete old image
        if current_user.picture != 'DEFAULT':
            try:
                os.remove(f'{profile_folder/{current_user.picture}.png}')
                if IN_DEBUG:
                    print(f'Deleted {current_user.picture}.png')
            except Exception as e:
                print(e)
                if IN_DEBUG:
                    print('Failed to delete old image')

    picture = newImageName if image else current_user.picture

    # Update user
    newData = User(
        name=username,
        email=email,
        phash=phash,
        picture=picture
    )

    if IN_DEBUG:
        print('Updating user data')
        print(f'Name: {username}')
        print(f'Email: {email}')
        print(f'Picture: {picture}')

    db.Update.user(uid,newData)

    return '',200


#### Validate password
@app.route('/validate-password',methods=['POST'])
@login_required
def validate_password():
    uid = session.get("user")

    password = request.form.get('password')

    if not password:
        return '',400

    user = db.Read.user(uid=uid)
    if not check_password_hash(user.phash,password):
        return '',400

    return '',200


#### Delete user
@app.route('/delete-user',methods=['POST'])
@login_required
def delete_user():
    uid = session.get("user")
    if IN_DEBUG:
        print(f'Received delete request for user {uid}')

    password = request.form.get('password')
    user = db.Read.user(uid=uid)
    if not check_password_hash(user.phash,password):
        if IN_DEBUG:
            print('Invalid password')
        return '',400


    # Delete image
    if user.picture != 'DEFAULT':
        try:
            os.remove(f'{profile_folder/{user.picture}.png}')
            if IN_DEBUG:
                print(f'Deleted {user.picture}.png')
        except Exception as e:
            print(e)
            if IN_DEBUG:
                print('Failed to delete profile image') 

    # Delete all user orders
    ## TODO: Delete all user orders

    ## TODO: Update orders that were taken by user

    # Delete user
    db.Delete.user(uid)

    return '',200


@app.route('/get-username',methods=['GET'])
def get_username():
    uid = request.args.get('id')
    if not id:
        return '',400

    data = db.Read.user(uid=uid)
    if not data:
        return '',400

    return jsonify({
        'username':data.name
    }),200

####### Order Management

@app.route('/place-order',methods=['POST'])
@login_required
def place_order():
    uid = session.get("user")

    if IN_DEBUG:
        print('Received order request:')
        keys = request.form.keys()
        for key in keys:
            print(f'{key}:{request.form.get(key)}')
        print()

    name = request.form.get('order[name]')
    description = request.form.get('order[description]')
    deadline_str = request.form.get('order[deadline]')

    if IN_DEBUG:
        if not name:
            print('No name')
        if not description:
            print('No description')
        if not deadline_str:
            print('No deadline')
        if not placed_str:
            print('No placed')
        print()

    if not name or not description or not deadline_str:
        return '',400

    deadline = datetime.strptime(deadline_str, '%Y-%m-%d')
    recipient = uid

    order = Order(name,description,deadline,recipient)

    if IN_DEBUG:
        print('Order object created')
        print(f'Name: {order.name}')
        print(f'Desc: {order.description}')
        print(f'Deadline: {order.deadline}')
        print(f'Placed:{order.placed}')
        print(f'Creator: {order.recipient}')

        print()

    db.Create.order(order)
    return '',200

#### Get all available orders
@app.route('/get-all-orders',methods=['GET'])
@login_required
def get_all_orders():
    orders = db.Read.allOrders()

    if not orders:
        return '',400

    order_list = []

    #TODO: Remove expired orders

    for order in orders:
        order_list.append({
            'id':order.oid,
            'name':order.name,
            'description':order.description,
            'deadline':order.deadline.strftime('%Y-%m-%d'),
            'placed':order.placed.isoformat(),
            'recipient':order.recipient,
        })

    return jsonify(order_list),200

#### Get specific order
@app.route('/get-order',methods=['GET'])
def get_order():
    oid = request.args['id']
    if not oid:
        return '',400

    order = db.Read.order(oid=oid)
    if not order:
        return '',400

    return jsonify({
        'id'         :order.oid,
        'name'        :order.name,
        'description' :order.description,
        'deadline'    :order.deadline.strftime('%Y-%m-%d'),
        'placed'      :order.placed.isoformat(),
        'recipient'   :order.recipient,
        'taken'       :order.taken,
        'completed'   :order.completed
    }),200

#### Assign order to user
@app.route('/take-in-order',methods=['POST'])
@login_required
def take_in_order():
    oid = request.form.get('oid')
    uid = session.get("user")

    if not oid:
        return '',400
    if not uid:
        return '',400

    if IN_DEBUG:
        print(f'Received request to assign order {oid} to user {uid}')

    order = db.Read.order(oid)
    if not order:
        return '',400

    userOrder = TakenOrder(
        uid=uid,
        oid=oid
    )

    db.Create.takenOrder(userOrder)

    return  '',200


#### Get all orders assigned to user
@app.route('/get-user-orders',methods=['GET'])
@login_required
def get_user_orders():
    uid = session.get("user")

    orders = db.Read.userTakenOrders(uid)
    if not orders:
        return '',400

    order_list = []

    for order in orders:
        order_list.append({
            'id':order.oid,
            'name':order.name,
            'description':order.description,
            'deadline':order.deadline.strftime('%Y-%m-%d'),
            'placed':order.placed.isoformat(),
            'recipient':order.recipient,
            'taken':order.taken,
            'completed':order.completed
        })

    return jsonify(order_list),200


#### Submit file to order
@app.route('/submit-order',methods=['POST'])
@login_required
def submit_order():
    uid = session.get("user")

    if IN_DEBUG:
        print('Received file submission request:')
        keys = request.form.keys()
        for key in keys:
            print(f'{key}:{request.form.get(key)}')
        print()

    document = request.files.get('file',None)
    if not document:
        return '',400

    oid = request.form.get('order')
    if not oid:
        return '',400

    # Validate file
    #TODO: Validate file

    # Upload file
    extension = document.filename.split('.')[-1]

    newFileName = str(uuid.uuid4())
    document.save(f'{submission_folder}/{newFileName}.{extension}')

    if IN_DEBUG:
        print(f'File saved as {newFileName}.pdf')

    doc = Document(
        title=document.filename,
        filename=newFileName,
    )
    db.Create.document(doc)

    sub = Submission(
        uid=uid,
        oid=oid,
        did=doc.did
    )

    db.Create.submission(sub)

    return '',200


####### Static file serving

@app.route('/prof-pic/<path:filename>',methods=['GET'])
def serve_image(filename):
    return send_from_directory(profile_folder,filename)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, ssl_context=(cert_pem, key_pem), port=5000)