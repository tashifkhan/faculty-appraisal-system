import logging
from typing import List,Dict
from datetime import datetime
from appraisal_form_injestion.clients.data_injestion_mongo_client import DataInjestionMongoClient
from appraisal_form_injestion.utils import calculate_api_score_for_item11

logger = logging.getLogger(__name__)

class DataInjestionService:
    def __init__(self):
        self.data_injestion_mongo_client = DataInjestionMongoClient()

    def injest_data_item1_to_10(self, user_id:str, data:Dict):
        try:
            data = {"1-10": data}
            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, data)
        except Exception as e:
            logger.error(f"Error injesting data 1 to 10: {e}")
            raise e

    def injest_data_item11(self, user_id: str, data: List[Dict]):
        try:
            total_score = 0
            seminar_attended_count = 0
            api_score_list = []

            for item in data:
                api_points,seminar_attended = calculate_api_score_for_item11(item["status"], item["type"], item["is_chief_organizer"], item["start_date"], item["end_date"])
                item["api_score"] = api_points
                api_score_list.append(api_points)
                if seminar_attended:
                    seminar_attended_count += 1
                else:
                    total_score += api_points

            seminar_points = min(seminar_attended_count * 2, 5)
            total_score += seminar_points

            result_data = {"11":{
                "data": data,
                "score": total_score,
                "api_score_list": api_score_list
            }}

            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, result_data)
        except Exception as e:
            logger.error(f"Error injesting data 11: {e}")
            raise e

