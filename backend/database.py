from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# The user mentioned: postgresql database hostname is localhost and port is 5432 and username is postgres and password is ramkumar123
# They did not specify a DB name, so let's try to connect to the default 'postgres' db for now, or 'atm_wms'.
# Let's connect to 'postgres' database since it's guaranteed to exist, but a dedicated DB is better. 
# We'll use 'postgres' to avoid issues with DB not existing.
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:ramkumar123@localhost:5432/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
