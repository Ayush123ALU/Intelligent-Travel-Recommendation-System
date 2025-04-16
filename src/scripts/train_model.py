import pandas as pd
import numpy as np
import pickle
import json
import sys
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import NearestNeighbors

def debug_log(message, data=None):
    """Helper function to print debug information to stderr"""
    try:
        debug_info = {
            "message": message,
            "data": data
        }
        print(json.dumps(debug_info), file=sys.stderr)
    except Exception as e:
        print(f"Error in debug_log: {str(e)}", file=sys.stderr)

def create_destination_dataset():
    """Create a dataset of travel destinations with features"""
    debug_log("Creating destination dataset")
    
    destinations = [
        {"name": "Bali", "budget": 2000, "weather": "warm", "activity": "beach", "safety": 0.8, "popularity": 0.9, "language": 0.6, "cuisine": 0.9, "nightlife": 0.8},
        {"name": "Maldives", "budget": 4000, "weather": "warm", "activity": "beach", "safety": 0.9, "popularity": 0.8, "language": 0.7, "cuisine": 0.8, "nightlife": 0.6},
        {"name": "Phuket", "budget": 2500, "weather": "warm", "activity": "beach", "safety": 0.7, "popularity": 0.8, "language": 0.5, "cuisine": 0.9, "nightlife": 0.9},
        {"name": "Hawaii", "budget": 3500, "weather": "warm", "activity": "beach", "safety": 0.9, "popularity": 0.9, "language": 0.9, "cuisine": 0.8, "nightlife": 0.7},
        {"name": "Cancun", "budget": 3000, "weather": "warm", "activity": "beach", "safety": 0.7, "popularity": 0.9, "language": 0.6, "cuisine": 0.8, "nightlife": 0.9},
        {"name": "Miami", "budget": 3000, "weather": "warm", "activity": "beach", "safety": 0.8, "popularity": 0.9, "language": 0.9, "cuisine": 0.8, "nightlife": 0.9},
        
        {"name": "Paris", "budget": 3500, "weather": "mild", "activity": "culture", "safety": 0.8, "popularity": 1.0, "language": 0.6, "cuisine": 1.0, "nightlife": 0.9},
        {"name": "Rome", "budget": 3000, "weather": "mild", "activity": "culture", "safety": 0.7, "popularity": 0.9, "language": 0.5, "cuisine": 1.0, "nightlife": 0.8},
        {"name": "Kyoto", "budget": 3000, "weather": "mild", "activity": "culture", "safety": 0.9, "popularity": 0.8, "language": 0.4, "cuisine": 0.9, "nightlife": 0.7},
        {"name": "Barcelona", "budget": 2500, "weather": "warm", "activity": "culture", "safety": 0.8, "popularity": 0.9, "language": 0.6, "cuisine": 0.9, "nightlife": 1.0},
        {"name": "Istanbul", "budget": 2000, "weather": "mild", "activity": "culture", "safety": 0.7, "popularity": 0.8, "language": 0.4, "cuisine": 0.9, "nightlife": 0.8},
        {"name": "Vienna", "budget": 3000, "weather": "cool", "activity": "culture", "safety": 0.9, "popularity": 0.8, "language": 0.5, "cuisine": 0.8, "nightlife": 0.7},
        
        {"name": "Athens", "budget": 2500, "weather": "warm", "activity": "history", "safety": 0.7, "popularity": 0.8, "language": 0.5, "cuisine": 0.8, "nightlife": 0.7},
        {"name": "Cairo", "budget": 2000, "weather": "warm", "activity": "history", "safety": 0.6, "popularity": 0.8, "language": 0.4, "cuisine": 0.7, "nightlife": 0.6},
        {"name": "Jerusalem", "budget": 2500, "weather": "warm", "activity": "history", "safety": 0.7, "popularity": 0.8, "language": 0.5, "cuisine": 0.8, "nightlife": 0.6},
        {"name": "Petra", "budget": 2000, "weather": "warm", "activity": "history", "safety": 0.7, "popularity": 0.7, "language": 0.4, "cuisine": 0.7, "nightlife": 0.5},
        {"name": "Machu Picchu", "budget": 3000, "weather": "mild", "activity": "history", "safety": 0.7, "popularity": 0.9, "language": 0.4, "cuisine": 0.7, "nightlife": 0.5},
        {"name": "Angkor Wat", "budget": 2000, "weather": "warm", "activity": "history", "safety": 0.7, "popularity": 0.8, "language": 0.4, "cuisine": 0.8, "nightlife": 0.6},
        
        {"name": "Tokyo", "budget": 4000, "weather": "mild", "activity": "technology", "safety": 0.9, "popularity": 0.9, "language": 0.4, "cuisine": 0.9, "nightlife": 0.9},
        {"name": "Seoul", "budget": 3000, "weather": "cool", "activity": "technology", "safety": 0.9, "popularity": 0.8, "language": 0.4, "cuisine": 0.9, "nightlife": 0.9},
        {"name": "Singapore", "budget": 3500, "weather": "warm", "activity": "technology", "safety": 1.0, "popularity": 0.8, "language": 0.8, "cuisine": 0.9, "nightlife": 0.8},
        {"name": "San Francisco", "budget": 4000, "weather": "mild", "activity": "technology", "safety": 0.8, "popularity": 0.8, "language": 0.9, "cuisine": 0.9, "nightlife": 0.8},
        {"name": "Shenzhen", "budget": 2500, "weather": "warm", "activity": "technology", "safety": 0.8, "popularity": 0.7, "language": 0.3, "cuisine": 0.8, "nightlife": 0.8},
        {"name": "Bangalore", "budget": 1500, "weather": "warm", "activity": "technology", "safety": 0.7, "popularity": 0.7, "language": 0.7, "cuisine": 0.8, "nightlife": 0.7},
        
        {"name": "New York", "budget": 4000, "weather": "cool", "activity": "urban", "safety": 0.8, "popularity": 1.0, "language": 0.9, "cuisine": 1.0, "nightlife": 1.0},
        {"name": "London", "budget": 4000, "weather": "cool", "activity": "urban", "safety": 0.9, "popularity": 1.0, "language": 0.9, "cuisine": 0.9, "nightlife": 0.9},
        {"name": "Dubai", "budget": 4000, "weather": "warm", "activity": "urban", "safety": 0.9, "popularity": 0.9, "language": 0.8, "cuisine": 0.9, "nightlife": 0.8},
        {"name": "Hong Kong", "budget": 3500, "weather": "warm", "activity": "urban", "safety": 0.9, "popularity": 0.9, "language": 0.7, "cuisine": 0.9, "nightlife": 0.9},
        {"name": "Berlin", "budget": 2500, "weather": "cool", "activity": "urban", "safety": 0.9, "popularity": 0.8, "language": 0.6, "cuisine": 0.8, "nightlife": 1.0},
        {"name": "Madrid", "budget": 2500, "weather": "warm", "activity": "urban", "safety": 0.8, "popularity": 0.8, "language": 0.5, "cuisine": 0.9, "nightlife": 1.0}
    ]
    
    debug_log("Dataset created", {"destinations": len(destinations)})
    return destinations

