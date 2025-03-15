from openai import OpenAI
from typing import Dict, List, Any
import json
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path
from dotenv import load_dotenv
import sys
import threading

# Get the current directory and add paths
script_dir = Path(__file__).parent
data_dir = script_dir.parent
project_root = data_dir.parent

# Add paths to sys.path
sys.path.append(str(project_root))
sys.path.append(str(data_dir))

# Load environment variables
load_dotenv(data_dir / ".env")

# Import the data models
try:
    from load_data import DinersList, Diner, Reservation
except ImportError as e:
    print(f"Error importing load_data: {e}")
    sys.exit(1)

# Load OpenAI API key from environment
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")

# Initialize the OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Global counters for token usage and timing
token_usage = {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
}
token_lock = threading.Lock()

# Performance metrics
performance_metrics = {
    "api_calls": 0,
    "total_api_time": 0,
    "max_api_time": 0,
    "min_api_time": float('inf')
}
metrics_lock = threading.Lock()

def update_token_usage(usage_data):
    """Update the global token usage counters"""
    with token_lock:
        token_usage["prompt_tokens"] += usage_data.prompt_tokens
        token_usage["completion_tokens"] += usage_data.completion_tokens
        token_usage["total_tokens"] += usage_data.total_tokens

def update_performance_metrics(api_time):
    """Update the performance metrics"""
    with metrics_lock:
        performance_metrics["api_calls"] += 1
        performance_metrics["total_api_time"] += api_time
        performance_metrics["max_api_time"] = max(performance_metrics["max_api_time"], api_time)
        performance_metrics["min_api_time"] = min(performance_metrics["min_api_time"], api_time)

def clean_json_response(response_text):
    """Clean the response text to extract valid JSON"""
    # Remove markdown code blocks if present
    if "```json" in response_text:
        # Extract content between ```json and ```
        start_idx = response_text.find("```json") + 7
        end_idx = response_text.find("```", start_idx)
        if end_idx > start_idx:
            response_text = response_text[start_idx:end_idx].strip()
    elif "```" in response_text:
        # Extract content between ``` and ```
        start_idx = response_text.find("```") + 3
        end_idx = response_text.find("```", start_idx)
        if end_idx > start_idx:
            response_text = response_text[start_idx:end_idx].strip()
    
    # Remove any leading/trailing whitespace
    response_text = response_text.strip()
    
    return response_text

class BaseAgent:
    """Base class for all specialized agents"""
    
    def __init__(self, name: str, prompt_template: str):
        self.name = name
        self.prompt_template = prompt_template
    
    def analyze(self, diner: Dict, reservation: Dict) -> Dict:
        """Run analysis on diner and reservation data"""
        # Create a safe version of the prompt with escaped braces
        safe_prompt = self.prompt_template.replace("{", "{{").replace("}", "}}")
        # Restore the actual placeholders we need
        safe_prompt = safe_prompt.replace("{{diner_info}}", "{diner_info}")
        safe_prompt = safe_prompt.replace("{{reservation_info}}", "{reservation_info}")
        
        prompt = safe_prompt.format(
            diner_info=json.dumps(diner, default=str),
            reservation_info=json.dumps(reservation, default=str)
        )
        
        try:
            start_time = time.time()
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a specialized agent for a restaurant. Return only valid JSON without markdown formatting or code blocks."},
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
            # Fallback if the model doesn't return valid JSON
            return {"error": "Failed to parse agent output", "raw_output": result}
        except Exception as e:
            return {"error": f"API error: {str(e)}"}


class DietaryAnalysisAgent(BaseAgent):
    """Agent focused on dietary restrictions, allergies, and preferences"""
    
    def __init__(self):
        prompt_template = """
        You are a Dietary Analysis Agent for a fine dining restaurant. Analyze the diner's information and upcoming reservation to identify:
        
        1. Allergies and dietary restrictions (critical safety issues)
        2. Dietary preferences (important for satisfaction)
        3. Special preparation instructions
        
        Diner Information:
        {diner_info}
        
        Upcoming Reservation:
        {reservation_info}
        
        Provide your analysis in the following JSON format:
        ```
        {
            "allergies": [
                {"item": "allergen name", "severity": "critical/preference", "source": "where this was mentioned"}
            ],
            "dietary_restrictions": [
                {"restriction": "type of restriction", "notes": "details", "source": "where this was mentioned"}
            ],
            "preparation_instructions": [
                {"dish": "dish name", "instruction": "specific preparation note"}
            ]
        }
        ```
        
        Return only the JSON with no additional text.
        """
        super().__init__("Dietary Analysis Agent", prompt_template)


