"""
utils/db.py — PyMongo connection for LoveNest ML Service
Read-only access to MongoDB (same URI as Node.js backend)
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

_client: MongoClient | None = None
_db = None


def get_db():
    """Return the MongoDB database instance (singleton)."""
    global _client, _db
    if _db is None:
        uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/lovenest")
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Extract DB name from URI or use default
        db_name = uri.split("/")[-1].split("?")[0] or "lovenest"
        _db = _client[db_name]
    return _db


def get_collection(name: str):
    """Get a MongoDB collection by name."""
    return get_db()[name]
