"""
InfraLens — In-Memory Data Store

Thread-safe data store with asyncio.Lock.
Auto-loads seed data from backend/seed_data/*.json on startup.

Owner: Stavan (Backend Lead)
DO NOT MODIFY without Stavan's approval.
"""

from __future__ import annotations

import asyncio
import json
import math
import os
from datetime import datetime, timezone
from typing import Any, Optional

from models import (
    AgentEvent,
    AuditEntry,
    DailyReport,
    Issue,
    MC,
    Worker,
)


class DataStore:
    """
    Central in-memory data store for all InfraLens entities.

    Thread-safe via asyncio.Lock. All mutation methods acquire the lock.
    Seed data auto-loaded from backend/seed_data/ on initialization.
    """

    def __init__(self):
        self._lock = asyncio.Lock()

        # Primary stores
        self._issues: dict[str, Issue] = {}
        self._workers: dict[str, Worker] = {}
        self._reports: list[DailyReport] = []
        self._mcs: dict[str, MC] = {}

        # System stores
        self._audit_logs: list[AuditEntry] = []
        self._agent_events: list[AgentEvent] = []

        # Notifications store (for citizen notifications)
        self._notifications: list[dict] = []

        # Issue ID sequence counter per city
        self._issue_seq: dict[str, int] = {}

    # ------------------------------------------------------------------
    # Seed data loading
    # ------------------------------------------------------------------

    def load_seed_data(self):
        """Load JSON files from seed_data/ directory if they exist."""
        seed_dir = os.path.join(os.path.dirname(__file__), "seed_data")
        if not os.path.isdir(seed_dir):
            return

        # Load MCs
        mcs_path = os.path.join(seed_dir, "mcs.json")
        if os.path.isfile(mcs_path):
            with open(mcs_path, "r") as f:
                mcs_data = json.load(f)
                for mc_dict in mcs_data:
                    mc = MC(**mc_dict)
                    self._mcs[mc.mc_id] = mc

        # Load Workers
        workers_path = os.path.join(seed_dir, "workers.json")
        if os.path.isfile(workers_path):
            with open(workers_path, "r") as f:
                workers_data = json.load(f)
                for w_dict in workers_data:
                    worker = Worker(**w_dict)
                    self._workers[worker.worker_id] = worker

        # Load Issues
        issues_path = os.path.join(seed_dir, "issues.json")
        if os.path.isfile(issues_path):
            with open(issues_path, "r") as f:
                issues_data = json.load(f)
                for i_dict in issues_data:
                    issue = Issue(**i_dict)
                    self._issues[issue.issue_id] = issue

        # Load Reports
        reports_path = os.path.join(seed_dir, "reports.json")
        if os.path.isfile(reports_path):
            with open(reports_path, "r") as f:
                reports_data = json.load(f)
                for r_dict in reports_data:
                    self._reports.append(DailyReport(**r_dict))

        print(
            f"[DataStore] Seed data loaded: "
            f"{len(self._mcs)} MCs, "
            f"{len(self._workers)} workers, "
            f"{len(self._issues)} issues, "
            f"{len(self._reports)} reports"
        )

    # ------------------------------------------------------------------
    # Issue ID generator
    # ------------------------------------------------------------------

    def generate_issue_id(self, city: str) -> str:
        """
        Generate a unique issue ID.
        Format: ISS-{CITY_CODE}-{YYYY-MM-DD}-{SEQ:04d}
        """
        city_code = city[:3].upper() if city else "GEN"
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        key = f"{city_code}-{today}"
        self._issue_seq[key] = self._issue_seq.get(key, 0) + 1
        seq = self._issue_seq[key]
        return f"ISS-{city_code}-{today}-{seq:04d}"

    # ------------------------------------------------------------------
    # Persistence Helper
    # ------------------------------------------------------------------
    def _save_issues_to_disk(self):
        try:
            issues_path = os.path.join(os.path.dirname(__file__), "seed_data", "issues.json")
            if os.path.isdir(os.path.dirname(issues_path)):
                with open(issues_path, "w") as f:
                    json.dump([i.model_dump() for i in self._issues.values()], f, indent=2)
        except Exception as e:
            print(f"[DataStore] Failed to save issues to disk: {e}")

    # ------------------------------------------------------------------
    # Issue CRUD
    # ------------------------------------------------------------------

    async def create_issue(self, issue: Issue) -> Issue:
        async with self._lock:
            self._issues[issue.issue_id] = issue
            self._save_issues_to_disk()
            return issue

    async def get_issue(self, issue_id: str) -> Optional[Issue]:
        return self._issues.get(issue_id)

    async def update_issue(self, issue_id: str, updates: dict) -> Optional[Issue]:
        async with self._lock:
            issue = self._issues.get(issue_id)
            if not issue:
                return None
            issue_dict = issue.model_dump()
            issue_dict.update(updates)
            issue_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
            updated = Issue(**issue_dict)
            self._issues[issue_id] = updated
            self._save_issues_to_disk()
            return updated

    async def list_issues(self, filters: Optional[dict] = None) -> list[Issue]:
        issues = list(self._issues.values())

        if not filters:
            return issues

        if filters.get("status"):
            issues = [i for i in issues if i.status == filters["status"]]
        if filters.get("severity"):
            issues = [i for i in issues if i.severity == filters["severity"]]
        if filters.get("category"):
            issues = [i for i in issues if i.category == filters["category"]]
        if filters.get("mc"):
            issues = [
                i for i in issues
                if i.location and i.location.city and filters["mc"].lower() in i.location.city.lower()
            ]
        if filters.get("source"):
            issues = [i for i in issues if i.source == filters["source"]]
        if filters.get("reporter_id"):
            issues = [i for i in issues if i.reporter and i.reporter.reporter_id == filters["reporter_id"]]

        limit = filters.get("limit")
        if limit:
            issues = issues[:int(limit)]

        return issues

    async def list_issues_by_mc(self, mc: str) -> list[Issue]:
        return [
            i for i in self._issues.values()
            if i.location and i.location.city and mc.lower() in i.location.city.lower()
        ]

    async def list_issues_near(
        self, lat: float, lng: float, radius_m: float = 100
    ) -> list[Issue]:
        """Find issues within radius_m meters of (lat, lng) using haversine."""
        result = []
        for issue in self._issues.values():
            if issue.location:
                dist = self._haversine(lat, lng, issue.location.lat, issue.location.lng)
                if dist <= radius_m:
                    result.append(issue)
        return result

    # ------------------------------------------------------------------
    # Worker CRUD
    # ------------------------------------------------------------------

    async def get_worker(self, worker_id: str) -> Optional[Worker]:
        return self._workers.get(worker_id)

    async def list_workers(self, filters: Optional[dict] = None) -> list[Worker]:
        workers = list(self._workers.values())
        if not filters:
            return workers

        if filters.get("status"):
            workers = [w for w in workers if w.status == filters["status"]]
        if filters.get("mc"):
            workers = [w for w in workers if filters["mc"].lower() in w.mc.lower()]
        if filters.get("specialization"):
            spec = filters["specialization"]
            workers = [w for w in workers if spec in w.specializations]
        if filters.get("role"):
            workers = [w for w in workers if w.role == filters["role"]]

        return workers

    async def update_worker(self, worker_id: str, updates: dict) -> Optional[Worker]:
        async with self._lock:
            worker = self._workers.get(worker_id)
            if not worker:
                return None
            w_dict = worker.model_dump()
            w_dict.update(updates)
            updated = Worker(**w_dict)
            self._workers[worker_id] = updated
            return updated

    # ------------------------------------------------------------------
    # Report CRUD
    # ------------------------------------------------------------------

    async def create_report(self, report: DailyReport) -> DailyReport:
        async with self._lock:
            self._reports.append(report)
            return report

    async def list_reports(self, mc: Optional[str] = None) -> list[DailyReport]:
        if not mc:
            return list(self._reports)
        return [r for r in self._reports if mc.lower() in r.mc_name.lower()]

    # ------------------------------------------------------------------
    # MC CRUD
    # ------------------------------------------------------------------

    async def get_mc(self, mc_id: str) -> Optional[MC]:
        return self._mcs.get(mc_id)

    async def list_mcs(self) -> list[MC]:
        return list(self._mcs.values())

    # ------------------------------------------------------------------
    # Audit log
    # ------------------------------------------------------------------

    async def add_audit_log(self, entry: AuditEntry) -> None:
        async with self._lock:
            self._audit_logs.append(entry)

    async def get_audit_logs(self, filters: Optional[dict] = None) -> list[AuditEntry]:
        logs = list(self._audit_logs)
        if not filters:
            return logs

        if filters.get("agent"):
            logs = [l for l in logs if l.agent == filters["agent"]]
        if filters.get("role"):
            logs = [l for l in logs if l.role == filters["role"]]
        if filters.get("outcome"):
            logs = [l for l in logs if l.outcome == filters["outcome"]]

        limit = filters.get("limit", 200)
        return logs[-int(limit):]

    # ------------------------------------------------------------------
    # Agent events (for NEXUS dashboard)
    # ------------------------------------------------------------------

    async def add_agent_event(self, event: AgentEvent) -> None:
        async with self._lock:
            self._agent_events.append(event)

    async def get_agent_events(self, limit: int = 200) -> list[AgentEvent]:
        return self._agent_events[-limit:]

    # ------------------------------------------------------------------
    # Notifications
    # ------------------------------------------------------------------

    async def add_notification(self, notification: dict) -> None:
        async with self._lock:
            self._notifications.append(notification)

    async def get_notifications(self, user_id: Optional[str] = None) -> list[dict]:
        if not user_id:
            return list(self._notifications)
        return [n for n in self._notifications if n.get("user_id") == user_id]

    # ------------------------------------------------------------------
    # Utility: Haversine distance
    # ------------------------------------------------------------------

    @staticmethod
    def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance in meters between two GPS coordinates."""
        R = 6371000  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        d_phi = math.radians(lat2 - lat1)
        d_lambda = math.radians(lon2 - lon1)

        a = (
            math.sin(d_phi / 2) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c


# ---------------------------------------------------------------------------
# Global singleton
# ---------------------------------------------------------------------------
data_store = DataStore()