class GuestExperienceAgent(BaseAgent):
    """Agent focused on past experiences, preferences, and service style"""
    
    def __init__(self):
        prompt_template = """
        You are a Guest Experience Agent for a fine dining restaurant. Analyze the diner's past reviews and information to identify:
        
        1. What impressed or disappointed them in the past
        2. Service style preferences (attentive vs. hands-off)
        3. Conversation topics that resonated with them
        
        Diner Information:
        {diner_info}
        
        Upcoming Reservation:
        {reservation_info}
        
        Provide your analysis in the following JSON format:
        ```
        {
            "past_impressions": [
                {"type": "positive/negative", "aspect": "what impressed/disappointed", "source": "where this was mentioned"}
            ],
            "service_preferences": {
                "style": "attentive/hands-off/balanced",
                "evidence": "reasoning behind this assessment"
            },
            "conversation_topics": [
                {"topic": "topic name", "context": "where/how this was mentioned"}
            ]
        }
        ```
        
        Return only the JSON with no additional text.
        """
        super().__init__("Guest Experience Agent", prompt_template)


class SpecialRequestsAgent(BaseAgent):
    """Agent focused on explicit requests, modifications, and time-sensitive needs"""
    
    def __init__(self):
        prompt_template = """
        You are a Special Requests Agent for a fine dining restaurant. Analyze the diner's emails and reservation information to identify:
        
        1. Explicit requests made by the guest
        2. Modifications to standard service
        3. Time-sensitive needs
        4. Special occasions or celebrations
        
        Diner Information:
        {diner_info}
        
        Upcoming Reservation:
        {reservation_info}
        
        Provide your analysis in the following JSON format:
        ```
        {
            "explicit_requests": [
                {"request": "description of request", "priority": "high/medium/low", "source": "where this was mentioned"}
            ],
            "service_modifications": [
                {"modification": "description of modification", "notes": "additional details"}
            ],
            "time_sensitive": [
                {"need": "description of need", "timing": "when this needs to happen"}
            ],
            "special_occasions": [
                {"occasion": "type of celebration", "details": "specific details"}
            ]
        }
        ```
        
        Return only the JSON with no additional text.
        """
        super().__init__("Special Requests Agent", prompt_template)


class PersonalizationAgent(BaseAgent):
    """Agent focused on personalization opportunities and memorable experiences"""
    
    def __init__(self):
        prompt_template = """
        You are a Personalization Agent for a fine dining restaurant. Analyze the diner's information to identify:
        
        1. Opportunities for personalized experiences
        2. Potential upsell opportunities based on preferences
        3. Recognition moments or conversation starters
        
        Diner Information:
        {diner_info}
        
        Upcoming Reservation:
        {reservation_info}
        
        Provide your analysis in the following JSON format:
        ```
        {
            "personalization_opportunities": [
                {"opportunity": "description", "implementation": "how to execute", "impact": "high/medium/low"}
            ],
            "upsell_opportunities": [
                {"item": "what to suggest", "rationale": "why this would appeal to the guest"}
            ],
            "recognition_moments": [
                {"moment": "what to recognize", "approach": "how to mention it"}
            ]
        }
        ```
        
        Return only the JSON with no additional text.
        """
        super().__init__("Personalization Agent", prompt_template)


class CoordinatorAgent:
    """Agent that combines and prioritizes insights from specialized agents"""
    
    def __init__(self):
        self.prompt_template = """
        You are the Coordinator Agent for a fine dining restaurant's morning huddle system. Your job is to combine and prioritize insights from specialized agents into a cohesive briefing.
        
        Diner Information:
        {diner_info}
        
        Upcoming Reservation:
        {reservation_info}
        
        Specialized Agent Insights:
        
        Dietary Analysis:
        {dietary_analysis}
        
        Guest Experience:
        {guest_experience}
        
        Special Requests:
        {special_requests}
        
        Personalization:
        {personalization}
        
        Create a consolidated briefing in the following JSON format:
        ```
        {
            "priority_alerts": [
                {"alert": "critical information", "category": "dietary/experience/request/personalization", "for": "kitchen/service/management"}
            ],
            "guest_profile": {
                "dining_style": "description of how they like to dine",
                "preferences": ["key preference 1", "key preference 2"],
                "avoid": ["what to avoid 1", "what to avoid 2"]
            },
            "service_recommendations": [
                {"recommendation": "specific action", "timing": "when in service", "owner": "who should do this"}
            ],
            "kitchen_notes": [
                {"note": "specific preparation detail", "dish": "affected dish"}
            ]
        }
        ```
        
        Prioritize information that is:
        1. Safety-critical (allergies, accessibility)
        2. Experience-enhancing (celebrations, personalization)
        3. Operationally important (timing, modifications)
        
        Return only the JSON with no additional text.
        """
    
    def coordinate(self, diner: Dict, reservation: Dict, agent_results: Dict) -> Dict:
        """Combine and prioritize insights from specialized agents"""
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


