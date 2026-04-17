"""
VIRA — Citizen Voice/Chat Interface Agent
==========================================
Agent #3 in the InfraLens ecosystem.

Purpose: Natural-language AI assistant on the Citizen App.
- Complaint intake via voice/text
- Status queries for existing complaints
- General InfraLens questions

Powered By: Grok by xAI (grok-3) + LangChain Prompt Templates
Portal: Citizen App

Phase 2: Connected to models.py + data_store.py with real types.
"""

import sys
import os
from datetime import datetime, timezone, timedelta

# Ensure backend root is on path for sibling imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import (
    Issue, Location, Reporter, AIClassification,
    AgentEvent, ChatMessage, VoiceMessage,
)
from data_store import data_store
from config import settings

# =============================================================================
# CONSTANTS
# =============================================================================

IST = timezone(timedelta(hours=5, minutes=30))

REPORT_KEYWORDS = [
    "pothole", "broken", "burst", "leak", "flooding", "overflow",
    "garbage", "waste", "debris", "fallen", "collapsed", "damaged",
    "malfunctioning", "not working", "out of order", "faulty",
    "crack", "cave-in", "sinkhole", "blocked", "clogged",
    "road", "pipe", "water", "sewer", "drain", "manhole",
    "street light", "signal", "transformer", "wire", "cable",
    "footpath", "pavement", "divider", "barrier", "bridge",
    "dangerous", "hazard", "urgent", "emergency", "risk",
    "report", "complain", "complaint", "issue", "problem",
    "there is", "there's", "i see", "i saw", "i noticed",
    "i found", "i want to report", "i'd like to report",
]

QUERY_KEYWORDS = [
    "status", "update", "what happened", "any update",
    "my complaint", "my report", "my issue",
    "track", "tracking", "where is", "progress",
    "when will", "how long", "is it fixed", "resolved",
    "assigned", "working on", "being fixed",
    "ISS-", "complaint number", "reference number", "ticket",
]

GENERAL_KEYWORDS = [
    "what is infralens", "what does infralens", "how does infralens",
    "who are you", "what can you do", "help me", "hello", "hi",
    "good morning", "good evening", "thank you", "thanks",
    "how to use", "features", "about",
]

CATEGORY_KEYWORDS = {
    "roads": {
        "keywords": ["pothole", "road", "highway", "street", "lane", "path",
                     "footpath", "pavement", "cave-in", "sinkhole", "crack",
                     "asphalt", "tar", "surface", "bumpy", "rough road"],
        "subcategories": {
            "pothole": ["pothole", "pot hole", "hole in road", "crater"],
            "cave_in": ["cave-in", "cave in", "sinkhole", "collapse", "subsidence"],
            "manhole": ["manhole", "man hole", "manhole cover", "missing cover"],
            "footpath_damage": ["footpath", "pavement", "sidewalk", "walkway"],
            "faded_markings": ["marking", "lane marking", "road marking", "faded"],
        }
    },
    "water_pipeline": {
        "keywords": ["water", "pipe", "pipeline", "burst", "leak", "flooding",
                     "water supply", "tap", "water pressure", "contaminated",
                     "dirty water", "no water", "water cut"],
        "subcategories": {
            "burst_pipe": ["burst", "broken pipe", "pipe burst", "gushing"],
            "contamination": ["contaminated", "dirty water", "brown water", "smell"],
            "low_pressure": ["low pressure", "no pressure", "weak flow", "no water"],
        }
    },
    "electrical": {
        "keywords": ["electric", "electrical", "light", "street light", "lamp",
                     "transformer", "power", "wire", "wiring", "signal",
                     "traffic light", "traffic signal", "dark", "no light"],
        "subcategories": {
            "street_light": ["street light", "lamp", "light post", "dark street", "no light"],
            "exposed_wiring": ["wire", "wiring", "exposed", "hanging wire", "cable", "shock"],
            "traffic_signal": ["traffic signal", "traffic light", "signal not working"],
            "transformer": ["transformer", "power cut", "electricity", "substation"],
        }
    },
    "sanitation": {
        "keywords": ["garbage", "waste", "trash", "rubbish", "litter",
                     "drain", "drainage", "sewer", "sewage", "gutter",
                     "overflow", "clog", "blocked drain", "stink", "smell",
                     "dirty", "filthy", "unhygienic"],
        "subcategories": {
            "garbage": ["garbage", "waste", "trash", "rubbish", "litter", "dump", "bin"],
            "drain_blockage": ["drain", "drainage", "blocked", "clogged", "gutter"],
            "sewage_overflow": ["sewage", "sewer", "overflow", "sewage water"],
        }
    },
    "structural": {
        "keywords": ["building", "wall", "crack", "structural", "bridge",
                     "flyover", "retaining wall", "pillar", "beam"],
        "subcategories": {
            "building_crack": ["building crack", "wall crack", "structural crack"],
            "bridge_damage": ["bridge", "flyover", "overpass"],
            "retaining_wall": ["retaining wall", "compound wall"],
        }
    },
    "traffic": {
        "keywords": ["traffic", "divider", "barrier", "sign", "signage", "road sign"],
        "subcategories": {
            "broken_divider": ["divider", "barrier", "median", "broken divider"],
            "missing_signage": ["sign", "signage", "road sign", "missing sign"],
        }
    },
    "environment": {
        "keywords": ["tree", "fallen tree", "branch", "green", "garden",
                     "park", "dumping", "illegal dumping", "pollution"],
        "subcategories": {
            "fallen_tree": ["fallen tree", "tree fell", "branch", "uprooted"],
            "illegal_dumping": ["dumping", "illegal dump", "waste dump"],
        }
    },
}

