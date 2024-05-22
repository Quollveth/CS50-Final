from sqlalchemy import create_engine, Column, VARCHAR, Integer, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class User(Base):
    __tablename__ = 'test'
    id = Column('id', Integer, primary_key=True)
    name = Column('name', VARCHAR(50), nullable=False)
    email = Column('email', VARCHAR(100), nullable=True)

    def __init__(self, name, email):
        self.name = name
        self.email = email


class MySQL():
    def __init__(self,url):
        """Simple wrapper around SQLAlchemy for MySQL database
        
        Keyword arguments:
        connection -- user:password@host:port/name
        Return: MySQL Object for database querying
        """
        fullUrl = 'mysql://'+url+'?charset=utf8'  # Add charset=utf8 to the connection URL

        engine = create_engine(fullUrl)
        Base.metadata.create_all(bind=engine)

        Session = sessionmaker(bind=engine)
        self.session = Session()
        #engine.execute("SET GLOBAL max_allowed_packet=1073741824")

        u1 = User('Bob','bob@mail.com')
        u2 = User('Anna','anna@mail.com')
        u3 = User('Charlie','carl@mail.com')
        u3 = User('Denise','dens@mail.com')
        u3 = User('Elliot','elly@mail.com')


        self.session.add(u1)
        self.session.add(u2)
        self.session.add(u3)

        self.session.commit()