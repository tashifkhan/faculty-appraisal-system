import logging
from typing import List,Dict
from datetime import datetime
from appraisal_form_injestion.clients.data_injestion_mongo_client import DataInjestionMongoClient
from appraisal_form_injestion.utils import (calculate_api_score_for_item11, calculate_api_score_for_item12_1, calculate_api_score_for_item13, 
calculate_api_score_for_item14, calculate_api_score_for_item15, calculate_api_score_for_item16, calculate_api_score_for_item17)

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
            return {"score": total_score,"api_score_list": api_score_list}
        except Exception as e:
            logger.error(f"Error injesting data 11: {e}")
            raise e

    def injest_data_item12_1(self, user_id:str, data:List[Dict], semester:str):
        try:
            score = calculate_api_score_for_item12_1(data)
            key = f"12.1_{semester}"
            result_data = {key:{
                "data": data,
                "score": score
            }}

            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, result_data)
            return {"score": score}
        except Exception as e:
            logger.error(f"Error injesting data 12.1: {e}")
            raise e

    def injest_data_item12_3_to_12_4(self, user_id:str, data:Dict):
        try:
            score = 0
            if data["12.3"].get("number_of_projects_guided","") and data["12.4"].get("number_of_students_guided",""):
                score = 10

            for item in data["12.4"]:
                score += 10

            result_data = {
                "12.3-12.4":{
                    "data": data,
                    "score": min(score,30)
                }
            }
            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, result_data)
            return {"score": min(score,30)}
        except Exception as e:
            logger.error(f"Error injesting data 12.3: {e}")
            raise e

    def injest_data_item13(self, user_id:str, data:Dict):
        try:
            total_score = 0
            api_score_dict = {}
            for section in data:
                score = calculate_api_score_for_item13(data[section], section)
                api_score_dict[section] = score
                total_score += score
            result_data = {
                "13":{
                    "data": data,
                    "score": min(total_score,60),
                    "api_score_dict": api_score_dict
                }
            }
            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, result_data)
            return {"score": min(total_score,60),"api_score_dict": api_score_dict}
        except Exception as e:
            logger.error(f"Error injesting data 13: {e}")
            raise e

    def injest_data_item14(self, user_id:str, data:List[Dict]):
        try:
            total_score = 0
            api_score_list = []
            for item in data:
                score = calculate_api_score_for_item14(item)
                total_score += score
                api_score_list.append(score)

            result_data = {
                "14":{
                    "data": data,
                    "score": total_score,
                    "api_score_list": api_score_list
                }
            }
            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, result_data)
            return {"score": total_score,"api_score_list": api_score_list}
        except Exception as e:
            logger.error(f"Error injesting data 14: {e}")
            raise e
    
    def injest_data_item15(self, user_id:str, data:List[Dict]):
        try:
            total_score = 0
            api_score_list = []
            for item in data:
                score = calculate_api_score_for_item15(item)
                total_score += score
                api_score_list.append(score)

            result_data = {
                "15":{
                    "data": data,
                    "score": total_score,
                    "api_score_list": api_score_list
                }
            }
            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, result_data)
            return {"score": total_score,"api_score_list": api_score_list}
        except Exception as e:
            logger.error(f"Error injesting data 15: {e}")
            raise e

    def injest_data_item16(self, user_id:str, data:List[Dict]):
        try:
            total_score = 0
            api_score_list = []
            for item in data:
                score = calculate_api_score_for_item16(item)
                total_score += score
                api_score_list.append(score)

            result_data = {
                "16":{
                    "data": data,
                    "score": total_score,
                    "api_score_list": api_score_list
                }
            }
            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, result_data)
            return {"score": total_score,"api_score_list": api_score_list}
        except Exception as e:
            logger.error(f"Error injesting data 16: {e}")
            raise e

    def injest_data_item17(self, user_id:str, data:List[Dict]):
        try:
            total_score = 0
            api_score_list = []
            for item in data:
                score = calculate_api_score_for_item17(item)
                total_score += score
                api_score_list.append(score)
            result_data = {
                "17":{
                    "data": data,
                    "total_score": total_score,
                    "api_score_list": api_score_list
                }
            }
            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, result_data)
            return {"score": total_score,"api_score_list": api_score_list}
        except Exception as e:
            logger.error(f"Error injesting data 17: {e}")
            raise e

    def injest_data_item18(self, user_id:str, data:List[Dict]):
        try:
            total_score = 0
            api_score_list = []
            for item in data:
                type = str(item.get("position_type","")).lower()
                score = 5
                if type == "chairmanship":
                    score = 10
                total_score += score
                api_score_list.append(score)
            result_data = {
                "18":{
                    "data": data,
                    "total_score": total_score,
                    "api_score_list": api_score_list
                }
            }
            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, result_data)
            return {"score": total_score,"api_score_list": api_score_list}
        except Exception as e:
            logger.error(f"Error injesting data 18: {e}")
            raise e

    def injest_data_item19(self, user_id:str, data:Dict):
        try:
            total_score = 0
            api_score_dict = {}
            for type in data:
                score = 0
                if type == "self":
                    for item in data[type]:
                        score += int(item.get("points",0))
                        score = min(score,30)
                elif type == "national":
                    score = len(data[type]) * 30
                elif type == "international":
                    score = len(data[type]) * 50

                total_score += score
                api_score_dict[type] = score

            result_data = {
                "19":{
                    "data": data,
                    "total_score": total_score,
                    "api_score_dict": api_score_dict
                }
            }
            self.data_injestion_mongo_client.update_data_injestion_collection(user_id, result_data)
            return {"score": total_score,"api_score_dict": api_score_dict}
        except Exception as e:
            logger.error(f"Error injesting data 19: {e}")
            raise e
