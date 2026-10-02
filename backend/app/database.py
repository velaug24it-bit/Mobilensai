import os
import asyncio
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("mobilens.database")

MONGO_URI = os.getenv("MONGODB_URI", "mongodb+srv://velr012006_db_user:vel2006raj@cluster0.uxiis7h.mongodb.net/Mobilensai?retryWrites=true&w=majority")
DB_NAME = os.getenv("DATABASE_NAME", "Mobilensai")

class DatabaseManager:
    def __init__(self):
        self.is_mongo_connected = False
        self.client = None
        self.db = None
        self.mongo_uri = MONGO_URI
        self.db_name = DB_NAME

    def _sync_connect(self):
        import pymongo
        self.client = pymongo.MongoClient(self.mongo_uri, serverSelectionTimeoutMS=6000)
        self.client.admin.command('ping')
        self.db = self.client[self.db_name]
        self.is_mongo_connected = True

    async def connect(self):
        if not self.mongo_uri:
            logger.info("Database unavailable (no MONGODB_URI configured) — using demo data.")
            self.is_mongo_connected = False
            return

        try:
            await asyncio.to_thread(self._sync_connect)
            logger.info(f"Connected to live MongoDB Atlas database '{self.db_name}' successfully.")
        except Exception as e:
            logger.warning(f"MongoDB connection warning ({e}) — fallback to demo data.")
            self.is_mongo_connected = False

    async def disconnect(self):
        if self.client:
            await asyncio.to_thread(self.client.close)
            self.is_mongo_connected = False

    def get_collection(self, name: str):
        if self.is_mongo_connected and self.db is not None:
            return self.db[name]
        return None

db_manager = DatabaseManager()
