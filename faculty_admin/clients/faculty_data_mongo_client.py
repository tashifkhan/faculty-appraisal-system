import logging
from typing import List,Dict
from common.clients.abstract_mongo_client import AbstractMongoDBClient
from django.conf import settings

logger = logging.getLogger(__name__)

class FacultyDataMongoClient(AbstractMongoDBClient):
    def __init__(self):
        super().__init__(settings.APPRAISAL_SYSTEM_MONGO_DB_NAME)

    def get_all_faculty_data(self):
        try:
            projection = {'_id':0, 'updated_at':0, 'created_at':0}
            result = self.find_all(settings.FACULTY_DATA_COLLECTION_NAME, projection)
            return result
        except Exception as e:
            logger.error(f"Error getting faculty data collection: {e}")
            raise e

    def get_faculty_data_by_user_id(self, user_id:str):
        try:
            projection = {'_id':0, 'updated_at':0, 'created_at':0}
            result = self.find_one(settings.FACULTY_DATA_COLLECTION_NAME, {"user_id": user_id}, projection)
            return result
        except Exception as e:
            logger.error(f"Error getting faculty data by user id: {e}")
            raise e

    def insert_faculty_data(self, data:Dict):
        try:
            self.insert_one(settings.FACULTY_DATA_COLLECTION_NAME, data)
            logger.info(f"Faculty data inserted successfully")
        except Exception as e:
            logger.error(f"Error inserting faculty data: {e}")
            raise e
