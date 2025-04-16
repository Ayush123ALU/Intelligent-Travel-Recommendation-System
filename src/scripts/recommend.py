import sys
import json
import pickle
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import warnings
from sklearn.exceptions import DataConversionWarning
import os

warnings.filterwarnings('ignore', category=DataConversionWarning)

def debug_log(message, data=None):
    """Print debug information to stderr"""
    debug_info = {
        "type": "debug",
        "message": message,
        "data": data
    }
    print(json.dumps(debug_info), file=sys.stderr)

def error_response(message):
    """Return error response in JSON format"""
    return json.dumps({
        "error": message,
        "success": False
    })

def success_response(recommendations):
    """Return success response in JSON format"""
    return json.dumps({
        "success": True,
        "recommendations": recommendations
    })

def load_model():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'model.pkl')
        debug_log("Attempting to load model from: " + model_path)
        
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
            debug_log("Model loaded successfully", {
                "type": type(model_data).__name__,
                "keys": list(model_data.keys()) if isinstance(model_data, dict) else None
            })
            return model_data
    except FileNotFoundError:
        error_msg = "Model file not found at: " + str(model_path)
        debug_log("Error", {"error": error_msg})
        print(error_response(error_msg), file=sys.stdout)
        sys.exit(1)
    except Exception as e:
        error_msg = f"Error loading model: {str(e)}"
        debug_log("Error", {"error": error_msg})
        print(error_response(error_msg), file=sys.stdout)
        sys.exit(1)

def main():
    if len(sys.argv) != 4:
        print(error_response("Invalid number of arguments"), file=sys.stdout)
        sys.exit(1)

    try:
        budget = float(sys.argv[1])
        weather = sys.argv[2].lower()
        activity = sys.argv[3].lower()

        debug_log("Loading model", {
            "budget": budget,
            "weather": weather,
            "activity": activity
        })

        model_data = load_model()
        
        if not isinstance(model_data, dict):
            print(error_response("Invalid model format"), file=sys.stdout)
            sys.exit(1)

        model = model_data.get('model')
        scaler = model_data.get('scaler')
        destinations = model_data.get('destinations')
        features = model_data.get('features')
        weather_map = model_data.get('weather_map')
        activity_map = model_data.get('activity_map')

        if not all([model, destinations, features, weather_map, activity_map]):
            print(error_response("Missing required model components"), file=sys.stdout)
            sys.exit(1)

        debug_log("Creating input features")

        if weather not in weather_map:
            print(error_response(f"Invalid weather preference. Must be one of: {', '.join(weather_map.keys())}"), file=sys.stdout)
            sys.exit(1)

        if activity not in activity_map:
            print(error_response(f"Invalid activity preference. Must be one of: {', '.join(activity_map.keys())}"), file=sys.stdout)
            sys.exit(1)

        budget_scaled = budget / 5000  
        budget_scaled = min(max(budget_scaled, 0), 1)  

        input_features = np.array([
            budget_scaled,  
            weather_map[weather],  
            *activity_map[activity],  
            0.8,  
            0.8,  
            0.7,  
            0.8,  
            0.8   
        ])

        debug_log("Finding nearest neighbors", {
            "input_features": input_features.tolist()
        })

        distances, indices = model.kneighbors([input_features])
        
        recommendations = []
        for idx, distance in zip(indices[0], distances[0]):
            destination = destinations[idx]
            match_score = (1 - distance) * 100  
            
            dest_features = features[idx]
            
            recommendations.append({
                "destination": destination,
                "match_score": round(match_score, 1),
                "features": {
                    "budget": dest_features[0] * 5000,  # Convert back to actual budget
                    "weather": next(k for k, v in weather_map.items() if abs(v - dest_features[1]) < 0.2),
                    "activity": next(k for k, v in activity_map.items() if v == dest_features[2:7]),
                    "safety_score": round(dest_features[7] * 100, 1),
                    "popularity": round(dest_features[8] * 100, 1),
                    "language_barrier": round(dest_features[9] * 100, 1),
                    "cuisine_rating": round(dest_features[10] * 100, 1),
                    "nightlife": round(dest_features[11] * 100, 1)
                }
            })

        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        
        recommendations = recommendations[:5]

        debug_log("Generated recommendations", {
            "count": len(recommendations)
        })

        print(success_response(recommendations), file=sys.stdout)

    except ValueError as e:
        print(error_response(f"Invalid input: {str(e)}"), file=sys.stdout)
    except Exception as e:
        print(error_response(f"Unexpected error: {str(e)}"), file=sys.stdout)

if __name__ == "__main__":
    main()
