"""
Base agent class and utility functions for the restaurant multi-agent system.
"""

import json
import time
import threading
import random
import os
from typing import Dict, Any, List
from openai import OpenAI, RateLimitError, APIError
import backoff

# Global lock for key rotation
key_lock = threading.Lock()

# Load all available API keys
API_KEYS = [
    os.environ.get("OPENAI_API_KEY"),
    os.environ.get("OPENAI_API_KEY2"),
    os.environ.get("OPENAI_API_KEY3")
]
# Filter out None or empty values
API_KEYS = [key for key in API_KEYS if key]

if not API_KEYS:
    raise ValueError("No valid OpenAI API keys found in environment variables")

# Current key index
current_key_index = 0

# Initialize the OpenAI client with the first key
client = OpenAI(api_key=API_KEYS[current_key_index])

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
    "api_errors": 0,
    "api_retries": 0,
    "total_api_time": 0,
    "max_api_time": 0,
    "min_api_time": float('inf')
}
metrics_lock = threading.Lock()

def rotate_api_key():
    """Rotate to next available API key"""
    global current_key_index, client
    with key_lock:
        current_key_index = (current_key_index + 1) % len(API_KEYS)
        client = OpenAI(api_key=API_KEYS[current_key_index])
        print(f"Rotated to API key {current_key_index + 1}/{len(API_KEYS)}")

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

def increment_error_count():
    """Increment the API error counter"""
    with metrics_lock:
        performance_metrics["api_errors"] += 1

def increment_retry_count():
    """Increment the API retry counter"""
    with metrics_lock:
        performance_metrics["api_retries"] += 1

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

def reset_metrics():
    """Reset all metrics counters"""
    with token_lock:
        token_usage.update({"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0})
    
    with metrics_lock:
        performance_metrics.update({
            "api_calls": 0,
            "api_errors": 0,
            "api_retries": 0,
            "total_api_time": 0, 
            "max_api_time": 0, 
            "min_api_time": float('inf')
        })

def print_metrics(total_time, num_reservations):
    """Print performance metrics"""
    print("\n===== Performance Metrics =====")
    print(f"Total processing time: {total_time:.2f} seconds")
    print(f"Reservations processed: {num_reservations}")
    print(f"Average time per reservation: {total_time/max(1, num_reservations):.2f} seconds")
    
    print("\n===== API Call Metrics =====")
    print(f"Total API calls: {performance_metrics['api_calls']}")
    print(f"API errors: {performance_metrics['api_errors']}")
    print(f"API retries: {performance_metrics['api_retries']}")
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

# Define a backoff handler for API calls
def backoff_handler(details):
    """Handler that executes when a retry or giveup event occurs"""
    fail_msg = f"API call failed after {details['tries']} tries"
    if details.get('exception'):
        fail_msg += f": {details['exception']}"
    
    increment_retry_count()
    print(f"Retrying API call (attempt {details['tries']})")
    
    # Rotate to next API key
    rotate_api_key()

# Define conditions for retrying
def retry_if_rate_limit_or_api_error(exception):
    """Return True if we should retry, False otherwise"""
    if isinstance(exception, (RateLimitError, APIError)):
        return True
    return False

class BaseAgent:
    """Base class for all specialized agents"""
    
    def __init__(self, name: str, prompt_template: str):
        self.name = name
        self.prompt_template = prompt_template
    
    @backoff.on_exception(
        backoff.expo, 
        (RateLimitError, APIError),
        max_tries=10,  # Maximum number of attempts
        on_backoff=backoff_handler,
        jitter=backoff.full_jitter,  # Add randomness to the backoff
        factor=1.5  # Multiply the base backoff by this factor
    )
    def _call_api(self, messages, temperature=0):
        """Make an API call with automatic retry logic"""
        start_time = time.time()
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=temperature
            )
            api_time = time.time() - start_time
            
            # Update metrics
            update_token_usage(response.usage)
            update_performance_metrics(api_time)
            
            return response
        except Exception as e:
            increment_error_count()
            raise
    
    def analyze(self, diner: Dict, reservation: Dict) -> Dict:
        """Run analysis on diner and reservation data
        
        This method:
        1. Escapes curly braces in the prompt template to avoid string formatting conflicts
        2. Restores only the specific placeholders needed for formatting
        3. Makes an API call to the LLM with the formatted prompt
        4. Tracks token usage and performance metrics
        5. Cleans and parses the JSON response
        
        Args:
            diner: Dictionary containing diner information
            reservation: Dictionary containing reservation information
            
        Returns:
            Dictionary containing the agent's analysis or error information
        """
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
            messages = [
                {"role": "system", "content": "You are a specialized agent for a restaurant. Return only valid JSON without markdown formatting or code blocks."},
                {"role": "user", "content": prompt}
            ]
            
            response = self._call_api(messages)
            
            result = response.choices[0].message.content
            
            # Clean the response to extract valid JSON
            cleaned_result = clean_json_response(result)
            
            return json.loads(cleaned_result)
        except json.JSONDecodeError:
            # Fallback if the model doesn't return valid JSON
            return {"error": "Failed to parse agent output", "raw_output": result}
        except Exception as e:
            return {"error": f"API error: {str(e)}"} 