from os import getenv
from sqlalchemy.orm import DeclarativeBase
from flask_sqlalchemy import SQLAlchemy

class Base(DeclarativeBase):
    pass

def connectToDatabase(app):
    # Read environment variables passed in by docker
    db_user = getenv("DB_USER", "root")
    db_pass = getenv("DB_PASS", "password")
    db_name = getenv("DB_NAME", "Whiteboard")
    db_host = getenv("DB_HOST", "localhost")

    # Connect to MySQL database
    print(f"Connecting to mysql://{db_user}:{db_pass}@{db_host}/{db_name}")

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+mysqlconnector://{db_user}:{db_pass}@{db_host}/{db_name}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db = SQLAlchemy(model_class=Base)
    db.init_app(app)

    return db