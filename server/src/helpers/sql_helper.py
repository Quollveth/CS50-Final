from sqlalchemy import create_engine, Column, VARCHAR, Integer, Text, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, registry, relationship

Base = declarative_base()

class Order(Base):
    __tablename__ = "orders"
    oid = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", Text, nullable=False)
    description = Column("description", Text, nullable=False)
    deadline = Column("deadline", DateTime, nullable=False)
    placed = Column("placed", DateTime, nullable=False)
    taken = Column("taken",Integer, nullable=False)
    completed = Column("completed",Integer, nullable=False)

    recipient = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="orders")

    def __init__(self, name, description, deadline, placed, recipient):
        self.name = name
        self.description = description
        self.deadline = deadline
        self.placed = placed
        self.recipient = recipient
        self.taken = 0
        self.completed = 0


class User(Base):
    __tablename__ = "users"
    uid = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", VARCHAR(50), nullable=False)
    phash = Column("hash", Text, nullable=False)
    email = Column("email", Text, nullable=False)
    picture = Column("picture", Text, nullable=False)

    orders = relationship("Order", back_populates="user")

    def __init__(self, name, phash, email):
        self.name = name
        self.phash = phash
        self.email = email
        self.picture = 'DEFAULT' # Means default picture


class MySQL:
    """
    A simple wrapper around SQLAlchemy for MySQL database.

    Attributes:
    - session: The session object for database querying.

    Methods:
    - __init__(self, url): Initializes the MySQL object.
    - get_usernames(self): Retrieves all usernames from the database.
    - insert(self, object): Inserts an object into the database.
    - get_user_data(self, uid=None, username=None): Retrieves user data from the database.
    - update_user(self, uid, new_data): Updates user data in the database.
    """

    @property
    def session(self):
        return self._session

    @session.setter
    def session(self, any):
        raise AttributeError("Cannot overwrite session attribute")

    def __init__(self, url):
        """
        Initializes the MySQL object.

        Args:
        - url: The connection URL for the MySQL database.

        Returns:
        - MySQL object for database querying.
        """
        fullUrl = (
            "mysql://" + url + "?charset=utf8"
        )

        engine = create_engine(fullUrl, pool_recycle=3600, pool_size=10, max_overflow=20, pool_timeout=30, )
        Base.metadata.create_all(bind=engine)
        factory = sessionmaker(bind=engine)

        self._session = factory()

    def insert(self, object):
        """
        Inserts an object into the database.

        Args:
        - object: The object to be inserted into the database.
        """
        self._session.add(object)
        self._session.commit()

    def get_usernames(self):
        """
        Retrieves all usernames from the database.

        Returns:
        - A list of usernames.
        """
        return self._session.query(User.name).all()

    def get_user_data(self, uid=None, username=None):
        """
        Retrieves user data from the database.

        Args:
        - uid: The ID of the user to retrieve.
        - username: The username of the user to retrieve.

        Returns:
        - The User object corresponding to the specified ID or username.
        """
        if uid and username:
            raise ValueError("Cannot specify both uid and username")

        if uid:
            return self._session.query(User).filter_by(uid=uid).first()
        if username:
            return self._session.query(User).filter_by(name=username).first()

        raise ValueError("Must specify either uid or username")

    def update_user(self, uid, new_data):
        """
        Updates user data in the database.

        Args:
        - uid: The ID of the user to update.
        - new_data: A dictionary containing the new data for the user.
        """
        user = self._session.query(User).filter_by(uid=uid).first()

        if not user:
            raise ValueError(f"User with ID {uid} not found.")

        for key, value in new_data.items():
            setattr(user, key, value)
            self._session.commit()

    def delete_user(self,uid):
        """
        Deletes a user from the database.

        Args:
        - uid: The ID of the user to delete.
        """
        user = self._session.query(User).filter_by(uid=uid).first()

        if not user:
            raise ValueError(f"User with ID {uid} not found.")

        self._session.delete(user)
        self._session.commit()