def process_reservation(diner: Dict, reservation: Dict) -> Dict:
    """Process a single reservation with all agents"""
    
    # Initialize agents
    dietary_agent = DietaryAnalysisAgent()
    experience_agent = GuestExperienceAgent()
    requests_agent = SpecialRequestsAgent()
    personalization_agent = PersonalizationAgent()
    coordinator = CoordinatorAgent()
    
    # Run specialized agents in parallel with more workers
    with ThreadPoolExecutor(max_workers=4) as executor:
        dietary_future = executor.submit(dietary_agent.analyze, diner, reservation)
        experience_future = executor.submit(experience_agent.analyze, diner, reservation)
        requests_future = executor.submit(requests_agent.analyze, diner, reservation)
        personalization_future = executor.submit(personalization_agent.analyze, diner, reservation)
        
        # Collect results
        agent_results = {
            "dietary_analysis": dietary_future.result(),
            "guest_experience": experience_future.result(),
            "special_requests": requests_future.result(),
            "personalization": personalization_future.result()
        }
    
    # Coordinate results
    coordinator_result = coordinator.coordinate(diner, reservation, agent_results)
    
    # Combine all results
    return {
        "agent_analysis": agent_results,
        "coordinator_summary": coordinator_result
    }


def augment_dataset(input_path: str, output_path: str, max_workers: int = 8):
    """Process the entire dataset and add agent analysis to each reservation"""
    
    # Resolve paths to be absolute if they're relative
    input_path = Path(input_path)
    if not input_path.is_absolute():
        input_path = data_dir / input_path
    
    output_path = Path(output_path)
    if not output_path.is_absolute():
        output_path = data_dir / output_path
    
    print(f"Loading data from: {input_path}")
    
    # Load data
    diners_list = DinersList.load_from_json(str(input_path))
    
    # Reset metrics
    token_usage.update({"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0})
    performance_metrics.update({"api_calls": 0, "total_api_time": 0, "max_api_time": 0, "min_api_time": float('inf')})
    
    # Collect all future reservations to process
    reservations_to_process = []
    for diner_idx, diner in enumerate(diners_list.diners):
        diner_dict = diner.dict()
        
        if diner.reservations:
            for res_idx, reservation in enumerate(diner.reservations):
                reservation_dict = reservation.dict()
                
                # Only process future reservations
                today = date.today()
                if reservation.date >= today:
                    reservations_to_process.append((diner_idx, res_idx, diner_dict, reservation_dict))
    
    print(f"Found {len(reservations_to_process)} future reservations to process")
    
    # Process reservations in parallel batches
    start_time = time.time()
    
    # Create a copy of the diners list for modification
    augmented_diners = [diner.dict() for diner in diners_list.diners]
    
    # Process reservations in parallel
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_reservation = {
            executor.submit(process_reservation, diner_dict, reservation_dict): (diner_idx, res_idx)
            for diner_idx, res_idx, diner_dict, reservation_dict in reservations_to_process
        }
        
        # Process results as they complete
        for i, future in enumerate(as_completed(future_to_reservation)):
            diner_idx, res_idx = future_to_reservation[future]
            diner_name = augmented_diners[diner_idx]["name"]
            reservation_date = augmented_diners[diner_idx]["reservations"][res_idx]["date"]
            
            try:
                analysis = future.result()
                augmented_diners[diner_idx]["reservations"][res_idx]["agent_analysis"] = analysis
                print(f"[{i+1}/{len(reservations_to_process)}] Processed reservation for {diner_name} on {reservation_date}")
            except Exception as e:
                print(f"Error processing reservation for {diner_name}: {e}")
    
    total_time = time.time() - start_time
    
    # Save augmented data
    print(f"Saving augmented data to: {output_path}")
    with open(output_path, "w") as f:
        json.dump({"diners": augmented_diners}, f, indent=2, default=str)
    
    # Print performance metrics
    print("\n===== Performance Metrics =====")
    print(f"Total processing time: {total_time:.2f} seconds")
    print(f"Reservations processed: {len(reservations_to_process)}")
    print(f"Average time per reservation: {total_time/max(1, len(reservations_to_process)):.2f} seconds")
    
    print("\n===== API Call Metrics =====")
    print(f"Total API calls: {performance_metrics['api_calls']}")
    avg_api_time = performance_metrics['total_api_time'] / max(1, performance_metrics['api_calls'])
    print(f"Average API call time: {avg_api_time:.2f} seconds")
    print(f"Min API call time: {performance_metrics['min_api_time']:.2f} seconds")
    print(f"Max API call time: {performance_metrics['max_api_time']:.2f} seconds")
    
    print("\n===== Token Usage =====")
    print(f"Prompt tokens: {token_usage['prompt_tokens']}")
    print(f"Completion tokens: {token_usage['completion_tokens']}")
    print(f"Total tokens: {token_usage['total_tokens']}")
    
    # Estimate cost (approximate based on GPT-4o pricing)
    prompt_cost = token_usage['prompt_tokens'] * 0.00001  # $0.01 per 1K tokens
    completion_cost = token_usage['completion_tokens'] * 0.00003  # $0.03 per 1K tokens
    total_cost = prompt_cost + completion_cost
    print(f"Estimated cost: ${total_cost:.2f}")
    
    print(f"Augmented dataset saved to {output_path}")
