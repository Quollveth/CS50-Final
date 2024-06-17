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
from helpers.sql_helper import MySQL, User, Order
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
    destination_file = os.path.join(static_dir, 'DEFAULT.png')

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
cert_pem = app_dir + '/localhost.pem'
key_pem = app_dir + '/localhost.key'

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
def hello():
    return "",200

####### User Management

# Check if username exists in the database
def userExists(username:str):
    if not username:
        return False

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

    if IN_DEBUG:
        print('Received login request:')
        keys = request.form.keys()
        for key in keys:
            print(f'{key}:{request.form.get(key)}')

    if not username or not password:
        return jsonify({
            'result':False
        }),400

    user = db.get_user_data(username=username.lower())

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

    user = db.get_user_data(uid=uid)

    if not user:
        return '',400

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
        binaryData = b64decode(image)
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


@app.route('/get-username',methods=['GET'])
def get_username():
    uid = request.args.get('id')
    if not id:
        return '',400

    data = db.get_user_data(uid=uid)
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
    placed_str = request.form.get('order[placed]')

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

    if not name or not description or not deadline_str or not placed_str:
        return '',400

    deadline = datetime.strptime(deadline_str, '%Y-%m-%d')
    placed = isoparse(placed_str)
    recipient = uid

    order = Order(name,description,deadline,placed,recipient)

    if IN_DEBUG:
        print('Order object created')
        print(f'Name: {order.name}')
        print(f'Desc: {order.description}')
        print(f'Deadline: {order.deadline}')
        print(f'Placed:{order.placed}')
        print(f'Creator: {order.recipient}')

        print()

    db.insert(order)
    return '',200

#### Get all available orders
@app.route('/get-all-orders',methods=['GET'])
@login_required
def get_all_orders():
    orders = db.get_orders()

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
        })

    return jsonify(order_list),200

#### Get specific order
@app.route('/get-order',methods=['GET'])
def get_order():
    oid = request.args['id']
    if not oid:
        return '',400

    order = db.get_order_data(oid=oid)
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

    order = db.get_order_data(oid=oid)
    if not order:
        return '',400

    db.take_order(oid,uid)

    return  '',200


#### Get all orders assigned to user
@app.route('/get-user-orders',methods=['GET'])
@login_required
def get_user_orders():
    uid = session.get("user")

    orders = db.get_user_orders(uid)
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

####### Static file serving

@app.route('/image/<path:filename>',methods=['GET'])
def serve_image(filename):
    return send_from_directory(app.config['STATIC_FOLDER'],filename)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, ssl_context=(cert_pem, key_pem), port=5000)