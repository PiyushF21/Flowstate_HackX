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

Phase 1 Draft: Pure Python logic — no external imports.
All functions take str/dict params and return dict.
Real model imports (from models import ...) will be added in Phase 2 after Stavan pushes models.py.
"""

# =============================================================================
# CONSTANTS
# =============================================================================

# Keywords for mode detection
REPORT_KEYWORDS = [
    # Problem descriptors
    "pothole", "broken", "burst", "leak", "flooding", "overflow",
    "garbage", "waste", "debris", "fallen", "collapsed", "damaged",
    "malfunctioning", "not working", "out of order", "faulty",
    "crack", "cave-in", "sinkhole", "blocked", "clogged",
    # Infrastructure
    "road", "pipe", "water", "sewer", "drain", "manhole",
    "street light", "signal", "transformer", "wire", "cable",
    "footpath", "pavement", "divider", "barrier", "bridge",
    # Urgency
    "dangerous", "hazard", "urgent", "emergency", "risk",
    "accident", "injury", "safety", "help",
    # Action
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
    "ISS-",  # Issue ID prefix
    "complaint number", "reference number", "ticket",
]

GENERAL_KEYWORDS = [
    "what is infralens", "what does infralens", "how does infralens",
    "who are you", "what can you do", "help me", "hello", "hi",
    "good morning", "good evening", "thank you", "thanks",
    "how to use", "features", "about",
]

# Category extraction keywords
CATEGORY_KEYWORDS = {
    "roads": {
        "keywords": ["pothole", "road", "highway", "street", "lane", "path",
                     "footpath", "pavement", "cave-in", "sinkhole", "crack",
                     "asphalt", "tar", "surface", "bumpy", "rough road",
                     "road damage", "broken road"],
        "subcategories": {
            "pothole": ["pothole", "pot hole", "hole in road", "road hole", "crater"],
            "cave_in": ["cave-in", "cave in", "sinkhole", "sink hole", "collapse", "subsidence"],
            "manhole": ["manhole", "man hole", "manhole cover", "missing cover"],
            "footpath_damage": ["footpath", "pavement", "sidewalk", "walkway"],
            "faded_markings": ["marking", "lane marking", "road marking", "faded", "zebra crossing"],
        }
    },
    "water_pipeline": {
        "keywords": ["water", "pipe", "pipeline", "burst", "leak", "flooding",
                     "water supply", "tap", "water pressure", "contaminated",
                     "dirty water", "no water", "water cut"],
        "subcategories": {
            "burst_pipe": ["burst", "broken pipe", "pipe burst", "pipe broken", "gushing"],
            "contamination": ["contaminated", "dirty water", "brown water", "smell", "odour"],
            "low_pressure": ["low pressure", "no pressure", "weak flow", "trickle", "no water"],
        }
    },
    "electrical": {
        "keywords": ["electric", "electrical", "light", "street light", "lamp",
                     "transformer", "power", "wire", "wiring", "signal",
                     "traffic light", "traffic signal", "dark", "no light"],
        "subcategories": {
            "street_light": ["street light", "lamp", "light post", "pole light", "dark street", "no light"],
            "exposed_wiring": ["wire", "wiring", "exposed", "hanging wire", "cable", "shock"],
            "traffic_signal": ["traffic signal", "traffic light", "signal not working", "red light"],
            "transformer": ["transformer", "power cut", "electricity", "substation"],
        }
    },
    "sanitation": {
        "keywords": ["garbage", "waste", "trash", "rubbish", "litter",
                     "drain", "drainage", "sewer", "sewage", "gutter",
                     "overflow", "clog", "blocked drain", "stink", "smell",
                     "dirty", "filthy", "unhygienic"],
        "subcategories": {
            "garbage": ["garbage", "waste", "trash", "rubbish", "litter", "dump", "dustbin", "bin"],
            "drain_blockage": ["drain", "drainage", "blocked", "clogged", "gutter", "nala"],
            "sewage_overflow": ["sewage", "sewer", "overflow", "sewage water", "waste water"],
        }
    },
    "structural": {
        "keywords": ["building", "wall", "crack", "structural", "bridge",
                     "flyover", "retaining wall", "pillar", "beam", "ceiling",
                     "construction", "collapse"],
        "subcategories": {
            "building_crack": ["building crack", "wall crack", "crack in wall", "structural crack"],
            "bridge_damage": ["bridge", "flyover", "overpass", "underpass"],
            "retaining_wall": ["retaining wall", "compound wall", "boundary wall"],
        }
    },
    "traffic": {
        "keywords": ["traffic", "divider", "barrier", "sign", "signage",
                     "road sign", "speed bump", "speed breaker"],
        "subcategories": {
            "broken_divider": ["divider", "barrier", "median", "broken divider"],
            "missing_signage": ["sign", "signage", "road sign", "missing sign"],
        }
    },
    "environment": {
        "keywords": ["tree", "fallen tree", "branch", "green", "garden",
                     "park", "dumping", "illegal dumping", "pollution",
                     "air quality", "noise"],
        "subcategories": {
            "fallen_tree": ["fallen tree", "tree fell", "branch", "uprooted"],
            "illegal_dumping": ["dumping", "illegal dump", "waste dump"],
        }
    },
}

# Severity heuristic keywords
SEVERITY_KEYWORDS = {
    "CRITICAL": [
        "emergency", "life threatening", "death", "electrocution",
        "flooding road", "complete blockage", "collapse", "cave-in",
        "gas leak", "fire", "major burst", "open manhole",
        "live wire", "structural failure", "danger", "accident",
        "someone got hurt", "injury",
    ],
    "HIGH": [
        "burst pipe", "large pothole", "traffic signal failure",
        "road blocked", "heavy flooding", "major leak",
        "significant damage", "unsafe", "broken", "huge",
        "deep pothole", "big hole", "severe",
    ],
    "MEDIUM": [
        "street light out", "drain blocked", "garbage pile",
        "moderate", "pothole", "leak", "overflow", "damaged",
        "not working", "broken footpath",
    ],
    "LOW": [
        "faded marking", "minor crack", "small", "cosmetic",
        "aesthetic", "overflowing bin", "litter", "grass",
        "paint", "minor",
    ],
}

# Location extraction keywords (common Mumbai/Indian locations)
LOCATION_PREPOSITIONS = [
    "near", "at", "on", "beside", "next to", "in front of",
    "behind", "opposite", "close to", "adjacent to", "around",
    "outside", "inside", "towards",
]


# =============================================================================
# PROMPT TEMPLATES (LangChain-style, will use PromptTemplate in Phase 2)
# =============================================================================

REPORT_EXTRACTION_PROMPT = """You are VIRA, an AI assistant for InfraLens — India's civic infrastructure intelligence platform.

