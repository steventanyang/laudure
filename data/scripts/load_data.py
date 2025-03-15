from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date, datetime
import json
import os
from pathlib import Path

class Review(BaseModel):
    restaurant_name: str
    date: date
    rating: int = Field(..., ge=1, le=5)
    content: str

class Order(BaseModel):
    item: str
    dietary_tags: List[str]
    price: float

class Reservation(BaseModel):
    date: date
    number_of_people: int
    orders: List[Order]
    time: Optional[str] = "19:00"  # Default time if not provided
    agent_analysis: Optional[dict] = None

class Email(BaseModel):
    date: date
    subject: str
    combined_thread: str

class Diner(BaseModel):
    name: str
    reviews: Optional[List[Review]] = None
    reservations: Optional[List[Reservation]] = None
    emails: Optional[List[Email]] = None

class DinersList(BaseModel):
    diners: List[Diner]

    @classmethod
    def load_from_json(cls, json_path: str) -> "DinersList":
        """Load diners data from a JSON file
        
        This method:
        1. Reads the JSON file
        2. Converts string dates to datetime.date objects
        3. Ensures all required fields exist (adding defaults if needed)
        4. Validates the data against the Pydantic models
        
        The date conversion is necessary because JSON doesn't have a native date type.
        The method also handles missing 'time' fields in reservations by adding a default value.
        
        Args:
            json_path: Path to the JSON file containing diner data
            
        Returns:
            A validated DinersList object
        """
        print(f"Loading data from: {json_path}")
        
        with open(json_path) as f:
            data = json.load(f)
            
        # Convert date strings to date objects and ensure all required fields exist
        for diner in data["diners"]:
            if diner.get("reviews"):
                for review in diner["reviews"]:
                    if isinstance(review["date"], str):
                        review["date"] = datetime.strptime(review["date"], "%Y-%m-%d").date()
            
            if diner.get("reservations"):
                for reservation in diner["reservations"]:
                    if isinstance(reservation["date"], str):
                        reservation["date"] = datetime.strptime(reservation["date"], "%Y-%m-%d").date()
                    
                    # Add default time if missing
                    if "time" not in reservation:
                        reservation["time"] = "19:00"
            
            if diner.get("emails"):
                for email in diner["emails"]:
                    if isinstance(email["date"], str):
                        email["date"] = datetime.strptime(email["date"], "%Y-%m-%d").date()

        return cls(**data)
    
    def save_to_json(self, json_path: str):
        """Save the diners list to a JSON file"""
        with open(json_path, "w") as f:
            json.dump(self.dict(), f, indent=2, default=str)
        
        print(f"Data saved to: {json_path}")
    
if __name__ == "__main__":
    # Test loading
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent
    
    try:
        diners_list = DinersList.load_from_json(str(data_dir / "augmented-fine-dining-dataset.json"))
        print(f"Successfully loaded {len(diners_list.diners)} diners")
    except Exception as e:
        print(f"Error loading data: {e}")    