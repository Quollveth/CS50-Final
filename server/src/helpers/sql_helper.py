from sqlalchemy import (
    create_engine,
    Column,
    VARCHAR,
    Integer,
    REAL,
    Text,
    ForeignKey,
    DateTime,
    Table,
)
from sqlalchemy.orm import (
    sessionmaker,
    registry,
    relationship,
    Mapped,
    mapped_column,
    DeclarativeBase
)

from datetime import datetime

class BaseModel(DeclarativeBase):
    __abstract__ = True
    __allow_unmapped__ = True

    def __repr__(self):
        return f"<{self.__class__.__name__} {self.id}>"


##### SCHEMA #####

class User(BaseModel):
    __tablename__ = "users"

    uid = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(VARCHAR(50), unique=True, nullable=False)
    phash = Column(VARCHAR(255), nullable=False)
    picture = Column(VARCHAR(255), nullable=True, default='DEFAULT')

    placed_orders = relationship("PlacedOrders", back_populates="user")


class Order(BaseModel):
    __tablename__ = "orders"

    oid = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(VARCHAR(50), nullable=False)
    description = Column(Text, nullable=False)
    deadline = Column(DateTime, nullable=False, default=datetime.now)
    placed = Column(DateTime, nullable=False, default=datetime.now)

    placed_by = relationship("PlacedOrders", back_populates="order")


class PlacedOrders(BaseModel):
    __tablename__ = "placed_orders"

    uid = Column(Integer, ForeignKey("users.uid"), primary_key=True)
    oid = Column(Integer, ForeignKey("orders.oid"), primary_key=True)
    
    user = relationship("User", back_populates="placed_orders")
    order = relationship("Order", back_populates="placed_by")

##### WRAPPER ##### 

class MySQL:
    def __init__(self, url):
        fullUrl = "mysql://" + url + "?charset=utf8"
        engine = create_engine(
            fullUrl,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20,
            pool_timeout=30,
        )
        BaseModel.metadata.create_all(bind=engine)

        self.__factory = sessionmaker(bind=engine, expire_on_commit=False)

        self.create = self.Create(self)
        self.read = self.Read(self)
        self.update = self.Update(self)
        self.delete = self.Delete(self)

    #### CRUD ####

    class Create:
        def __init__(self, parent):
            self.parent = parent

        def user(self, user):
            if not isinstance(user, User):
                raise ValueError("user must be an instance of User")

            with self.parent.factory() as session:
                session.add(user)
                session.commit()

        def order(self, order, uid):
            if not isinstance(order, Order):
                raise ValueError("order must be an instance of Order")

            with self.parent.factory() as session:
                user = session.query(User).filter(User.uid == uid).first()
                placed_order = PlacedOrders(user=user, order=order)
                session.add_all([order,placed_order])
                session.commit()


    class Read:
        def __init__(self, parent):
            self.parent = parent

        def user(self, uid=None, username=None):
            if uid is None and username is None:
                raise ValueError("uid or username must be provided")

            with self.parent.factory() as session:
                if uid is not None:
                    user = session.query(User).filter(User.uid == uid).first()
                else:
                    user = session.query(User).filter(User.name == username).first()
            return user

        def order(self, oid=None):
            if oid is None:
                raise ValueError("oid must be provided")

            with self.parent.factory() as session:
                order = session.query(Order).filter(Order.oid == oid).first()

            return order

        def all_orders(self):
            with self.parent.factory() as session:
                orders = session.query(Order).all()
            return orders

        def user_placed_orders(self, uid):
            with self.parent.factory() as session:
                orders = session.query(Order).join(PlacedOrders).filter(PlacedOrders.uid == uid).all()
            return orders

    class Update:
        def __init__(self, parent):
            self.parent = parent

    class Delete:
        def __init__(self, parent):
            self.parent = parent

        def user(self, uid):
            with self.parent.factory() as session:
                user = session.query(User).filter(User.uid == uid).first()
                session.delete(user)
                session.commit()

        def order(self, oid):
            with self.parent.factory() as session:
                order = session.query(Order).filter(Order.oid == oid).first()

                # Delete associated records
                placed_orders = session.query(PlacedOrders).filter(PlacedOrders.oid == oid).first() # There should only be one
                session.delete(placed_orders)

                session.delete(order)
                session.commit()

    ########
    #### Enforce read-only session factory ####

    @property
    def factory(self):
        return self.__factory

    @factory.setter
    def factory(self, value):
        raise AttributeError("Cannot set session attribute")

    @factory.deleter
    def factory(self):
        raise AttributeError("Cannot delete session attribute")
# }