def main():
    debug_log("Starting model training")
    
    destinations = create_destination_dataset()
    
    debug_log("Creating feature mappings")
    
    weather_map = {
        'cold': 0,
        'cool': 0.33,
        'mild': 0.66,
        'warm': 1
    }
    
    activity_map = {
        'beach': [1, 0, 0, 0, 0],
        'culture': [0, 1, 0, 0, 0],
        'history': [0, 0, 1, 0, 0],
        'technology': [0, 0, 0, 1, 0],
        'urban': [0, 0, 0, 0, 1]
    }
    
    debug_log("Setting up feature weights")
    
    X = []
    destination_names = []
    
    for dest in destinations:
        budget = dest['budget'] / 5000
        
        weather = weather_map[dest['weather']]
        
        activity = activity_map[dest['activity']]
        
        features = [
            budget,  
            weather,  
            *activity,  
            dest['safety'],  
            dest['popularity'],  
            dest['language'],  
            dest['cuisine'],  
            dest['nightlife'] 
        ]
        
        X.append(features)
        destination_names.append(dest['name'])
    
    X = np.array(X)
    
    debug_log("Training nearest neighbors model")
    
    model = NearestNeighbors(n_neighbors=8, metric='euclidean')
    model.fit(X)
    
    debug_log("Saving model and data")
    
    model_data = {
        'model': model,
        'scaler': MinMaxScaler(),  
        'destinations': destination_names,
        'features': X.tolist(),
        'weather_map': weather_map,
        'activity_map': activity_map
    }
    
    with open('model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    result = {
        "status": "success",
        "message": "Model trained and saved successfully",
        "destinations": len(destinations),
        "weather_options": list(weather_map.keys()),
        "activity_options": list(activity_map.keys())
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
