from django.shortcuts import render
import logging
from typing import List, Dict
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from appraisal_form_injestion.services.data_injestion_service import DataInjestionService
from appraisal_form_injestion.clients.data_injestion_mongo_client import DataInjestionMongoClient
from django.conf import settings
import json
import urllib.parse
logger = logging.getLogger(__name__)

class GetItemBySection(APIView):
    """
    API Endpoint to get data by section
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionMongoClient()

    def get(self, request, *args, **kwargs):
        try:
            user_id = request.GET.get("user_id")
            section = request.GET.get("section")
            if not user_id or not section:
                return Response({"message": "User ID and section are required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.get_data_injestion_collection_by_user_id_and_section(user_id, section)
            return Response({"message": "Data fetched successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting data by section: {e}")
            return Response({"message": "Error getting data by section"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class InjestItem1to10(APIView):
    """
    API Endpoint to injest data for item 1 to 10
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            self.data_injestion_service.injest_data_item1_to_10(user_id, data)
            return Response({"message": "Data injested successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 1 to 10: {e}")
            return Response({"message": "Error injesting data for item 1 to 10"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InjestItem11(APIView):
    """
    API Endpoint to injest data for item 11
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.injest_data_item11(user_id, data)
            return Response({"message": "Data injested successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 11: {e}")
            return Response({"message": "Error injesting data for item 11"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InjestItem12_1(APIView):
    """
    API Endpoint to injest data for item 12.1
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            semester = data.get("semester")
            if not semester:
                return Response({"message": "Semester is required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.injest_data_item12_1(user_id, data, semester)
            return Response({"message": "Data injested successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 12.1: {e}")
            return Response({"message": "Error injesting data for item 12.1"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InjestItem12_3_to_12_4(APIView):
    """
    API Endpoint to injest data for item 12.3 to 12.4
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.injest_data_item12_3_to_12_4(user_id, data)
            return Response({"message": "Data injested successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 12.3 to 12.4: {e}")
            return Response({"message": "Error injesting data for item 12.3 to 12.4"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InjestItem13(APIView):
    """
    API Endpoint to injest data for item 13
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.injest_data_item13(user_id, data)
            return Response({"message": "Data injested successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 13: {e}")
            return Response({"message": "Error injesting data for item 13"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InjestItem14(APIView):
    """
    API Endpoint to injest data for item 14
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.injest_data_item14(user_id, data)
            return Response({"message": "Data injested successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 14: {e}")
            return Response({"message": "Error injesting data for item 14"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InjestItem15(APIView):
    """
    API Endpoint to injest data for item 15
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.injest_data_item15(user_id, data)
            return Response({"message": "Data injested successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 15: {e}")
            return Response({"message": "Error injesting data for item 15"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InjestItem16(APIView):
    """
    API Endpoint to injest data for item 16
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.injest_data_item16(user_id, data)
            return Response({"message": "Data injested successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 16: {e}")
            return Response({"message": "Error injesting data for item 16"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InjestItem17(APIView):
    """
    API Endpoint to injest data for item 17
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.injest_data_item17(user_id, data)
            return Response({"message": "Data injested successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 17: {e}")
            return Response({"message": "Error injesting data for item 17"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InjestItem18(APIView):
    """
    API Endpoint to injest data for item 18
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.injest_data_item18(user_id, data)
            return Response({"message": "Data injested successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 18: {e}")
            return Response({"message": "Error injesting data for item 18"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InjestItem19(APIView):
    """
    API Endpoint to injest data for item 19
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data_injestion_service = DataInjestionService()

    def post(self, request):
        try:
            data = request.body
            if not data:
                return Response({"message": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)

            data = json.loads(data)

            user_id = data.get("user_id")
            if not user_id:
                return Response({"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            result = self.data_injestion_service.injest_data_item19(user_id, data)
            return Response({"message": "Data injested successfully","result": result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error injesting data for item 19: {e}")
            return Response({"message": "Error injesting data for item 19"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
