"""Google GenAI SDK wrapper for intent parsing and summary generation."""

import json
import logging
import os
import re
from typing import Any

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


class GeminiService:
    """Thin wrapper around the Google GenAI SDK."""

    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        self._client: genai.Client | None = None

        if self.api_key:
            try:
                self._client = genai.Client(api_key=self.api_key)
            except Exception as exc:
                logger.error("Failed to initialize Gemini client: %s", exc)

    @property
    def is_available(self) -> bool:
        return self._client is not None

    def _extract_json(self, text: str) -> dict[str, Any]:
        """Parse JSON from model response, handling markdown fences."""
        cleaned = text.strip()
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", cleaned)
        if fence_match:
            cleaned = fence_match.group(1).strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            brace_match = re.search(r"\{[\s\S]*\}", cleaned)
            if brace_match:
                return json.loads(brace_match.group())
            raise

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> dict[str, Any] | None:
        """Generate structured JSON from Gemini."""
        if not self._client:
            return None

        try:
            response = await self._client.aio.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.1,
                    response_mime_type="application/json",
                ),
            )
            if response.text:
                return self._extract_json(response.text)
        except Exception as exc:
            logger.error("Gemini JSON generation failed: %s", exc)

        return None

    async def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str | None:
        """Generate plain text from Gemini."""
        if not self._client:
            return None

        try:
            response = await self._client.aio.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.3,
                ),
            )
            return response.text
        except Exception as exc:
            logger.error("Gemini text generation failed: %s", exc)
            return None


gemini_service = GeminiService()
