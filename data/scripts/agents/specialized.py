"""
Specialized agent implementations for the restaurant multi-agent system.
"""

from .base import BaseAgent
from .prompts import (
    DIETARY_ANALYSIS_PROMPT,
    GUEST_EXPERIENCE_PROMPT,
    SPECIAL_REQUESTS_PROMPT,
    PERSONALIZATION_PROMPT
)

class DietaryAnalysisAgent(BaseAgent):
    """Agent focused on dietary restrictions, allergies, and preferences"""
    
    def __init__(self):
        super().__init__("Dietary Analysis Agent", DIETARY_ANALYSIS_PROMPT)


class GuestExperienceAgent(BaseAgent):
    """Agent focused on past experiences, preferences, and service style"""
    
    def __init__(self):
        super().__init__("Guest Experience Agent", GUEST_EXPERIENCE_PROMPT)


class SpecialRequestsAgent(BaseAgent):
    """Agent focused on explicit requests, modifications, and time-sensitive needs"""
    
    def __init__(self):
        super().__init__("Special Requests Agent", SPECIAL_REQUESTS_PROMPT)


class PersonalizationAgent(BaseAgent):
    """Agent focused on personalization opportunities and upsell potential"""
    
    def __init__(self):
        super().__init__("Personalization Agent", PERSONALIZATION_PROMPT) 