SEVERITY_KEYWORDS = {
    "CRITICAL": ["emergency", "life threatening", "death", "electrocution",
                 "flooding road", "complete blockage", "collapse", "cave-in",
                 "gas leak", "fire", "major burst", "open manhole", "live wire",
                 "danger", "accident", "injury"],
    "HIGH": ["burst pipe", "large pothole", "traffic signal failure",
             "road blocked", "heavy flooding", "major leak", "unsafe",
             "broken", "huge", "deep pothole", "severe"],
    "MEDIUM": ["street light out", "drain blocked", "garbage pile",
               "moderate", "pothole", "leak", "overflow", "damaged",
               "not working", "broken footpath"],
    "LOW": ["faded marking", "minor crack", "small", "cosmetic",
            "overflowing bin", "litter", "minor"],
}

LOCATION_PREPOSITIONS = [
    "near", "at", "on", "beside", "next to", "in front of",
    "behind", "opposite", "close to", "adjacent to", "around",
    "outside", "towards",
]

# =============================================================================
# PROMPT TEMPLATES
# =============================================================================

REPORT_EXTRACTION_PROMPT = """You are VIRA, an AI assistant for InfraLens — India's civic infrastructure intelligence platform.

A citizen has reported an infrastructure issue. Extract structured data from their message.

CATEGORIES: roads, water_pipeline, electrical, sanitation, structural, traffic, environment

SEVERITY RULES:
- CRITICAL: Immediate safety hazard (open manhole, live wire, gas leak, major collapse)
- HIGH: Significant public disruption (large pothole on highway, burst water main, traffic signal failure)
- MEDIUM: Notable inconvenience (street light out, blocked drain, moderate pothole)
- LOW: Minor issue (faded road marking, overflowing bin, minor crack)

Citizen message: {message}
Chat history: {history}

Respond ONLY in this exact JSON format:
{{"category": "<category>", "subcategory": "<specific_issue_type>", "severity": "<CRITICAL|HIGH|MEDIUM|LOW>", "location_text": "<any location mentioned, or 'Not specified'>", "description": "<structured 1-2 sentence summary>"}}
"""

STATUS_RESPONSE_PROMPT = """You are VIRA. The citizen is asking about their complaint.
Issue data: {issue_data}
Generate a friendly, conversational response in 2-3 sentences. Include current status, who it's assigned to, expected timeline. Be empathetic.
"""

GENERAL_RESPONSE_PROMPT = """You are VIRA, the AI assistant for InfraLens — India's AI-powered civic infrastructure platform.
InfraLens connects Citizens, Municipal Corporations, Field Workers, and State Governments through 11 autonomous AI agents.
Citizen message: {message}
Respond helpfully and conversationally in 2-3 sentences.
"""

# =============================================================================
# CORE FUNCTIONS
# =============================================================================

def detect_mode(message: str) -> str:
    """Classify message as report/query/general using weighted keyword matching."""
    message_lower = message.lower().strip()
    report_score = sum(1 for kw in REPORT_KEYWORDS if kw.lower() in message_lower)
    query_score = sum(1 for kw in QUERY_KEYWORDS if kw.lower() in message_lower)
    general_score = sum(1 for kw in GENERAL_KEYWORDS if kw.lower() in message_lower)

    if "ISS-" in message.upper():
        query_score += 5
    if "status" in message_lower or "my complaint" in message_lower:
        query_score += 3

    if report_score > query_score and report_score > general_score:
        return "report"
    elif query_score > report_score and query_score > general_score:
        return "query"
    elif general_score > 0:
        return "general"
    if len(message.split()) > 15:
        return "report"
    return "general"


