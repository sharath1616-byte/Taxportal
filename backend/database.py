from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
from typing import List, Optional, Dict, Any
import os
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

# Database instance
database = Database()

async def get_database():
    return database.db

async def connect_to_mongo():
    """Create database connection"""
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'taxportal')
    
    database.client = AsyncIOMotorClient(mongo_url)
    database.db = database.client[db_name]
    
    # Create indexes
    await create_indexes()
    logger.info("Connected to MongoDB")

async def close_mongo_connection():
    """Close database connection"""
    database.client.close()
    logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Users collection indexes
        await database.db.users.create_index("email", unique=True)
        await database.db.users.create_index("role")
        
        # Clients collection indexes  
        await database.db.clients.create_index("userId")
        await database.db.clients.create_index("taxProfessionalId")
        await database.db.clients.create_index([("userId", 1), ("taxYear", 1)], unique=True)
        
        # Documents collection indexes
        await database.db.documents.create_index("clientId")
        await database.db.documents.create_index("uploadedBy")
        await database.db.documents.create_index("category")
        
        # Tasks collection indexes
        await database.db.tasks.create_index("clientId")
        await database.db.tasks.create_index("assignedTo")
        await database.db.tasks.create_index("status")
        await database.db.tasks.create_index("dueDate")
        
        # Messages collection indexes
        await database.db.messages.create_index("clientId")
        await database.db.messages.create_index("senderId")
        await database.db.messages.create_index("receiverId")
        await database.db.messages.create_index("sentAt")
        
        # Invoices collection indexes
        await database.db.invoices.create_index("clientId")
        await database.db.invoices.create_index("invoiceNumber", unique=True)
        await database.db.invoices.create_index("status")
        await database.db.invoices.create_index("dueDate")
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")

# Generic database operations
class BaseRepository:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
    
    @property
    def collection(self):
        return database.db[self.collection_name]
    
    async def create(self, data: dict) -> dict:
        """Create a new document"""
        try:
            result = await self.collection.insert_one(data)
            created_doc = await self.collection.find_one({"_id": result.inserted_id})
            if created_doc:
                created_doc["id"] = str(created_doc["_id"])
                del created_doc["_id"]
            return created_doc
        except DuplicateKeyError:
            raise ValueError("Document with this identifier already exists")
    
    async def find_by_id(self, doc_id: str) -> Optional[dict]:
        """Find document by ID"""
        doc = await self.collection.find_one({"id": doc_id})
        if doc:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            if "_id" in doc:
                del doc["_id"]
        return doc
    
    async def find_many(self, filter_dict: dict = {}, limit: int = 100, skip: int = 0) -> List[dict]:
        """Find multiple documents"""
        cursor = self.collection.find(filter_dict).skip(skip).limit(limit)
        docs = []
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            if "_id" in doc:
                del doc["_id"]
            docs.append(doc)
        return docs
    
    async def update_by_id(self, doc_id: str, update_data: dict) -> Optional[dict]:
        """Update document by ID"""
        update_data["updatedAt"] = update_data.get("updatedAt")
        result = await self.collection.update_one(
            {"id": doc_id}, 
            {"$set": update_data}
        )
        if result.modified_count:
            return await self.find_by_id(doc_id)
        return None
    
    async def delete_by_id(self, doc_id: str) -> bool:
        """Delete document by ID"""
        result = await self.collection.delete_one({"id": doc_id})
        return result.deleted_count > 0
    
    async def count(self, filter_dict: dict = {}) -> int:
        """Count documents"""
        return await self.collection.count_documents(filter_dict)