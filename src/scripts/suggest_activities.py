import sys
import json
import pickle
import numpy as np
from datetime import datetime

default_features = {
    'beach_score': 0.5,
    'culture_score': 0.5,
    'history_score': 0.5,
    'urban_score': 0.5,
    'tech_score': 0.5,
    'cost_level': 0.5
}

activities_db = {
    'beach': [
        {'name': 'Sunbathing and Swimming', 'duration': 3, 'best_time': 'morning', 'weather': ['mild', 'warm'], 'cost_factor': 0.1},
        {'name': 'Beach Volleyball', 'duration': 2, 'best_time': 'afternoon', 'weather': ['mild', 'warm'], 'cost_factor': 0.1},
        {'name': 'Surfing Lessons', 'duration': 2, 'best_time': 'morning', 'weather': ['mild', 'warm'], 'cost_factor': 0.3},
        {'name': 'Beachcombing', 'duration': 1, 'best_time': 'morning', 'weather': ['cool', 'mild', 'warm'], 'cost_factor': 0.1},
        {'name': 'Sunset Beach Picnic', 'duration': 2, 'best_time': 'evening', 'weather': ['cool', 'mild', 'warm'], 'cost_factor': 0.2},
        {'name': 'Snorkeling Tour', 'duration': 3, 'best_time': 'morning', 'weather': ['mild', 'warm'], 'cost_factor': 0.4},
        {'name': 'Beach Yoga Session', 'duration': 1, 'best_time': 'morning', 'weather': ['cool', 'mild', 'warm'], 'cost_factor': 0.2}
    ],
    'culture': [
        {'name': 'Museum Visit', 'duration': 3, 'best_time': 'morning', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.2},
        {'name': 'Local Art Gallery Tour', 'duration': 2, 'best_time': 'afternoon', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.2},
        {'name': 'Cultural Workshop', 'duration': 2, 'best_time': 'afternoon', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.3},
        {'name': 'Historical Walking Tour', 'duration': 2, 'best_time': 'morning', 'weather': ['cool', 'mild'], 'cost_factor': 0.2},
        {'name': 'Local Food Tasting', 'duration': 2, 'best_time': 'evening', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.3},
        {'name': 'Traditional Dance Show', 'duration': 2, 'best_time': 'evening', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.3},
        {'name': 'Cooking Class', 'duration': 3, 'best_time': 'afternoon', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.4}
    ],
    'history': [
        {'name': 'Ancient Ruins Tour', 'duration': 3, 'best_time': 'morning', 'weather': ['cool', 'mild'], 'cost_factor': 0.3},
        {'name': 'Castle/Palace Visit', 'duration': 3, 'best_time': 'morning', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.3},
        {'name': 'Historical Museum', 'duration': 2, 'best_time': 'afternoon', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.2},
        {'name': 'Guided Heritage Walk', 'duration': 2, 'best_time': 'morning', 'weather': ['cool', 'mild'], 'cost_factor': 0.2},
        {'name': 'Historical Reenactment', 'duration': 2, 'best_time': 'afternoon', 'weather': ['cool', 'mild', 'warm'], 'cost_factor': 0.3},
        {'name': 'Archaeological Site Visit', 'duration': 4, 'best_time': 'morning', 'weather': ['cool', 'mild'], 'cost_factor': 0.4},
        {'name': 'Religious Site Tour', 'duration': 2, 'best_time': 'morning', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.2}
    ],
    'urban': [
        {'name': 'City Sightseeing', 'duration': 3, 'best_time': 'morning', 'weather': ['cool', 'mild'], 'cost_factor': 0.2},
        {'name': 'Shopping District Visit', 'duration': 3, 'best_time': 'afternoon', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.4},
        {'name': 'Rooftop Bar Experience', 'duration': 2, 'best_time': 'evening', 'weather': ['mild', 'warm'], 'cost_factor': 0.4},
        {'name': 'Street Food Tour', 'duration': 2, 'best_time': 'evening', 'weather': ['cool', 'mild', 'warm'], 'cost_factor': 0.2},
        {'name': 'Urban Photography Tour', 'duration': 2, 'best_time': 'morning', 'weather': ['cool', 'mild'], 'cost_factor': 0.2},
        {'name': 'City Park Picnic', 'duration': 2, 'best_time': 'afternoon', 'weather': ['mild', 'warm'], 'cost_factor': 0.1},
        {'name': 'Local Market Visit', 'duration': 2, 'best_time': 'morning', 'weather': ['cool', 'mild', 'warm'], 'cost_factor': 0.2}
    ],
    'technology': [
        {'name': 'Science Museum Visit', 'duration': 3, 'best_time': 'morning', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.2},
        {'name': 'Tech Hub Tour', 'duration': 2, 'best_time': 'afternoon', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.3},
        {'name': 'Innovation Center', 'duration': 2, 'best_time': 'afternoon', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.3},
        {'name': 'VR Gaming Experience', 'duration': 2, 'best_time': 'afternoon', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.4},
        {'name': 'Tech Workshop', 'duration': 2, 'best_time': 'morning', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.3},
        {'name': 'Digital Art Gallery', 'duration': 2, 'best_time': 'afternoon', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.2},
        {'name': 'Robotics Exhibition', 'duration': 2, 'best_time': 'morning', 'weather': ['cold', 'cool', 'mild', 'warm'], 'cost_factor': 0.3}
    ]
}

