from sqlalchemy import (
    create_engine,
    Column,
    VARCHAR,
    Integer,
    Text,
    ForeignKey,
    DateTime,
    Table,
)
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
    taken = Column("taken", Integer, nullable=False)
    completed = Column("completed", Integer, nullable=False)

    recipient = Column(Integer, ForeignKey("users.id"), nullable=False)

    users = relationship("User", secondary="user_orders", back_populates="orders")

    def __init__(self, name, description, deadline, placed, recipient):
        self.name = name
        self.description = description
        self.deadline = deadline
        self.placed = placed
        self.recipient = recipient
        self.taken = 0
        self.completed = 0
###

class User(Base):
    __tablename__ = "users"
    uid = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", VARCHAR(50), nullable=False)
    phash = Column("hash", Text, nullable=False)
    email = Column("email", Text, nullable=False)
    picture = Column("picture", Text, nullable=False)

    orders = relationship("Order", secondary="user_orders", back_populates="users")

    def __init__(self, name, phash, email, picture = "DEFAULT"):
        self.name = name
        self.phash = phash
        self.email = email
        self.picture = picture
###

### Association tables ###
class Submission(Base):
    __tablename__ = "submissions"
    uid = Column(Integer, ForeignKey('users.id'), primary_key=True)
    oid = Column(Integer, ForeignKey('orders.id'), primary_key=True)
    index = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(Text, nullable=False)

    user = relationship("User")
    order = relationship("Order")

    def __init__(self, uid, oid, filename):
        self.uid = uid
        self.oid = oid
        self.filename = filename
###

user_orders = Table(
    "user_orders",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("order_id", Integer, ForeignKey("orders.id"), primary_key=True),
)

class dbCache:
    def __init__(self):
        self.users = {}
        self.orders = {}

    def clear(self):
        self.users = {}
        self.orders = {}

    def invalidate_user(self, uid):
        if uid in self.users:
            del self.users[uid]

    def invalidate_order(self, oid):
        if oid in self.orders:
            del self.orders[oid]
###