A citizen has reported an infrastructure issue. Extract structured data from their message.

CATEGORIES (pick one):
- roads: potholes, cave-ins, broken footpaths, missing manhole covers, faded markings
- water_pipeline: burst pipes, contaminated water, low pressure
- electrical: street light out, exposed wiring, traffic signal failure, transformer issues
- sanitation: garbage accumulation, drain blockage, sewage overflow
- structural: building cracks, bridge damage, retaining wall damage
- traffic: broken dividers, missing signage
- environment: fallen trees, illegal dumping

SEVERITY RULES:
- CRITICAL: Immediate safety hazard (open manhole, live wire, gas leak, major collapse, flooding road)
- HIGH: Significant public disruption (large pothole on highway, burst water main, traffic signal failure)
- MEDIUM: Notable inconvenience (street light out, blocked drain, moderate pothole)
- LOW: Minor issue (faded road marking, overflowing bin, minor crack)

Citizen message: {message}
Chat history: {history}

Respond ONLY in this exact JSON format:
{{
    "category": "<category>",
    "subcategory": "<specific_issue_type>",
    "severity": "<CRITICAL|HIGH|MEDIUM|LOW>",
    "location_text": "<any location mentioned, or 'Not specified'>",
    "description": "<structured 1-2 sentence summary of the issue>"
}}
"""

STATUS_RESPONSE_PROMPT = """You are VIRA, an AI assistant for InfraLens.
The citizen is asking about the status of their complaint.

Issue data:
{issue_data}

Generate a friendly, conversational response in 2-3 sentences.
Include: current status, who it's assigned to (if assigned), expected timeline.
Be empathetic and reassuring. Use simple language.
If the issue is resolved, congratulate them and mention proof is available.
"""

GENERAL_RESPONSE_PROMPT = """You are VIRA, the AI assistant for InfraLens — India's AI-powered civic infrastructure intelligence platform.

InfraLens connects Citizens, Municipal Corporations, Field Workers, and State Governments through 11 autonomous AI agents for real-time infrastructure issue detection, assignment, resolution, and accountability.

