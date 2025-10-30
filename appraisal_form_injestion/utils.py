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
    is_chief_organizer = bool(is_chief_organizer)
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

def calculate_api_score_for_item12_1(data: List[Dict]):
    """
    Calculates the API score for item 12.1 based on class engagement.

    Args:
        data (List[Dict]): List of classes with their scheduled and engaged hours.
                           Each dict should have "course_code", "course_title", 
                           "contact_hr_per_week", "total_hour_scheduled", "total_hour_engaged".

    Returns:
        Tuple[float, Dict]: Total API score (max 30), and breakdown per course.
    """
    total_scheduled = 0
    total_engaged = 0

    for item in data:
        scheduled = item.get("total_hour_scheduled", 0) or 0
        engaged = item.get("total_hour_engaged", 0) or 0
        total_scheduled += scheduled
        total_engaged += engaged
    
    percent = (total_engaged / total_scheduled * 100) if total_scheduled > 0 else 0

    if percent >= 95:
        score_25 = 25
    elif percent >= 80:
        # linearly interpolate between 15 and 25
        score_25 = 15 + (percent - 80) * (10 / 15)
    else:
        score_25 = 0

    # Score of 5 if engaged hours > scheduled hours (in excess of norms/schedule)
    score_5 = 5 if total_engaged > total_scheduled else 0

    total_api_score = min(score_25 + score_5, 30)

    return total_api_score

def calculate_api_score_for_item13(data: List[Dict], section: str) -> int:
    """
    Calculate API score for item 13 based on section logic and data.

    Args:
        data (list of dict): List of activity dicts, each containing necessary fields per section.
        section (str): One of "A", "B", "C", "D", "E".

    Returns:
        int: Total API score as per section rules.
    """
    total_score = 0

    if section == "A":
        # Each dict should have: {"played_lead_role": bool}
        for item in data:
            if item.get("played_lead_role"):
                score = 10
            else:
                score = 5
            total_score += score
        total_score = min(total_score, 20)

    elif section == "B":
        # Each dict should have: {"role": "Incharge/Chairman"/"Member"}
        for item in data:
            role = str(item.get("role", "")).lower()
            if role in "incharge/chairman":
                score = 5
            elif role == "member":
                score = 3
            else:
                score = 0
            total_score += score
        total_score = min(total_score, 20)

    elif section == "C":
        # Each dict: {"position_type": "Director/Dean/HOD/Time Table Incharge/..." or "Member/Individual Responsibility/Other"}
        for item in data:
            pos = str(item.get("position_type", "")).lower()
            # Positions eligible for 10 pts
            lead_positions = [
                "director", "dean", "hod", "time table incharge", "incharge training & placement",
                "chairman of institution level committee", "other similar level position"
            ]
            if any(lp in pos for lp in lead_positions):
                score = 10
            elif pos in ["member","individual responsibility"]:
                score = 5
            else:
                score = 0
            total_score += score
        total_score = min(total_score, 20)

    elif section == "D":
        # Each dict: {"nature": "outside"/"within"}
        for item in data:
            typ = str(item.get("nature", "")).lower()
            if typ == "outside":
                score = 10
            elif typ =="within":
                score = 5
            else:
                score = 0
            total_score += score
        total_score = min(total_score, 20)

    elif section == "E":
        for item in data:
            score = min(int(item.get("points",0)),3)
            total_score += score
        total_score = min(total_score, 10)

    else:
        raise ValueError(f"Unknown section: {section}")

    return total_score