destination_features = {
    'beach_destinations': {
        'Hawaii': {'beach': 0.9, 'culture': 0.7, 'history': 0.5, 'urban': 0.4, 'tech': 0.3},
        'Maldives': {'beach': 0.95, 'culture': 0.6, 'history': 0.3, 'urban': 0.2, 'tech': 0.2},
        'Bali': {'beach': 0.8, 'culture': 0.8, 'history': 0.7, 'urban': 0.5, 'tech': 0.3},
        'Phuket': {'beach': 0.85, 'culture': 0.7, 'history': 0.5, 'urban': 0.6, 'tech': 0.3},
        'Cancun': {'beach': 0.9, 'culture': 0.6, 'history': 0.4, 'urban': 0.5, 'tech': 0.2},
        'Miami': {'beach': 0.8, 'culture': 0.7, 'history': 0.4, 'urban': 0.8, 'tech': 0.6},
        'Barcelona': {'beach': 0.7, 'culture': 0.9, 'history': 0.8, 'urban': 0.8, 'tech': 0.7}
    },
    'cultural_destinations': {
        'Paris': {'beach': 0.2, 'culture': 0.9, 'history': 0.9, 'urban': 0.9, 'tech': 0.7},
        'Rome': {'beach': 0.3, 'culture': 0.95, 'history': 0.95, 'urban': 0.8, 'tech': 0.6},
        'Kyoto': {'beach': 0.1, 'culture': 0.9, 'history': 0.9, 'urban': 0.7, 'tech': 0.8},
        'Istanbul': {'beach': 0.4, 'culture': 0.9, 'history': 0.9, 'urban': 0.8, 'tech': 0.6},
        'Athens': {'beach': 0.6, 'culture': 0.9, 'history': 0.95, 'urban': 0.7, 'tech': 0.5},
        'Vienna': {'beach': 0.1, 'culture': 0.9, 'history': 0.9, 'urban': 0.8, 'tech': 0.7},
        'Prague': {'beach': 0.1, 'culture': 0.85, 'history': 0.9, 'urban': 0.8, 'tech': 0.6}
    },
    'urban_destinations': {
        'New York': {'beach': 0.3, 'culture': 0.8, 'history': 0.7, 'urban': 0.95, 'tech': 0.8},
        'Tokyo': {'beach': 0.2, 'culture': 0.8, 'history': 0.7, 'urban': 0.95, 'tech': 0.95},
        'London': {'beach': 0.1, 'culture': 0.9, 'history': 0.9, 'urban': 0.9, 'tech': 0.8},
        'Dubai': {'beach': 0.7, 'culture': 0.7, 'history': 0.5, 'urban': 0.95, 'tech': 0.9},
        'Singapore': {'beach': 0.6, 'culture': 0.8, 'history': 0.7, 'urban': 0.95, 'tech': 0.9},
        'Seoul': {'beach': 0.3, 'culture': 0.8, 'history': 0.8, 'urban': 0.9, 'tech': 0.9},
        'San Francisco': {'beach': 0.6, 'culture': 0.8, 'history': 0.6, 'urban': 0.9, 'tech': 0.95}
    },
    'nature_destinations': {
        'Queenstown': {'beach': 0.5, 'culture': 0.6, 'history': 0.4, 'urban': 0.5, 'tech': 0.3},
        'Banff': {'beach': 0.2, 'culture': 0.5, 'history': 0.4, 'urban': 0.4, 'tech': 0.3},
        'Swiss Alps': {'beach': 0.1, 'culture': 0.7, 'history': 0.6, 'urban': 0.5, 'tech': 0.4},
        'Costa Rica': {'beach': 0.8, 'culture': 0.6, 'history': 0.4, 'urban': 0.3, 'tech': 0.2}
    }
}