Key features citizens can use:
1. Report infrastructure issues (potholes, water leaks, garbage, electrical faults, etc.)
2. Track complaint status in real-time
3. Get notifications when issues are resolved
4. Automatic pothole detection via car sensors
5. 360° image capture for road hazards

Citizen message: {message}

Respond helpfully and conversationally. Keep it brief (2-3 sentences).
If they want to report an issue, guide them to describe what they see and where.
If they want to check status, ask for their complaint ID or describe the issue.
"""


# =============================================================================
# CORE FUNCTIONS — Phase 1 Drafts (Pure Python, no external imports)
# =============================================================================

def detect_mode(message: str) -> str:
    """
    Classify the citizen's message into one of three modes:
    - "report": Citizen is describing a problem → intake flow
    - "query": Citizen is asking about an existing complaint → status lookup
    - "general": General questions about InfraLens → info response
    
    Uses weighted keyword matching. Report keywords are checked first since
    that's the primary action; query keywords second; general as fallback.
    """
    message_lower = message.lower().strip()
    
    # Score each mode
    report_score = 0
    query_score = 0
    general_score = 0
    
    for keyword in REPORT_KEYWORDS:
        if keyword.lower() in message_lower:
            report_score += 1
    
    for keyword in QUERY_KEYWORDS:
        if keyword.lower() in message_lower:
            query_score += 1
    
    for keyword in GENERAL_KEYWORDS:
        if keyword.lower() in message_lower:
            general_score += 1
    
    # Issue IDs get heavy weight for query mode
    if "ISS-" in message.upper():
        query_score += 5
    
    # "status" and "my complaint" are very strong query signals
    if "status" in message_lower or "my complaint" in message_lower:
        query_score += 3
    
    # Determine mode based on highest score
    if report_score > query_score and report_score > general_score:
        return "report"
    elif query_score > report_score and query_score > general_score:
        return "query"
    elif general_score > 0:
        return "general"
    
    # Default: if message is long (>20 words) and descriptive, likely a report
    word_count = len(message.split())
    if word_count > 15:
        return "report"
    
    # Short messages with no strong signal → general
    return "general"


def extract_complaint_data_rule_based(message: str) -> dict:
    """
    Rule-based extraction of complaint data from citizen's message.
    Used as fallback when LLM API is not available.
    
    Extracts:
    - category: infrastructure category
    - subcategory: specific issue type
    - severity: CRITICAL/HIGH/MEDIUM/LOW
    - location_text: any location mentioned
    - description: cleaned summary
    """
    message_lower = message.lower()
    
    # --- Extract Category ---
    detected_category = None
    detected_subcategory = None
    best_category_score = 0
    
    for category, config in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in config["keywords"] if kw in message_lower)
        if score > best_category_score:
            best_category_score = score
            detected_category = category
            
            # Find subcategory
            best_sub_score = 0
            for sub_name, sub_keywords in config["subcategories"].items():
                sub_score = sum(1 for kw in sub_keywords if kw in message_lower)
                if sub_score > best_sub_score:
                    best_sub_score = sub_score
                    detected_subcategory = sub_name
    
    # Default category if none detected
    if not detected_category:
        detected_category = "roads"
        detected_subcategory = "pothole"
    
    if not detected_subcategory:
        # Pick first subcategory of the detected category
        subcats = list(CATEGORY_KEYWORDS.get(detected_category, {}).get("subcategories", {}).keys())
        detected_subcategory = subcats[0] if subcats else "general"
    
    # --- Extract Severity ---
    detected_severity = "MEDIUM"  # Default
    best_severity_score = 0
    
    for severity, keywords in SEVERITY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in message_lower)
        if score > best_severity_score:
            best_severity_score = score
            detected_severity = severity
    
    # --- Extract Location ---
    location_text = "Not specified"
    for prep in LOCATION_PREPOSITIONS:
        idx = message_lower.find(prep + " ")
        if idx != -1:
            # Extract text after the preposition, up to punctuation or end
            start = idx + len(prep) + 1
            remaining = message[start:]
            # Take up to the next comma, period, or end of string
            end_markers = [",", ".", "!", "?", "\n"]
            end = len(remaining)
            for marker in end_markers:
                marker_idx = remaining.find(marker)
                if marker_idx != -1 and marker_idx < end:
                    end = marker_idx
            location_candidate = remaining[:end].strip()
            if len(location_candidate) > 3:  # Minimum meaningful location
                location_text = location_candidate
                break
    
    # --- Build Description ---
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


def format_report_response(extracted_data: dict, issue_id: str) -> dict:
    """
    Format the response after a complaint has been registered.
    Returns a structured response dict for the citizen.
    """
    severity_emoji = {
        "CRITICAL": "🚨",
        "HIGH": "⚠️",
        "MEDIUM": "📋",
        "LOW": "📝",
    }
    
    category_emoji = {
        "roads": "🛣️",
        "water_pipeline": "🚰",
        "electrical": "⚡",
        "sanitation": "🗑️",
        "structural": "🏗️",
        "traffic": "🚦",
        "environment": "🌳",
    }
    
    cat = extracted_data.get("category", "general")
    sev = extracted_data.get("severity", "MEDIUM")
    loc = extracted_data.get("location_text", "Not specified")
    
    response_text = (
        f"Got it! {severity_emoji.get(sev, '📋')} I've registered your complaint about "
        f"the {cat.replace('_', ' ')} issue {category_emoji.get(cat, '📌')}.\n\n"
        f"📍 Location: {loc}\n"
        f"🔴 Severity: {sev}\n"
        f"🆔 Complaint ID: {issue_id}\n\n"
        f"Your complaint has been sent to the Municipal Corporation for immediate action. "
        f"You'll receive a notification when a repair crew is assigned.\n\n"
        f"Is there anything else you need help with?"
    )
    
    return {
        "agent": "VIRA",
        "response": response_text,
        "action_taken": "issue_created",
        "issue_id": issue_id,
        "extracted_data": extracted_data,
    }


def format_status_response(issue_data: dict) -> dict:
    """
    Format a status response for the citizen's query.
    Takes issue data dict and creates a conversational response.
    """
    status = issue_data.get("status", "unknown")
    category = issue_data.get("category", "infrastructure")
    location = "your area"
    if isinstance(issue_data.get("location"), dict):
        location = issue_data["location"].get("address", "your area")
    elif isinstance(issue_data.get("location_text"), str):
        location = issue_data["location_text"]
    
    status_messages = {
        "reported": (
            f"Your complaint about the {category.replace('_', ' ')} issue "
            f"near {location} has been received and is being processed. "
            f"Our AI system is classifying it and will assign a repair crew shortly."
        ),
        "assigned": (
            f"Great news! Your complaint about the {category.replace('_', ' ')} issue "
            f"near {location} has been assigned to a repair crew. "
            f"They should be heading to the site soon."
        ),
        "in_progress": (
            f"A repair crew is currently working on the {category.replace('_', ' ')} issue "
            f"near {location}. They're on-site and making progress. "
            f"You'll be notified as soon as the work is complete."
        ),
        "resolved": (
            f"Good news! 🎉 The {category.replace('_', ' ')} issue near {location} "
            f"has been resolved! Proof photos are available in your complaint details. "
            f"Thank you for helping improve our city's infrastructure!"
        ),
        "escalated": (
            f"Your complaint about the {category.replace('_', ' ')} issue "
            f"near {location} has been escalated to higher officials for urgent attention. "
            f"This means it's being given top priority."
        ),
    }
    
    response_text = status_messages.get(
        status,
        f"Your complaint about the {category.replace('_', ' ')} issue is currently being processed. "
        f"We'll keep you updated with any changes."
    )
    
    # Add assigned worker info if available
    assigned_to = issue_data.get("assigned_to")
    if assigned_to and status in ("assigned", "in_progress"):
        worker_name = assigned_to.get("worker_name", "a field worker")
        response_text += f"\n\n👷 Assigned to: {worker_name}"
    
    # Add deadline info
    deadline = issue_data.get("deadline")
    if deadline and status in ("assigned", "in_progress"):
        response_text += f"\n⏰ Expected completion: {deadline}"
    
    return {
        "agent": "VIRA",
        "response": response_text,
        "action_taken": "status_query",
        "issue_id": issue_data.get("issue_id", ""),
    }


def format_general_response(message: str) -> dict:
    """
    Handle general/informational queries about InfraLens.
    Rule-based responses for common questions. LLM will enhance this in Phase 2.
    """
    message_lower = message.lower().strip()
    
    if any(greet in message_lower for greet in ["hello", "hi", "hey", "good morning", "good evening", "good afternoon"]):
        response = (
            "Hello! 👋 I'm VIRA, your AI assistant for InfraLens. "
            "I can help you report infrastructure issues, check the status of your complaints, "
            "or answer questions about how InfraLens works. How can I help you today?"
        )
    elif "what is infralens" in message_lower or "about infralens" in message_lower:
        response = (
            "InfraLens is India's AI-powered civic infrastructure intelligence platform. 🏗️\n\n"
            "It connects citizens, municipal corporations, field workers, and state governments "
            "through 11 autonomous AI agents for real-time infrastructure issue detection, "
            "assignment, resolution, and accountability.\n\n"
            "You can report potholes, water leaks, garbage issues, electrical faults, and much more. "
            "Your car can even auto-detect potholes! Would you like to report an issue?"
        )
    elif "what can you do" in message_lower or "how can you help" in message_lower or "features" in message_lower:
        response = (
            "I can help you with:\n\n"
            "📝 **Report Issues** — Describe a problem (pothole, water leak, garbage, etc.) "
            "and I'll register it automatically\n"
            "🔍 **Track Status** — Ask about your existing complaints\n"
            "🚗 **Auto-Detection** — Your car sensors automatically report potholes\n"
            "📸 **Image Capture** — Take a photo of road hazards for instant AI analysis\n"
            "🔔 **Notifications** — Get updates when your issue is being fixed\n\n"
            "Just tell me what you need!"
        )
    elif "thank" in message_lower:
        response = (
            "You're welcome! 😊 Thank you for helping make our city's infrastructure better. "
            "Don't hesitate to report any issues you come across. Together, we can make a difference!"
        )
    else:
        response = (
            "I'm VIRA, your InfraLens assistant. I can help you:\n"
            "• Report an infrastructure issue — just describe what you see\n"
            "• Check the status of an existing complaint\n"
            "• Learn about InfraLens features\n\n"
            "What would you like to do?"
        )
    
    return {
        "agent": "VIRA",
        "response": response,
        "action_taken": "general_response",
    }


# =============================================================================
# CHAT SESSION MANAGEMENT (in-memory)
# =============================================================================

# In-memory store: user_id → list of {role: "user"|"assistant", content: str}
chat_sessions: dict = {}

MAX_HISTORY_LENGTH = 20  # Keep last 20 messages per user


def get_session_history(user_id: str) -> list:
    """Get chat history for a user, creating session if new."""
    if user_id not in chat_sessions:
        chat_sessions[user_id] = []
    return chat_sessions[user_id]


def add_to_history(user_id: str, role: str, content: str) -> None:
    """Add a message to the user's chat history."""
    history = get_session_history(user_id)
    history.append({"role": role, "content": content})
    # Trim to max length
    if len(history) > MAX_HISTORY_LENGTH:
        chat_sessions[user_id] = history[-MAX_HISTORY_LENGTH:]


