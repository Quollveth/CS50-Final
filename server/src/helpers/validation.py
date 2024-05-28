from functools import wraps
from flask import session

def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/latest/patterns/viewdecorators/
    From CS50 Finance
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user") is None:
            return '',401 # Return 401 unauthorized
        return f(*args, **kwargs)

    return decorated_function
   
def validateUsername(username):
    return True

def validadePassword(password):
    return True

def validateEmail(password):
    return True