def extract_complaint_data_rule_based(message: str) -> dict:
    """Rule-based extraction of complaint data from citizen message."""
    message_lower = message.lower()

    # Extract category
    detected_category = None
    detected_subcategory = None
    best_score = 0
    for category, config in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in config["keywords"] if kw in message_lower)
        if score > best_score:
            best_score = score
            detected_category = category
            best_sub = 0
            for sub_name, sub_kws in config["subcategories"].items():
                ss = sum(1 for kw in sub_kws if kw in message_lower)
                if ss > best_sub:
                    best_sub = ss
                    detected_subcategory = sub_name
    if not detected_category:
        detected_category = "roads"
        detected_subcategory = "pothole"
    if not detected_subcategory:
        subcats = list(CATEGORY_KEYWORDS.get(detected_category, {}).get("subcategories", {}).keys())
        detected_subcategory = subcats[0] if subcats else "general"

    # Extract severity
    detected_severity = "MEDIUM"
    best_sev = 0
    for severity, keywords in SEVERITY_KEYWORDS.items():
        s = sum(1 for kw in keywords if kw in message_lower)
        if s > best_sev:
            best_sev = s
            detected_severity = severity

    # Extract location
    location_text = "Not specified"
    for prep in LOCATION_PREPOSITIONS:
        idx = message_lower.find(prep + " ")
        if idx != -1:
            start = idx + len(prep) + 1
            remaining = message[start:]
            end = len(remaining)
            for marker in [",", ".", "!", "?", "\n"]:
                mi = remaining.find(marker)
                if mi != -1 and mi < end:
                    end = mi
            candidate = remaining[:end].strip()
            if len(candidate) > 3:
                location_text = candidate
                break

    description = message.strip()
    if len(description) > 200:
        description = description[:200] + "..."

    return {
        "category": detected_category,
        "subcategory": detected_subcategory,
        "severity": detected_severity,
        "location_text": location_text,
        "description": description,
    }


async def create_issue_from_chat(extracted_data: dict, user_id: str) -> dict:
    """Create an Issue in data_store from extracted complaint data."""
    now = datetime.now(IST)
    city = "Mumbai"  # Default; in production would geocode location_text
    issue_id = data_store.generate_issue_id(city)

    location = Location(
        lat=19.0760, lng=72.8777,  # Default Mumbai coords
        address=extracted_data.get("location_text", ""),
        city=city, ward=""
    )

    issue = Issue(
        issue_id=issue_id,
        source="manual_complaint",
        category=extracted_data["category"],
        subcategory=extracted_data["subcategory"],
        severity=extracted_data["severity"],
        confidence=0.75,
        status="reported",
        location=location,
        description=extracted_data["description"],
        reporter=Reporter(
            reporter_id=user_id,
            reporter_name=user_id,
        ),
        created_at=now.isoformat(),
        updated_at=now.isoformat(),
    )

    await data_store.create_issue(issue)

    # Log agent event
    await data_store.add_agent_event(AgentEvent(
        agent="VIRA",
        action="issue_created_from_chat",
        issue_id=issue_id,
        data={"user_id": user_id, "category": extracted_data["category"],
              "severity": extracted_data["severity"]},
        portal="citizen",
        timestamp=now.isoformat(),
    ))

    return {"issue_id": issue_id, "issue": issue}


async def handle_status_query(message: str, user_id: str) -> dict:
    """Fetch issue status from data_store and format response."""
    message_upper = message.upper()

    # Try to extract issue ID from message
    target_issue = None
    if "ISS-" in message_upper:
        for word in message.split():
            if word.upper().startswith("ISS-"):
                target_issue = await data_store.get_issue(word.upper().rstrip(".,!?"))
                break

    # If no ID found, search by user_id
    if not target_issue:
        all_issues = await data_store.list_issues()
        user_issues = [i for i in all_issues
                       if i.reporter and i.reporter.reporter_id == user_id]
        if user_issues:
            user_issues.sort(key=lambda x: x.created_at, reverse=True)
            target_issue = user_issues[0]

    if not target_issue:
        return {
            "agent": "VIRA",
            "response": "I couldn't find any complaints linked to your account. "
                        "Could you provide your complaint ID (e.g., ISS-MUM-2026-04-17-0001)?",
            "action_taken": "status_query_not_found",
        }

    return _format_status_response(target_issue)


def _format_status_response(issue: Issue) -> dict:
    """Format a status response for a real Issue model."""
    loc = issue.location.address if issue.location else "your area"
    cat = issue.category.replace("_", " ")

    status_msgs = {
        "reported": f"Your complaint about the {cat} issue near {loc} has been received and is being processed. Our AI system will assign a repair crew shortly.",
        "assigned": f"Great news! Your {cat} complaint near {loc} has been assigned to {issue.assigned_to.worker_name if issue.assigned_to else 'a crew'}. They should be heading to the site soon.",
        "in_progress": f"A repair crew is working on the {cat} issue near {loc}. You'll be notified when complete.",
        "resolved": f"Good news! 🎉 The {cat} issue near {loc} has been resolved! Proof photos are available in your complaint details.",
        "escalated": f"Your {cat} complaint near {loc} has been escalated to higher officials for urgent attention.",
        "pending_verification": f"The {cat} issue near {loc} has been repaired and is awaiting verification by the fleet leader.",
    }

    response = status_msgs.get(issue.status,
        f"Your {cat} complaint is currently being processed.")

    if issue.assigned_to and issue.status in ("assigned", "in_progress"):
        response += f"\n👷 Assigned to: {issue.assigned_to.worker_name}"
    if issue.deadline and issue.status in ("assigned", "in_progress"):
        response += f"\n⏰ Deadline: {issue.deadline}"

    return {
        "agent": "VIRA",
        "response": response,
        "action_taken": "status_query",
        "issue_id": issue.issue_id,
        "issue_status": issue.status,
    }