def calculate_api_score_for_item14(publication: Dict):
    """
    Calculate API score distribution for Item 14 (Publication) per joint authorship rules.
    Args:
        publication: dict with keys like
            - pub_type (str): 'IJ','NJ','OJ','IC','NC','LC','PN','OA'
            - isbn_issn (str): ISBN/ISSN/Other
            - indexed (bool): Is Indexed Journal (optional, default False)
            - impact_factor (int): Impact factor value (optional)
            - user_author_type (str): "First/Principal Author"/"Corresponding Author/Supervisor/Mentor"/"Other"
            - other_authors (list of dict): List of author dicts, each containing "name", "author_type"
    Returns:
        float: API score for the user author or API distribution dict if multiple authors.
    """

    if publication.get("isbn_issn"):
        isbn_issn = publication.get("isbn_issn", "")

    pub_type = str(publication.get("pub_type", "")).upper()
    base_score = 0

    if pub_type == "IJ":
        base_score = 15
    elif pub_type == "NJ":
        base_score = 10
    elif pub_type == "OJ":
        if isbn_issn in ["ISBN", "ISSN"]:
            base_score = 7
        else:
            base_score = 3
    elif pub_type == "IC":
        base_score = 10
    elif pub_type == "NC":
        base_score = 8
    elif pub_type == "LC":
        base_score = 6
    elif pub_type == "PN":
        base_score = 4
    elif pub_type == "OA":
        base_score = 2
    else:
        base_score = 0

    # Augmentation: Indexed Journal
    indexed = bool(publication.get("indexed", False))
    if indexed:
        base_score += 5

    # Augmentation: based on Impact Factor
    impact_factor = int(publication.get("impact_factor", 0))
    try:
        impact_factor = int(impact_factor) if impact_factor else 0
    except Exception:
        impact_factor = 0
    if impact_factor > 0:
        if impact_factor > 5:
            base_score += 25
        elif impact_factor > 2:
            base_score += 15
        elif impact_factor >= 1:
            base_score += 10

    # Joint Publication - point distribution logic
    if publication.get("other_authors",[]):
        user_author_type = str(publication.get("user_author_type", "")).lower()

        all_authors_type = [user_author_type]

        other_authors = publication.get("other_authors", []) or []
        for a in other_authors:
            all_authors_type.append(str(a.get("author_type", "")).lower())

        # Map author type with lowercase for matching
        def _author_category(typ):
            # 60% category
            if typ in [
                "first/principal author",
                "corresponding author/supervisor/mentor"
            ]:
                return "lead"
            else:
                return "other"

        # Identify 60% (lead) and 40% (others) category
        lead_authors = []
        other_authors_list = []
        for auth in all_authors_type:
            if _author_category(auth) == "lead":
                lead_authors.append(auth)
            else:
                other_authors_list.append(auth)

        n_lead = len(lead_authors)
        n_other = len(other_authors_list)
        n_total = n_lead + n_other

        lead_share = 0.6
        other_share = 0.4

        # Calculate share points for each
        lead_point = (base_score * lead_share / n_lead)
        other_point = (base_score * other_share / n_other)

        if lead_point < other_point:
            score = base_score/n_total
        else:
            if _author_category(user_author_type) == "lead":
                score = lead_point
            else:
                score = other_point

        return score

def calculate_api_score_for_item15(publication: Dict):
    """
    Calculate API score for Item 15 (Book/Chapter Publication) according to new rules.

    Item 15 Rules:
    - Published by International Publisher after Peer Review: 50 per book
    - Published by National Publisher with ISBN/ISSN: 25 per book
    - Published by Local Publisher with ISBN/ISSN: 15 per book
    - Chapter in any of the above: 20% of category per chapter
    - Joint authorship:
        - Two Authors: 60% to First/Principal Author, 40% to the other
        - More than Two Authors: 40% to First/Principal Author, remaining 60% shared equally by others

    Args:
        publication: dict with keys:
            - publisher_type (str): 'IP', 'NP', 'LP'
            - is_chapter (bool): If True, treat as chapter
            - number_of_chapters (int): Number of chapters in the book
            - user_author_type (str): "First/Principal Author", "Other"
            - other_authors (list of dict): List of authors with "name", "author_type"
    Returns:
        float: API score assigned to the user for this book/chapter
    """

    publisher_type = publication.get("publisher_type", "")
    is_chapter = bool(publication.get("is_chapter", False))
    number_of_chapters = publication.get("number_of_chapters", 0)

    # BASE SCORE DETERMINATION
    if publisher_type == "IP":
        base_score = 50
    elif publisher_type == "NP":
        base_score = 25
    elif publisher_type == "LP":
        base_score = 15
    else:
        base_score = 0

    if is_chapter:
        base_score = number_of_chapters * (0.2*base_score)  # 20% for a chapter

    # Author determination
    user_author_type = str(publication.get("user_author_type", "")).lower()
    other_authors = publication.get("other_authors", []) or []
    n_authors_total = 1 + len(other_authors)

    if n_authors_total == 1:
        # Only one author, user gets all the score
        return base_score

    # Find which author is "first/principal author"
    lead = 0
    other = 0
    for auth in publication.get("other_authors", []):
        if str(auth.get("author_type", "")).lower() == "first/principal author":
            lead += 1
        else:
            other += 1

    if user_author_type == "first/principal author":
        if n_authors_total == 2:
            return (base_score*0.6)
        else:
            return (base_score*0.4)/(lead+1)
    else:
        if n_authors_total == 2:
            return (base_score*0.4)
        else:
            return (base_score*0.6)/(other+1)