class MySQL:
    """
    A simple wrapper around SQLAlchemy for MySQL database.
    """

    def __init__(self, url):
        """Initialize the MySQL object.

        Keyword arguments:
        url -- the database URL in the format "user:password@host:port/database" not including the "mysql://" prefix
        """

        fullUrl = "mysql://" + url + "?charset=utf8"
        engine = create_engine(
            fullUrl,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20,
            pool_timeout=30,
        )
        Base.metadata.create_all(bind=engine)
        self.__factory = sessionmaker(bind=engine, expire_on_commit=True)
        self.__cache = dbCache()

    #### Enforce read-only session factory and cache ####

    @property
    def factory(self):
        return self.__session

    @factory.setter
    def factory(self, value):
        raise AttributeError("Cannot set session attribute")

    @factory.deleter
    def factory(self):
        raise AttributeError("Cannot delete session attribute")

    @property
    def cache(self):
        return self.__cache

    @cache.setter
    def cache(self, value):
        raise AttributeError("Cannot set cache attribute")

    @cache.deleter
    def cache(self):
        raise AttributeError("Cannot delete cache attribute, use clear_cache()")

    def clear_cache(self):
        self.__cache.clear()

    #### Operations ####

    ## Insert ##
    def insert_user(self, user):
        """Insert a user object into the database.

        Arguments:
        user -- user object to insert

        Raises:
        ValueError -- if user is not a User object
        """
        if not isinstance(user, User):
            raise ValueError("Must insert User object")

        self.__cache.invalidate_user(user.uid)

        with self.__factory() as session:
            session.add(user)
            session.commit()

    def insert_order(self, order):
        """Insert a order object into the database.

        Arguments:
        order -- order object to insert

        Raises:
        ValueError -- if order is not a Order object
        """
        if not isinstance(order, Order):
            raise ValueError("Must insert Order object")

        self.__cache.invalidate_order(order.oid)
        with self.__factory() as session:
            session.add(order)
            session.commit()

    def insert_user_order(self, uid, oid):
        """Insert a user-order relationship into the database.

        Arguments:
        uid -- user id
        oid -- order id

        Raises:
        ValueError -- if either uid or oid is not specified
        """
        if not uid or not oid:
            raise ValueError("Must specify both user and order id")

        with self.__factory() as session:
            if uid in self.__cache.users and oid in self.__cache.orders:
                user = self.__cache.users[uid]
                order = self.__cache.orders[oid]
            else:
                user = session.query(User).filter_by(uid=uid).first()
                order = session.query(Order).filter_by(oid=oid).first()

            user.orders.append(order)
            session.commit()

            self.__cache.invalidate_user(uid)
            self.__cache.invalidate_order(oid)

    def insert_submission(self, submission):
        """Insert a submission object into the database.

        Arguments:
        submission -- submission object to insert

        Raises:
        ValueError -- if submission is not a Submission object
        """
        if not isinstance(submission, Submission):
            raise ValueError("Must insert Submission object")

        print('Inserting submission')
        print(submission)
        print(submission.uid, submission.oid, submission.filename)
            
        with self.__factory() as session:
            session.add(submission)
            session.commit()

    ## Query ##

    def query_user(self, uid=None, username=None):
        """Query the database for a user object.

        Keyword arguments:
        uid -- the user id to query
        username -- the username to query

        Returns:
        User object if found, None otherwise

        Raises:
        ValueError -- if both uid and username are specified
        ValueError -- if neither uid nor username are specified
        """
        if uid and username:
            raise ValueError("Cannot query by both uid and username")
        if not uid and not username:
            raise ValueError("Must query by either uid or username")

        if uid and self.__cache.users.get(uid):
            return self.__cache.users[uid]

        with self.__factory() as session:
            if uid:
                uData = session.query(User).filter_by(uid=uid).first()
            else:
                uData = session.query(User).filter_by(name=username).first()
        self.__cache.users[uid] = uData
        return uData

    def query_all_users(self):
        """Query all users from the database

        Returns:
        List of User objects
        """
        with self.__factory() as session:
            users = session.query(User).all()
        return users

    def query_order(self, oid):
        """Query the database for a order object.

        Keyword arguments:
        oid -- the order id to query

        Returns:
        Order object if found, None otherwise

        Raises:
        ValueError -- if oid is not specified
        """

        if not oid:
            raise ValueError("Must specify order id")

        if oid in self.__cache.orders:
            return self.__cache.orders[oid]

        with self.__factory() as session:
            oData = session.query(Order).filter_by(oid=oid).first()
            self.__cache.orders[oid] = oData
        return oData

    def query_all_orders(self):
        """Query all orders from the database

        Returns:
        List of Order objects
        """
        with self.__factory() as session:
            orders = session.query(Order).all()
        return orders

    def query_user_orders(self, uid):
        """Query all orders for a user from the database

        Keyword arguments:
        uid -- the user id to query

        Returns:
        List of Order objects

        Raises:
        ValueError -- if uid is not specified
        """
        if not uid:
            raise ValueError("Must specify user id")
        with self.__factory() as session:
            orders = session.query(User).filter_by(uid=uid).first().orders
        return orders

    def query_order_users(self, oid):
        """Query all users for a order from the database

        Keyword arguments:
        oid -- the order id to query

        Returns:
        List of User objects

        Raises:
        ValueError -- if oid is not specified
        """
        if not oid:
            raise ValueError("Must specify order id")
        with self.__factory() as session:
            users = session.query(Order).filter_by(oid=oid).first().users
        return users

    def query_user_placed_orders(self, uid):
        """Query all orders placed by a user from the database

        Keyword arguments:
        uid -- the user id to query

        Returns:
        List of Order objects

        Raises:
        ValueError -- if uid is not specified
        """
        if not uid:
            raise ValueError("Must specify user id")
        with self.__factory() as session:
            orders = (
                session.query(Order)
                .filter_by(recipient=uid)
                .all()
            )
        return orders

    ## Update ##

    def update_user(self, uid, newData):
        """Update a user object in the database.

        Keyword arguments:
        uid -- the user id to update
        newData -- the new user object to update with

        Raises:
        ValueError -- if newData is not a User object
        ValueError -- if uid is not specified
        """

        if not isinstance(newData, User):
            raise ValueError("Must update with User object")

        if not uid:
            raise ValueError("Must specify user id")

        self.__cache.invalidate_user(uid)
        with self.__factory() as session:
            session.query(User).filter_by(uid=uid).update({
                User.uid: uid,
                User.name: newData.name,
                User.phash: newData.phash,
                User.email: newData.email,
                User.picture: newData.picture
            })
            session.commit()

    def update_order(self, oid, newData):
        """Update a order object in the database.

        Keyword arguments:
        oid -- the order id to update
        newData -- the new order object to update with

        Raises:
        ValueError -- if newData is not a Order object
        ValueError -- if oid is not specified
        """
        if not isinstance(newData, Order):
            raise ValueError("Must update with Order object")

        if not oid:
            raise ValueError("Must specify order id")

        self.__cache.invalidate_order(oid)
        with self.__factory() as session:
            session.query(Order).filter_by(oid=oid).update({
                Order.oid: oid,
                Order.name: newData.name,
                Order.description: newData.description,
                Order.deadline: newData.deadline,
                Order.placed: newData.placed,
                Order.taken: newData.taken,
                Order.completed: newData.completed,
                Order.recipient: newData.recipient
            })
            session.commit()

    ## Delete ##
    def delete_user(self, uid):
        """Delete a user object from the database.

        Keyword arguments:
        uid -- the user id to delete

        Raises:
        ValueError -- if uid is not specified
        """

        if not uid:
            raise ValueError("Must specify user id")

        self.__cache.invalidate_user(uid)
        with self.__factory() as session:
            session.query(User).filter_by(uid=uid).delete()
            session.commit()

    def delete_order(self, oid):
        """Delete a order object from the database.

        Keyword arguments:
        oid -- the order id to delete

        Raises:
        ValueError -- if oid is not specified
        """
        if not oid:
            raise ValueError("Must specify order id")

        self.__cache.invalidate_order(oid)
        with self.__factory() as session:
            session.query(Order).filter_by(oid=oid).delete()
            session.commit()

    ########
# }