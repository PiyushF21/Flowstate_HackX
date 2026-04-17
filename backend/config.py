"""
InfraLens — Configuration
Loads environment variables from .env file using python-dotenv.
"""

import os
from dotenv import load_dotenv

# Load .env from the backend directory (or project root)
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # xAI / Grok API key for LLM-powered agents (COGNOS, VIRA, COMMANDER, etc.)
    XAI_API_KEY: str = os.getenv("XAI_API_KEY", "")

    # Sarvam AI API key for Text-to-Speech (VIRA, FIELD_COPILOT voice responses)
    SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "")

    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # Frontend origin for CORS
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    @property
    def has_xai_key(self) -> bool:
        """Check if a real xAI API key is configured (not placeholder)."""
        return bool(self.XAI_API_KEY) and self.XAI_API_KEY != "your-grok-api-key"

    @property
    def has_sarvam_key(self) -> bool:
        """Check if a real Sarvam AI API key is configured."""
        return bool(self.SARVAM_API_KEY) and self.SARVAM_API_KEY != "your-sarvam-api-key"


# Global singleton
settings = Settings()
