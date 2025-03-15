import os
import sys
from datetime import date
import json
from pathlib import Path
from dotenv import load_dotenv
import argparse

# Get the current directory and add paths
current_dir = Path(__file__).parent
project_root = current_dir.parent
scripts_dir = current_dir / "scripts"

# Load environment variables from .env file
load_dotenv(current_dir / ".env")

# Add paths to sys.path
sys.path.append(str(project_root))
sys.path.append(str(current_dir))
sys.path.append(str(scripts_dir))

# Import the augment_dataset function
try:
    from scripts.agents import augment_dataset
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

def main():
    """Run the data augmentation process"""
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Augment fine dining dataset with agent analysis")
    parser.add_argument("--workers", type=int, default=8, help="Number of worker threads (default: 8)")
    parser.add_argument("--input", type=str, default=None, help="Input file path (default: augmented-fine-dining-dataset.json)")
    parser.add_argument("--output", type=str, default=None, help="Output file path (default: agent-augmented-fine-dining-dataset.json)")
    args = parser.parse_args()
    
    # Check for OpenAI API key
    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable not set")
        print("Please set your OpenAI API key with:")
        print("export OPENAI_API_KEY=your_api_key_here")
        sys.exit(1)
    
    # Define input and output paths
    input_path = args.input if args.input else current_dir / "augmented-fine-dining-dataset.json"
    output_path = args.output if args.output else current_dir / "agent-augmented-fine-dining-dataset.json"
    
    # Run augmentation
    print(f"Starting augmentation process with {args.workers} workers...")
    print(f"Input: {input_path}")
    print(f"Output: {output_path}")
    
    try:
        augment_dataset(str(input_path), str(output_path), max_workers=args.workers)
        print("Augmentation completed successfully!")
    except Exception as e:
        print(f"Error during augmentation: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()