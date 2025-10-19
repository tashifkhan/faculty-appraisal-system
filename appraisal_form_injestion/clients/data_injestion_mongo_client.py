import logging
from typing import List,Dict
from common.clients.abstract_mongo_client import AbstractMongoDBClient
from django.conf import settings

logger = logging.getLogger(__name__)

class DataInjestionMongoClient(AbstractMongoDBClient):
    def __init__(self):
        super().__init__(settings.APPRAISAL_SYSTEM_MONGO_DB_NAME)

    def get_data_injestion_collection(self, user_id:str, projection:Dict = None):
        try:
            projection["_id"] = 0
            result = self.find_one(settings.DATA_INJECTION_COLLECTION_NAME, {"user_id": user_id}, projection)
            return result
        except Exception as e:
            logger.error(f"Error getting data injestion collection: {e}")
            raise e

    def update_data_injestion_collection(self, user_id:str, data):
        try:
            filter_dict = {"user_id": user_id}
            update = {"$set": data}
            self.update_one(settings.DATA_INJECTION_COLLECTION_NAME, filter_dict, update)
        except Exception as e:
            logger.error(f"Error updating data injestion collection: {e}")
            raise e
