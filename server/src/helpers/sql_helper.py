from sqlalchemy import create_engine, Column, VARCHAR, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, registry

Base = declarative_base()

class User(Base):
    __tablename__ = "Users"
    uid = Column("id", Integer, primary_key=True, autoincrement=True)
    name = Column("name", VARCHAR(50), nullable=False)
    phash = Column("hash", Text, nullable=False)
    email = Column("email", Text, nullable=False)
    picture = Column("picture", Text, nullable=False)

    def __init__(self, name, phash, email):
        self.name = name
        self.phash = phash
        self.email = email
        self.picture = 'DEFAULT' # Means default picture

class MySQL:

    @property
    def session(self):
        return self._session

    @session.setter
    def session(self, any):
        raise AttributeError("Cannot overwrite session attribute")

    def __init__(self, url):
        """Simple wrapper around SQLAlchemy for MySQL database

        Keyword arguments:
        connection -- user:password@host:port/name
        Return: MySQL Object for database querying
        """
        fullUrl = (
            "mysql://" + url + "?charset=utf8"
        )

        engine = create_engine(fullUrl)
        Base.metadata.create_all(bind=engine)
        factory = sessionmaker(bind=engine)

        self._session = factory()

    def insert(self,object):
        self._session.add(object)
        self._session.commit()

