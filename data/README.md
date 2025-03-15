# Fine Dining Multi-Agent System

This system uses a collection of specialized AI agents to analyze restaurant diner data and provide personalized insights for upcoming reservations. The architecture follows a modular, multi-agent approach to generate comprehensive briefings for restaurant staff.

## Architecture Overview

The system is built around five specialized agents that work together:

1. **Dietary Analysis Agent**: Identifies allergies, dietary restrictions, and special preparation instructions
2. **Guest Experience Agent**: Analyzes past impressions, service preferences, and conversation topics
3. **Special Requests Agent**: Identifies explicit requests, service modifications, and time-sensitive needs
4. **Personalization Agent**: Suggests personalization opportunities, upsell opportunities, and recognition moments
5. **Coordinator Agent**: Combines and prioritizes insights from the specialized agents into a cohesive briefing

## Data Flow

1. The system loads diner data from a JSON file
2. For each upcoming reservation:
   - All specialized agents analyze the diner and reservation data in parallel
   - The Coordinator Agent combines and prioritizes the insights
   - The results are added to the reservation data
3. The augmented data is saved to a new JSON file

## Performance Metrics

The system tracks and reports:

- Total processing time
- API call metrics (count, average/min/max time)
- Token usage and estimated cost

## Key Components

- **Base Agent**: Provides common functionality for all agents
- **Specialized Agents**: Implement domain-specific analysis
- **Coordinator Agent**: Combines insights into a cohesive briefing
- **Processor**: Manages the workflow and parallel execution
- **Prompts**: Centralized location for all agent prompts

## File Structure

```
data/
├── augment.py                  # Main script to run the augmentation
├── scripts/
│   ├── __init__.py             # Package initialization
│   ├── load_data.py            # Data loading utilities
│   ├── agents/                 # Agent-related code
│   │   ├── __init__.py         # Exports main functions
│   │   ├── base.py             # Base agent class and utilities
│   │   ├── specialized.py      # Specialized agent implementations
│   │   ├── coordinator.py      # Coordinator agent
│   │   ├── processor.py        # Reservation processing logic
│   │   └── prompts.py          # All prompts in one place
```

## Optimization Opportunities

1. **Caching**: Implement caching for similar requests
2. **Prompt Optimization**: Reduce token usage by optimizing prompts
3. **Batch Processing**: Process similar reservations in batches
4. **Model Selection**: Use smaller models for simpler tasks
5. **Parallel Processing**: Increase worker count for faster processing
