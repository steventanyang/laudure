"""
Coordinator agent for the restaurant multi-agent system.
"""

import json
import time
from typing import Dict
from .base import (
    client, 
    update_token_usage, 
    update_performance_metrics,
    clean_json_response
)
from .prompts import COORDINATOR_PROMPT

class CoordinatorAgent:
    """Agent that combines and prioritizes insights from specialized agents"""
    
    def __init__(self):
        self.prompt_template = COORDINATOR_PROMPT
    
    def coordinate(self, diner: Dict, reservation: Dict, agent_results: Dict) -> Dict:
        """Combine and prioritize insights from specialized agents
        
        This method:
        1. Takes the results from all specialized agents
        2. Formats them into a prompt for the coordinator
        3. Makes an API call to generate a consolidated briefing
        4. Returns a prioritized summary of all insights
        
        The coordinator's role is to:
        - Identify the most critical information (safety, experience, operations)
        - Remove redundancies across agent outputs
        - Create a cohesive, actionable briefing for restaurant staff
        
        Args:
            diner: Dictionary containing diner information
            reservation: Dictionary containing reservation information
            agent_results: Dictionary containing results from all specialized agents
            
        Returns:
            Dictionary containing the consolidated briefing or error information
        """
        # Create a safe version of the prompt with escaped braces
        safe_prompt = self.prompt_template.replace("{", "{{").replace("}", "}}")
        # Restore the actual placeholders we need
        safe_prompt = safe_prompt.replace("{{diner_info}}", "{diner_info}")
        safe_prompt = safe_prompt.replace("{{reservation_info}}", "{reservation_info}")
        safe_prompt = safe_prompt.replace("{{dietary_analysis}}", "{dietary_analysis}")
        safe_prompt = safe_prompt.replace("{{guest_experience}}", "{guest_experience}")
        safe_prompt = safe_prompt.replace("{{special_requests}}", "{special_requests}")
        safe_prompt = safe_prompt.replace("{{personalization}}", "{personalization}")
        
        prompt = safe_prompt.format(
            diner_info=json.dumps(diner, default=str),
            reservation_info=json.dumps(reservation, default=str),
            dietary_analysis=json.dumps(agent_results["dietary_analysis"], default=str),
            guest_experience=json.dumps(agent_results["guest_experience"], default=str),
            special_requests=json.dumps(agent_results["special_requests"], default=str),
            personalization=json.dumps(agent_results["personalization"], default=str)
        )
        
        try:
            start_time = time.time()
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a coordinator agent for a restaurant. Return only valid JSON without markdown formatting or code blocks."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0
            )
            api_time = time.time() - start_time
            
            # Update metrics
            update_token_usage(response.usage)
            update_performance_metrics(api_time)
            
            result = response.choices[0].message.content
            
            # Clean the response to extract valid JSON
            cleaned_result = clean_json_response(result)
            
            return json.loads(cleaned_result)
        except json.JSONDecodeError:
            return {"error": "Failed to parse coordinator output", "raw_output": result}
        except Exception as e:
            return {"error": f"API error: {str(e)}"} 