def calculate_api_score_for_item16(project: Dict):
    """
    Calculate API score for Item 16 - Sponsored and Consultancy Research Projects.

    Args:
        project (Dict): Dictionary with keys:
            - "is_hss": bool
            - "grant_amount": float (Lakhs, ex: 4.5 for 4.5 lakhs)
            - "is_consultancy": bool
            - user_author_type (str): "Chief/Co Investigator", "Other"
            - other_authors (list of dict): List of authors with "name", "author_type"

    Returns:
        float: API score assigned to the user for this project
    """

    is_hss_mgmt = bool(project.get("is_hss", False))
    grant_amount = float(project.get("amount_sanctioned", 0))
    is_consultancy = bool(project.get("is_consultancy", False))
    user_author_type = str(project.get("user_author_type", "")).lower()
    other_authors = project.get("other_authors", []) or []

    # Determine API point base as per grant ranges and HSS/Management status
    if is_hss_mgmt:
        # Amounts in lakhs
        if grant_amount >= 3:
            api_points = 20
        elif 1 <= grant_amount < 3:
            api_points = 15
        elif 0.25 <= grant_amount < 1:
            api_points = 10
        else:
            api_points = 0
    else:
        if grant_amount >= 10:
            api_points = 20
        elif 4 <= grant_amount < 10:
            api_points = 15
        elif 0.5 <= grant_amount < 4:
            api_points = 10
        else:
            api_points = 0

    # Halve points for consultancy projects
    if is_consultancy:
        api_points *= 0.5

    n_authors_total = 1 + len(other_authors)

    if n_authors_total == 1:
        # Only one author, user gets all the score
        return api_points

    # Find which author is "first/principal author"
    lead = 0
    other = 0
    for auth in other_authors:
        if str(auth.get("author_type", "")).lower() == "chief/co investigator":
            lead += 1
        else:
            other += 1

    if user_author_type == "first/principal author":
        if n_authors_total == 2:
            return (api_points*0.6)
        else:
            return (api_points*0.4)/(lead+1)
    else:
        if n_authors_total == 2:
            return (api_points*0.4)
        else:
            return (api_points*0.6)/(other+1)

def calculate_api_score_for_item17(project: Dict):
    """
    Calculate API score for Item 17 - Guided Research Degrees.

    Args:
        project (Dict): Dictionary with keys:
            - "degree": "Ph.D."|"M.Tech."|"M.Phil."|"D.D."|"M.S.",
            - "status": "awarded"|"thesis submitted"|"ongoing",
            - "months_ongoing": int, (for 'ongoing' only, optional)
            - "user_author_type": str, chief supervisor/ other
            - "other_authors": list of dicts, each with "name", "author_type"

    Returns:
        float: API score assigned to the user for this project
    """

    degree = str(project.get("degree", "")).lower()
    status = str(project.get("status", "")).lower()
    months_ongoing = int(project.get("months_ongoing", 0))
    user_author_type = str(project.get("user_author_type", "")).lower()
    other_authors = project.get("other_authors", []) or []

    # Determine API point base as per degree and status
    if degree == "phd":
        # Amounts in lakhs
        if status == "awarded":
            api_points = 10
        elif status == "thesis submitted":
            api_points = 7
        elif status == "ongoing" and months_ongoing > 6:
            api_points = 3
    else:
        api_points = 5

    n_authors_total = 1 + len(other_authors)

    if n_authors_total == 1:
        # Only one author, user gets all the score
        return api_points

    # Find which author is "chief supervisor"
    lead = 0
    other = 0
    for auth in other_authors:
        if str(auth.get("author_type", "")).lower() == "chief supervisor":
            lead += 1
        else:
            other += 1

    if user_author_type == "chief supervisor":
        if n_authors_total == 2:
            return (api_points*0.6)
        else:
            return (api_points*0.4)/(lead+1)
    else:
        if n_authors_total == 2:
            return (api_points*0.4)
        else:
            return (api_points*0.6)/(other+1)
