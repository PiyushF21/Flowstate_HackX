"""
InfraLens — Pydantic Models

All shared data models for the 11-agent civic infrastructure platform.
These models are the contract between all agents, routers, and the data store.

Owner: Stavan (Backend Lead)
DO NOT MODIFY without Stavan's approval — all agents depend on these types.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class IssueStatus(str, Enum):
    REPORTED = "reported"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    PENDING_VERIFICATION = "pending_verification"
    RESOLVED = "resolved"
    ESCALATED = "escalated"
    CANCELLED = "cancelled"


class IssueSource(str, Enum):
    CAR_SENSOR = "car_sensor"
    THREE_SIXTY_CAPTURE = "360_capture"
    MANUAL_COMPLAINT = "manual_complaint"


class WorkerRole(str, Enum):
    FIELD_WORKER = "field_worker"
    FLEET_LEADER = "fleet_leader"
    SUPERVISOR = "supervisor"


class WorkerStatus(str, Enum):
    AVAILABLE = "available"
    ON_TASK = "on_task"
    OFF_DUTY = "off_duty"


class UserRole(str, Enum):
    CITIZEN = "citizen"
    BMC_SUPERVISOR = "bmc_supervisor"
    FIELD_WORKER = "field_worker"
    STATE_OFFICIAL = "state_official"
    NEXUS_ADMIN = "nexus_admin"


# ---------------------------------------------------------------------------
# Core value objects
# ---------------------------------------------------------------------------

class Location(BaseModel):
    """GPS location with human-readable address info."""
    lat: float
    lng: float
    address: str = ""
    city: str = ""
    ward: str = ""
    pincode: Optional[str] = None


class Shift(BaseModel):
    """Worker shift window."""
    start: str = "08:00"  # HH:MM
    end: str = "18:00"


# ---------------------------------------------------------------------------
# Data ingestion models (3 data sources)
# ---------------------------------------------------------------------------

class SensorData(BaseModel):
    """Car-mounted sensor data — accelerometer anomaly detection."""
    vehicle_id: str
    timestamp: str
    gps: Location
    speed_kmh: float
    accelerometer: dict = Field(default_factory=lambda: {"x": 0.0, "y": 0.0, "z": 0.0})
    suspension_event: bool = False
    road_segment: str = ""
    city: str = ""
    ward: str = ""


class ImageCapture(BaseModel):
    """360° camera capture data — visual hazard detection."""
    reporter_id: str
    reporter_name: str = ""
    timestamp: str = ""
    gps: Location
    images: list[str] = Field(default_factory=list)
    auto_detected_category: str = ""
    ai_confidence: float = 0.0
    road_segment: str = ""
    city: str = ""
    ward: str = ""


class ManualComplaint(BaseModel):
    """Citizen-filed manual complaint."""
    reporter_id: str
    reporter_name: str = ""
    timestamp: str = ""
    gps: Location
    category: str = ""
    subcategory: str = ""
    description: str = ""
    severity_self_assessed: str = ""
    images: list[str] = Field(default_factory=list)
    address_text: str = ""
    city: str = ""
    ward: str = ""


# ---------------------------------------------------------------------------
# Supporting models used inside Issue
# ---------------------------------------------------------------------------

class AIClassification(BaseModel):
    """COGNOS dual-brain classification result."""
    agent: str = "COGNOS"
    category_confidence: float = 0.0
    severity_confidence: float = 0.0
    cross_validation_count: int = 0


class Reporter(BaseModel):
    """Issue reporter info."""
    reporter_id: str
    reporter_name: str = ""
    contact: Optional[str] = None


class Assignment(BaseModel):
    """COMMANDER task assignment."""
    worker_id: str
    worker_name: str = ""
    team: list[dict] = Field(default_factory=list)
    assigned_at: str = ""
    assigned_by: str = "COMMANDER"


class Completion(BaseModel):
    """LOOP task completion + verification."""
    completed_at: str = ""
    proof_images: list[str] = Field(default_factory=list)
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None


class Performance(BaseModel):
    """Worker performance metrics."""
    tasks_completed_this_week: int = 0
    avg_resolution_time_hours: float = 0.0
    rating: float = 4.0
    on_time_completion_pct: float = 100.0


# ---------------------------------------------------------------------------
# Primary entities
# ---------------------------------------------------------------------------

class Issue(BaseModel):
    """
    Central issue entity — flows through the entire NEXUS pipeline.
    Created by COGNOS (sensor/image) or VIRA (manual complaint).
    Assigned by COMMANDER. Verified by LOOP. Monitored by GUARDIAN.
    """
    issue_id: str
    source: str = ""  # car_sensor | 360_capture | manual_complaint
    category: str = ""
    subcategory: str = ""
    severity: str = "MEDIUM"  # CRITICAL | HIGH | MEDIUM | LOW
    confidence: float = 0.0
    status: str = "reported"  # reported → assigned → in_progress → resolved
    location: Optional[Location] = None
    description: str = ""
    ai_classification: Optional[AIClassification] = None
    reporter: Optional[Reporter] = None
    images: list[str] = Field(default_factory=list)
    assigned_to: Optional[Assignment] = None
    procedure: list[str] = Field(default_factory=list)
    deadline: Optional[str] = None
    materials_required: list[str] = Field(default_factory=list)
    completion: Optional[Completion] = None
    resolution_time_hours: Optional[float] = None
    sla_met: Optional[bool] = None
    citizen_notified: bool = False
    created_at: str = ""
    updated_at: str = ""


class Worker(BaseModel):
    """
    Field worker entity — assigned tasks by COMMANDER.
    Performance tracked by LOOP feedback.
    """
    worker_id: str
    name: str = ""
    phone: str = ""
    role: str = "field_worker"  # field_worker | fleet_leader | supervisor
    specializations: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    zone: str = ""
    mc: str = ""
    status: str = "available"  # available | on_task | off_duty
    current_task_id: Optional[str] = None
    shift: Optional[Shift] = None
    current_location: Optional[Location] = None
    performance: Optional[Performance] = None


class DailyReport(BaseModel):
    """PRESCIENT daily report for an MC."""
    report_id: str
    mc_name: str = ""
    date: str = ""
    generated_by: str = "PRESCIENT"
    generated_at: str = ""
    summary: dict = Field(default_factory=dict)
    by_category: dict = Field(default_factory=dict)
    by_severity: dict = Field(default_factory=dict)
    worst_wards: list[str] = Field(default_factory=list)
    escalated_tasks: int = 0
    fund_utilization_pct: float = 0.0


class MC(BaseModel):
    """Municipal Corporation entity — monitored by FLEET + State Government."""
    mc_id: str
    name: str = ""
    city: str = ""
    state: str = "Maharashtra"
    total_workers: int = 0
    issues_this_week: int = 0
    resolution_rate: float = 0.0
    avg_resolution_hours: float = 0.0


# ---------------------------------------------------------------------------
# System / audit models
# ---------------------------------------------------------------------------

class AuditEntry(BaseModel):
    """SENTINEL audit log entry — immutable record of every agent action."""
    id: str
    agent: str = ""
    action: str = ""
    role: str = ""
    user_id: str = ""
    outcome: str = ""  # allowed | denied
    details: dict = Field(default_factory=dict)
    timestamp: str = ""


class AgentEvent(BaseModel):
    """
    Real-time agent activity event — broadcasted via WebSocket.
    Drives the NEXUS constellation dashboard animations.
    """
    agent: str
    action: str = ""
    issue_id: Optional[str] = None
    data: dict = Field(default_factory=dict)
    portal: str = ""  # citizen | bmc | state | worker | nexus
    timestamp: str = ""


# ---------------------------------------------------------------------------
# Request / Response helpers
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    """VIRA / FIELD_COPILOT chat request."""
    user_id: str
    message: str
    session_id: Optional[str] = None


class VoiceMessage(BaseModel):
    """VIRA / FIELD_COPILOT voice request."""
    user_id: str
    transcribed_text: str
    language: str = "en"
    task_context: Optional[dict] = None


class FeedbackSubmission(BaseModel):
    """LOOP citizen feedback."""
    issue_id: str
    reporter_id: str
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class EscalationRequest(BaseModel):
    """GUARDIAN manual escalation."""
    issue_id: str
    escalated_by: str
    reason: str = ""


class FundAllocation(BaseModel):
    """ORACLE fund allocation entry."""
    mc_id: str
    mc_name: str = ""
    recommended_amount: float = 0.0
    current_amount: float = 0.0
    adjusted_amount: float = 0.0
    rationale: str = ""
    performance_flag: str = ""  # good | warning | critical
