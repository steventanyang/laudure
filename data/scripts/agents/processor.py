"""
Reservation processing logic for the restaurant multi-agent system.
"""

import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path
from typing import Dict, List, Tuple, Any
import sys

from .specialized import (
    DietaryAnalysisAgent,
    GuestExperienceAgent,
    SpecialRequestsAgent,
    PersonalizationAgent
)
from .coordinator import CoordinatorAgent
from .base import reset_metrics, print_metrics

# Import the data models
try:
    sys.path.append(str(Path(__file__).parent.parent))
    from load_data import DinersList
except ImportError as e:
    print(f"Error importing load_data: {e}")
    sys.exit(1)

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
    """Process the entire dataset and add agent analysis to each reservation
    
    This function:
    1. Loads the diner data from the input file
    2. Identifies all future reservations that need processing
    3. Processes each reservation in parallel using ThreadPoolExecutor
    4. Updates the original data with the agent analysis results
    5. Saves the augmented data to the output file
    6. Reports performance metrics
    
    The parallelization happens at two levels:
    - Multiple reservations are processed concurrently (controlled by max_workers)
    - For each reservation, the specialized agents run in parallel
    
    Args:
        input_path: Path to the input JSON file
        output_path: Path to save the augmented JSON file
        max_workers: Maximum number of concurrent reservation processing tasks
    """
    
    # Resolve paths to be absolute if they're relative
    data_dir = Path(__file__).parent.parent.parent
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
    reset_metrics()
    
    # Collect all future reservations to process
    reservations_to_process = []
    for diner_idx, diner in enumerate(diners_list.diners):
        diner_dict = diner.dict()
        
        if diner.reservations:
            for res_idx, reservation in enumerate(diner.reservations):
                reservation_dict = reservation.dict()
                
                # TODO: Remove
                # test 3 reservations
                # today = date.today()
                # if reservation.date >= today:
                #     reservations_to_process.append((diner_idx, res_idx, diner_dict, reservation_dict))
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
    print_metrics(total_time, len(reservations_to_process))
    
    print(f"Augmented dataset saved to {output_path}") 