def format_general_response(message: str) -> dict:
    """Handle general/informational queries about InfraLens."""
    ml = message.lower().strip()
    if any(g in ml for g in ["hello", "hi", "hey", "good morning", "good evening"]):
        resp = "Hello! 👋 I'm VIRA, your InfraLens assistant. I can help you report infrastructure issues, check complaint status, or answer questions. How can I help?"
    elif "what is infralens" in ml or "about infralens" in ml:
        resp = "InfraLens is India's AI-powered civic infrastructure platform. 🏗️ It connects citizens, municipal corporations, field workers, and state governments through 11 AI agents for real-time issue detection, assignment, and resolution. Want to report an issue?"
    elif "what can you do" in ml or "features" in ml:
        resp = "I can help you:\n📝 Report issues (potholes, water leaks, garbage, etc.)\n🔍 Track complaint status\n🚗 Auto-detect potholes via car sensors\n📸 Capture road hazards\n🔔 Get resolution notifications\n\nJust tell me what you need!"
    elif "thank" in ml:
        resp = "You're welcome! 😊 Don't hesitate to report any issues you see."
    else:
        resp = "I'm VIRA, your InfraLens assistant. I can:\n• Report an infrastructure issue\n• Check complaint status\n• Answer questions about InfraLens\n\nWhat would you like to do?"
    return {"agent": "VIRA", "response": resp, "action_taken": "general_response"}


# =============================================================================
# CHAT SESSION MANAGEMENT
# =============================================================================

chat_sessions: dict[str, list] = {}
MAX_HISTORY_LENGTH = 20


def get_session_history(user_id: str) -> list:
    if user_id not in chat_sessions:
        chat_sessions[user_id] = []
    return chat_sessions[user_id]


def add_to_history(user_id: str, role: str, content: str) -> None:
    history = get_session_history(user_id)
    history.append({"role": role, "content": content})
    if len(history) > MAX_HISTORY_LENGTH:
        chat_sessions[user_id] = history[-MAX_HISTORY_LENGTH:]


def clear_session(user_id: str) -> None:
    chat_sessions.pop(user_id, None)


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

async def chat(user_id: str, message: str, session_history: list = None) -> dict:
    """Main entry point for VIRA citizen chat. Async, connected to data_store."""
    add_to_history(user_id, "user", message)
    mode = detect_mode(message)

    if mode == "report":
        extracted_data = extract_complaint_data_rule_based(message)
        create_result = await create_issue_from_chat(extracted_data, user_id)
        issue_id = create_result["issue_id"]

        sev_emoji = {"CRITICAL": "🚨", "HIGH": "⚠️", "MEDIUM": "📋", "LOW": "📝"}
        cat_emoji = {"roads": "🛣️", "water_pipeline": "🚰", "electrical": "⚡",
                     "sanitation": "🗑️", "structural": "🏗️", "traffic": "🚦", "environment": "🌳"}

        cat = extracted_data["category"]
        sev = extracted_data["severity"]
        loc = extracted_data["location_text"]

        response_text = (
            f"Got it! {sev_emoji.get(sev, '📋')} I've registered your complaint about "
            f"the {cat.replace('_', ' ')} issue {cat_emoji.get(cat, '📌')}.\n\n"
            f"📍 Location: {loc}\n🔴 Severity: {sev}\n🆔 Complaint ID: {issue_id}\n\n"
            f"Your complaint has been sent to the Municipal Corporation. "
            f"You'll receive a notification when a crew is assigned.\n\n"
            f"Is there anything else?"
        )

        result = {
            "agent": "VIRA",
            "response": response_text,
            "action_taken": "issue_created",
            "issue_id": issue_id,
            "extracted_data": extracted_data,
        }

    elif mode == "query":
        result = await handle_status_query(message, user_id)
    else:
        result = format_general_response(message)

    add_to_history(user_id, "assistant", result.get("response", ""))
    result["mode_detected"] = mode
    result["powered_by"] = "grok" if settings.has_xai_key else "rule_engine"
    result["timestamp"] = datetime.now(IST).isoformat()
    return result
