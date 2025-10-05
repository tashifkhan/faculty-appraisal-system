from abc import ABC
from datetime import datetime, timezone
from django.conf import settings
from pymongo import MongoClient, errors

# Module-level variable to store the MongoClient instance
_mongo_client = None

class AbstractMongoDBClient(ABC):
    def __init__(self, db):
        global _mongo_client
        if _mongo_client is None:
            try:
                # Initialize the MongoDB client with connection pooling
                _mongo_client = MongoClient(
                    settings.MONGO_URI,
                    maxPoolSize=100,  # Maximum number of connections in the pool
                    minPoolSize=10    # Minimum number of connections in the pool
                )
            except errors.ConnectionFailure as e:
                raise Exception(f"Failed to connect to MongoDB: {str(e)}")
        
        self.client = _mongo_client
        self.db = self.client[db]

    def find_one(self, collection, filter, projection=None):
        try:
            # Find a single document in the specified collection
            return self.db[collection].find_one(filter, projection)
        except errors.PyMongoError as e:
            raise Exception(f"Error finding document: {str(e)}")
    
    def count(self, collection):
        try:
            # Count the number of documents in the specified collection
            return self.db[collection].count_documents({})
        except errors.PyMongoError as e:
            raise Exception(f"Error counting documents: {str(e)}")
    
    def count_documents(self, collection, filter=None):
        """
        Count the number of documents in the specified collection that match the filter.
        
        Args:
            collection: Name of the collection
            filter: Query filter (dict). If None, counts all documents.
            
        Returns:
            int: Number of documents matching the filter
        """
        if filter is None:
            filter = {}
        
        try:
            return self.db[collection].count_documents(filter)
        except errors.PyMongoError as e:
            raise Exception(f"Error counting documents: {str(e)}")

    def find_all(self, collection, query=None, skip=0, limit=0, projection=None, sort=None):
        if query is None:
            query = {}

        if projection is None:
            projection = {}

        try:
            # Fetch the documents with optional query, projection, skip, limit, and sort
            query_result = self.db[collection].find(query, projection).skip(skip).limit(limit)

            if sort:
                query_result = query_result.sort(sort)

            return query_result
        except errors.PyMongoError as e:
            raise Exception(f"Error finding documents: {str(e)}")

    def insert_one(self, collection, document):
        # Add timestamps
        document['created_at'] = datetime.now(timezone.utc)
        document['updated_at'] = datetime.now(timezone.utc)

        try:
            # Insert the document into the collection
            return self.db[collection].insert_one(document)
        except errors.PyMongoError as e:
            raise Exception(f"Error inserting document: {str(e)}")
    
    def insert_many(self, collection, documents):
        """Insert multiple documents into the collection"""
        # Add timestamps to each document
        for doc in documents:
            doc['created_at'] = datetime.now(timezone.utc)
            doc['updated_at'] = datetime.now(timezone.utc)

        try:
            # Insert the documents into the collection
            return self.db[collection].insert_many(documents)
        except errors.PyMongoError as e:
            raise Exception(f"Error inserting multiple documents: {str(e)}")
    
    def delete_many(self, collection, filter):
        try:
            # Delete multiple documents that match the filter
            return self.db[collection].delete_many(filter)
        except errors.PyMongoError as e:
            raise Exception(f"Error deleting documents: {str(e)}")
    
    def replace_one(self, collection, filter, replacement, upsert=False):
        try:
            # Check if document exists
            existing_doc = self.find_one(collection, filter)
            
            if existing_doc:
                # If document exists, only update updated_at
                replacement['updated_at'] = datetime.now(timezone.utc)
                # Preserve the original created_at
                replacement['created_at'] = existing_doc.get('created_at', datetime.now(timezone.utc))
            else:
                # If document doesn't exist, set both timestamps
                replacement['created_at'] = datetime.now(timezone.utc)
                replacement['updated_at'] = datetime.now(timezone.utc)
            
            # Replace the document
            return self.db[collection].replace_one(filter, replacement, upsert=upsert)
        except errors.PyMongoError as e:
            raise Exception(f"Error replacing document: {str(e)}")
    
    def list_collections(self):
        try:
            # List all collection names in the database
            return self.db.list_collection_names()
        except errors.PyMongoError as e:
            raise Exception(f"Error listing collections: {str(e)}")

    def create_collection(self, collection):
        try:
            # Create a new collection in the database
            self.db.create_collection(collection)
        except errors.CollectionInvalid as e:
            raise Exception(f"Error creating collection: {str(e)}")
        except errors.PyMongoError as e:
            raise Exception(f"Error creating collection: {str(e)}")

    def update_one(self, collection, filter, update, upsert=False):
        try:
            # Ensure updated_at is always set to current UTC time
            now_utc = datetime.now(timezone.utc)
            if "$set" in update:
                update["$set"]["updated_at"] = now_utc
            else:
                update["$set"] = {"updated_at": now_utc}

            # Update a single document in the specified collection
            return self.db[collection].update_one(filter, update, upsert=upsert)
        except errors.PyMongoError as e:
            raise Exception(f"Error updating document: {str(e)}")

    def aggregate(self, collection, pipeline):
        """
        Execute an aggregation pipeline on the specified collection.
        
        Args:
            collection: Name of the collection
            pipeline: List of aggregation pipeline stages
            
        Returns:
            Cursor: Aggregation result cursor
        """
        try:
            return self.db[collection].aggregate(pipeline)
        except errors.PyMongoError as e:
            raise Exception(f"Error executing aggregation pipeline: {str(e)}")