def clear_session(user_id: str) -> None:
    """Clear a user's chat session."""
    chat_sessions.pop(user_id, None)


# =============================================================================
# MAIN ENTRY POINT (Draft — will be async in Phase 2)
# =============================================================================

def chat(user_id: str, message: str, session_history: list = None) -> dict:
    """
    Main entry point for VIRA citizen chat.
    
    Flow:
    1. Detect mode (report / query / general)
    2. Route to appropriate handler
    3. Return structured response
    
    In Phase 2, this will:
    - Become async
    - Use LLM for extraction and responses
    - Create issues via data_store
    - Route through NEXUS pipeline
    """
    # Add user message to history
    add_to_history(user_id, "user", message)
    
    # Detect mode
    mode = detect_mode(message)
    
    # Route to handler
    if mode == "report":
        # Extract complaint data using rule-based approach
        extracted_data = extract_complaint_data_rule_based(message)
        
        # Generate a placeholder issue ID (will use data_store in Phase 2)
        import datetime
        now = datetime.datetime.now()
        placeholder_id = f"ISS-MUM-{now.strftime('%Y-%m-%d')}-{now.strftime('%H%M')}"
        
        result = format_report_response(extracted_data, placeholder_id)
        
    elif mode == "query":
        # In Phase 1, return a placeholder status response
        # In Phase 2, this will query data_store by user_id or issue_id
        placeholder_issue = {
            "issue_id": "ISS-MUM-2026-04-17-0001",
            "status": "assigned",
            "category": "roads",
            "location": {"address": "your reported location"},
            "assigned_to": {"worker_name": "A field worker"},
            "deadline": "Today",
        }
        result = format_status_response(placeholder_issue)
        
    else:
        result = format_general_response(message)
    
    # Add assistant response to history
    add_to_history(user_id, "assistant", result.get("response", ""))
    
    # Attach metadata
    result["mode_detected"] = mode
    result["powered_by"] = "rule_engine"  # Will change to "grok" in Phase 2
    
    return result
