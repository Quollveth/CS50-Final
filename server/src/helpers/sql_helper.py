from sqlalchemy import create_engine, Column, VARCHAR, Integer, Text, ForeignKey, DateTime, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, registry, relationship

Base = declarative_base()


user_orders = Table(
    'user_orders', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('order_id', Integer, ForeignKey('orders.id'), primary_key=True)
)


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

    users = relationship(
        "User",
        secondary=user_orders,
        back_populates="orders"
    )

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

    orders = relationship(
        "Order",
        secondary=user_orders,
        back_populates="users"
    )

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
        self._session.refresh(object)

    ###### User related functions

    def get_usernames(self):
        """
        Retrieves all usernames from the database.

        Returns:
        - A list of usernames.
        """
        usernames = self._session.query(User.name).all()

        return usernames

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
        self._session.refresh(user)

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
        self._session.refresh(user)

    ###### Orders related functions

    def get_orders(self):
        """
        Retrieves all orders from the database.

        Returns:
        - A list of orders.
        """
        return self._session.query(Order).all()

    def get_order_data(self, oid):
        """
        Retrieves order data from the database.

        Args:
        - oid: The ID of the order to retrieve.

        Returns:
        - The Order object corresponding to the specified ID.
        """
        return self._session.query(Order).filter_by(oid=oid).first()

    def update_order(self, oid, new_data):
        """
        Updates order data in the database.

        Args:
        - oid: The ID of the order to update.
        - new_data: A dictionary containing the new data for the order.
        """
        order = self._session.query(Order).filter_by(oid=oid).first()

        if not order:
            raise ValueError(f"Order with ID {oid} not found.")

        for key, value in new_data.items():
            setattr(order, key, value)
            self._session.commit()
            self._session.refresh(order)

    def take_order(self,oid,uid):
        """
        Assigns a order to a user
        Multiple users can take the same order

        Keyword arguments:
        oid -- Order ID
        uid -- User ID

        Raises:
        ValueError -- If the order or user is not found
        ValueError -- If the user is already associated with the order
        """
        order = self._session.query(Order).filter_by(oid=oid).first()
        user = self._session.query(User).filter_by(uid=uid).first()

        if not order:
            raise ValueError(f"Order with ID {oid} not found.")

        if not user:
            raise ValueError(f"User with ID {uid} not found.")

        if user not in order.users:
            order.users.append(user)
            self._session.commit()
            self._session.refresh(order)
            return

        raise ValueError(f"User with ID {uid} is already associated with order ID {oid}.")
        