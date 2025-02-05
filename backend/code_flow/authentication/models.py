from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import logging
from django.contrib.auth.models import AbstractBaseUser

# Load environment variables
load_dotenv()

MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "authentication")
MONGO_DB_URI = os.getenv("MONGO_DB_HOST")

# Set up logger (you can adjust the logging level based on your needs)
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# Create a MongoDB connection
try:
    client = MongoClient(MONGO_DB_URI)
    db = client[MONGO_DB_NAME]
except Exception as e:
    logger.error(f"MongoDB connection failed: {e}")
    logger.error("Database connection failed.")


class User:
    collection = db["users"]

    def __init__(self, email, id=None):
        self.email = email
        self.id = str(id) if id else None
        
    # This is needed for SimpleJWT
    @property
    def is_active(self):
        return True

    @staticmethod
    def create_user(email, password):
        hashed_password = generate_password_hash(password)
        user_data = {"email": email, "password": hashed_password}
        result = User.collection.insert_one(user_data)
        return User(email=email, id=result.inserted_id)

    @staticmethod
    def find_by_email(email):
        user_data = User.collection.find_one({"email": email})
        if user_data:
            return User(
                email=user_data['email'],
                id=user_data['_id']
            ), user_data['password']
        return None, None

    @staticmethod
    def verify_password(stored_password, input_password):
        return check_password_hash(stored_password, input_password)

