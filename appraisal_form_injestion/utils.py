import logging
from datetime import datetime
from typing import List,Tuple,Dict

logger = logging.getLogger(__name__)

def calculate_api_score_for_item11(status:str, program_type:str, is_chief_organizer:bool, start_date:str, end_date:str):
    """
    Calculate the total API score for a list of events based on:
    - "attended"/"organized" (status), 
    - is_chief_organizer, 
    - program type (course/program vs seminar/conference/workshop), 
    - duration (in days or weeks), 
    and assigns API points as per the specification.
    """

    seminar_attended = False

    status = status.lower()  # "attended" or "organized"
    program_type = program_type.lower()  # "course", "program", "seminar", etc.
    is_chief_organizer = is_chief_organizer
    duration_days = None

    # Date parsing
    if start_date and end_date:
        try:
            start_date = datetime.strptime(start_date, "%d-%m-%Y")
            end_date = datetime.strptime(end_date, "%d-%m-%Y")
            duration_days = (end_date - start_date).days + 1 # Inclusive
        except Exception as e:
            logger.error(f"Error parsing dates: {e}")
            duration_days = None

    # --- Course/Program logic ---
    if program_type in ["course", "program"]:
        if status == "attended":
            # less than one week: 1, one week: 3, two or more weeks: 5
            if duration_days is not None:
                if duration_days < 7:
                    api_points = 1
                elif 7 <= duration_days < 14:
                    api_points = 3
                else:
                    api_points = 5
        elif status == "organized":
            # less than 1 week: 5, 1 week:10, >=2 wks:20, +5 if chief/principal
            if duration_days is not None:
                if duration_days < 7:
                    api_points = 5
                elif 7 <= duration_days < 14:
                    api_points = 10
                else:
                    api_points = 20
                if is_chief_organizer:
                    api_points += 5

    # --- Seminar/Conference/Workshop logic ---
    elif program_type in ["seminar", "conference", "workshop"]:
        if status == "attended":
            # Not presenting ("without presentation" default)
            api_points = 2
            seminar_attended = True
        elif status == "organized":
            # 1 day:5, 2-3 days:10, >3 days:20 +5 if chief/principal
            if duration_days is not None:
                if duration_days == 1:
                    api_points = 5
                elif 2 <= duration_days <= 3:
                    api_points = 10
                elif duration_days > 3:
                    api_points = 20
                if is_chief_organizer:
                    api_points += 5

    return api_points,seminar_attended