def get_destination_features(destination):
    """Get destination features from model or fallback to pre-defined features"""
    try:
        if 'model_data' in globals():
            model_features = model_data['destination_features'].get(destination)
            if model_features is not None:
                return model_features
        
        for category in destination_features.values():
            if destination in category:
                return category[destination]
        
        features = default_features.copy()
        dest_lower = destination.lower()
        
        if any(word in dest_lower for word in ['beach', 'coast', 'island', 'bay', 'playa', 'mar', 'sea']):
            features['beach_score'] = 0.8
            features['urban_score'] = 0.4
        
        if any(word in dest_lower for word in ['historic', 'ancient', 'old', 'temple', 'palace', 'castle']):
            features['history_score'] = 0.8
            features['culture_score'] = 0.7
        
        if any(word in dest_lower for word in ['city', 'metro', 'town', 'ville', 'burg', 'port']):
            features['urban_score'] = 0.8
            features['tech_score'] = 0.6
        
        if any(word in dest_lower for word in ['silicon', 'tech', 'digital', 'smart']):
            features['tech_score'] = 0.8
            features['urban_score'] = 0.7
        
        if any(word in dest_lower for word in ['mountain', 'forest', 'lake', 'park', 'nature']):
            features['beach_score'] = 0.4 if features['beach_score'] < 0.4 else features['beach_score']
            features['urban_score'] = 0.3
            features['tech_score'] = 0.2
        
        return features
        
    except Exception as e:
        print(f"Error getting destination features: {str(e)}", file=sys.stderr)
        return default_features

def get_activity_score(activity, weather, time_of_day, destination_features):
    """Calculate activity score based on multiple factors"""
    try:
        weather_score = 1.0 if weather in activity['weather'] else 0.5
        time_score = 1.0 if activity['best_time'] == time_of_day else 0.7
        
        dest_score = destination_features.get(activity['best_time'], 0.5)
        
        final_score = (weather_score * 0.4 + time_score * 0.3 + dest_score * 0.3)
        
        return round(final_score, 2)
    except Exception as e:
        print(f"Error calculating activity score: {str(e)}", file=sys.stderr)
        return 0.5

def suggest_activities(destination, weather, activity_type, budget):
    try:
        dest_features = get_destination_features(destination)
        
        base_activities = activities_db.get(activity_type, [])
        if not base_activities:
            return [{"error": f"No activities found for type: {activity_type}"}]
        
        hour = datetime.now().hour
        time_of_day = 'morning' if 5 <= hour < 12 else 'afternoon' if 12 <= hour < 17 else 'evening'
        
        scored_activities = []
        daily_budget = budget / 7  
        
        for activity in base_activities:
            try:
                score = get_activity_score(activity, weather, time_of_day, dest_features)
                
                base_cost = daily_budget * activity['cost_factor']
                dest_cost_multiplier = dest_features.get('cost_level', 1.0)
                estimated_cost = round(base_cost * dest_cost_multiplier, 2)
                
                activity_copy = activity.copy()
                activity_copy['destination_specific'] = f"{activity['name']} in {destination}"
                activity_copy['score'] = score
                activity_copy['estimated_cost'] = estimated_cost
                scored_activities.append(activity_copy)
            except Exception as e:
                print(f"Error processing activity {activity['name']}: {str(e)}", file=sys.stderr)
                continue
        
        scored_activities.sort(key=lambda x: x['score'], reverse=True)
        return scored_activities[:5]
        
    except Exception as e:
        return [{"error": str(e)}]

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print(json.dumps({"error": "Invalid arguments"}))
        sys.exit(1)
    
    try:
        destination = sys.argv[1]
        weather = sys.argv[2]
        activity_type = sys.argv[3]
        budget = float(sys.argv[4])
        
        suggestions = suggest_activities(destination, weather, activity_type, budget)
        print(json.dumps({"suggestions": suggestions}))
    except Exception as e:
        print(json.dumps({"error": str(e)})) 