import { useState } from "react";
import axios from "axios";
import { generateRecommendationsPDF } from "@/utils/generatePDF";

interface Recommendation {
  destination: string;
  match_score: number;
  features: {
    budget: number;
    weather: string;
    activity: string;
    safety_score: number;
    popularity: number;
    language_barrier: number;
    cuisine_rating: number;
    nightlife: number;
  };
}

interface Activity {
  day: number;
  time: string;
  activity: string;
  notes: string;
}

interface Plan {
  destination: string;
  activities: Activity[];
  budget: {
    accommodation: number;
    activities: number;
    food: number;
    transportation: number;
    misc: number;
  };
  notes: string;
}

interface TravelPlannerProps {
  recommendations: Recommendation[];
  budget: number;
  weather: string;
  activity: string;
}

interface ActivitySuggestion {
  name: string;
  duration: string;
  best_time: string;
  destination_specific: string;
  estimated_cost: number;
  score: number;
}

const activityTypes = [
  { value: "beach", label: "🏖️ Beach & Water", icon: "🏖️" },
  { value: "culture", label: "🏛️ Culture & Arts", icon: "🏛️" },
  { value: "history", label: "🏰 History & Heritage", icon: "🏰" },
  { value: "urban", label: "🌆 Urban & City Life", icon: "🌆" },
  { value: "technology", label: "🔬 Science & Tech", icon: "🔬" },
];

const weatherTypes = [
  { value: "cold", label: "❄️ Cold (Below 10°C)", icon: "❄️" },
  { value: "cool", label: "🌥️ Cool (10-18°C)", icon: "🌥️" },
  { value: "mild", label: "☀️ Mild (18-25°C)", icon: "☀️" },
  { value: "warm", label: "🌡️ Warm (Above 25°C)", icon: "🌡️" },
];

export default function TravelPlanner({
  recommendations,
  budget,
  weather,
  activity,
}: TravelPlannerProps) {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<Activity>({
    day: 1,
    time: "",
    activity: "",
    notes: "",
  });
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchSuggestions = async (destination: string) => {
    try {
      setLoadingSuggestions(true);
      const response = await axios.post("/api/suggest-activities", {
        destination,
        weather,
        activity_type: activity,
        budget,
      });
      if (response.data.suggestions && !response.data.suggestions.error) {
        setSuggestions(response.data.suggestions);
      } else {
        console.error(
          "Error in suggestions:",
          response.data.suggestions?.error
        );
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const initializeNewPlan = (destination: string) => {
    setCurrentPlan({
      destination,
      activities: [],
      budget: {
        accommodation: Math.round(budget * 0.4),
        activities: Math.round(budget * 0.3),
        food: Math.round(budget * 0.2),
        transportation: Math.round(budget * 0.1),
        misc: 0,
      },
      notes: "",
    });
    fetchSuggestions(destination);
  };

  const addActivity = (activity: Activity) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      activities: [...currentPlan.activities, activity].sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.time.localeCompare(b.time);
      }),
    });
  };

  const handleDownloadPDF = () => {
    if (!currentPlan) return;

    const selectedDestination = recommendations.find(
      (r) => r.destination === currentPlan.destination
    );
    if (!selectedDestination) return;

    const doc = generateRecommendationsPDF(
      [selectedDestination],
      { budget, weather, activity },
      currentPlan
    );
    doc.save(`${currentPlan.destination.toLowerCase()}-travel-plan.pdf`);
  };

  if (!recommendations.length) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Travel Planning Assistant
      </h2>
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {!currentPlan ? (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Select a destination to start planning
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.destination}
                  className="p-6 border rounded-lg hover:border-indigo-500 cursor-pointer transition-all"
                  onClick={() => initializeNewPlan(rec.destination)}
                >
                  <h4 className="text-lg font-semibold text-gray-800">
                    {rec.destination}
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Click to start planning your trip to {rec.destination}
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Match Score:</span>
                      <span className="font-medium">
                        {rec.match_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Budget:</span>
                      <span className="font-medium">
                        ${rec.features.budget}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                Planning Trip to {currentPlan.destination}
              </h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentPlan(null)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Download PDF
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-4">
                Budget Allocation
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(currentPlan.budget).map(
                  ([category, amount]) => (
                    <div key={category} className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-600 capitalize">
                        {category}
                      </div>
                      <div className="text-lg font-semibold text-gray-800">
                        ${amount}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round((amount / budget) * 100)}% of total
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {loadingSuggestions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  Loading activity suggestions...
                </p>
              </div>
            ) : suggestions.length > 0 ? (
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">
                  Suggested Activities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:border-indigo-500 transition-all"
                    >
                      <h5 className="font-semibold text-gray-800">
                        {suggestion.destination_specific}
                      </h5>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>Duration: {suggestion.duration}</p>
                        <p>Best Time: {suggestion.best_time}</p>
                        <p>Estimated Cost: ${suggestion.estimated_cost}</p>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                          {Math.round(suggestion.score * 100)}% match
                        </span>
                        <button
                          onClick={() => {
                            setNewActivity({
                              day: 1,
                              time: suggestion.best_time,
                              activity: suggestion.destination_specific,
                              notes: `Duration: ${suggestion.duration}, Cost: $${suggestion.estimated_cost}`,
                            });
                            setIsAddingActivity(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Add to Plan →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-800">
                  Planned Activities
                </h4>
                <button
                  onClick={() => setIsAddingActivity(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Activity
                </button>
              </div>

              {currentPlan.activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No activities planned yet. Start by adding some activities to
                  your itinerary.
                </p>
              ) : (
                <div className="space-y-4">
                  {Array.from(
                    {
                      length: Math.max(
                        ...currentPlan.activities.map((a) => a.day),
                        1
                      ),
                    },
                    (_, i) => i + 1
                  ).map((day) => {
                    const dayActivities = currentPlan.activities.filter(
                      (a) => a.day === day
                    );
                    return (
                      <div key={day} className="border rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-3">
                          Day {day}
                        </h5>
                        <div className="space-y-3">
                          {dayActivities.map((activity, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {activity.time} - {activity.activity}
                                </p>
                                {activity.notes && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {activity.notes}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setCurrentPlan({
                                    ...currentPlan,
                                    activities: currentPlan.activities.filter(
                                      (_, i) => i !== index
                                    ),
                                  });
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Trip Notes</h4>
              <textarea
                value={currentPlan.notes}
                onChange={(e) =>
                  setCurrentPlan({ ...currentPlan, notes: e.target.value })
                }
                className="w-full h-32 p-4 border rounded-lg"
                placeholder="Add any general notes about your trip..."
              />
            </div>
          </div>
        )}
      </div>

      {isAddingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Add Activity
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Day
                </label>
                <input
                  type="number"
                  min="1"
                  value={newActivity.day}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      day: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="text"
                  value={newActivity.time}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, time: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., 09:00 AM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Activity
                </label>
                <input
                  type="text"
                  value={newActivity.activity}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, activity: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={newActivity.notes}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, notes: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAddingActivity(false);
                    setNewActivity({
                      day: 1,
                      time: "",
                      activity: "",
                      notes: "",
                    });
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    addActivity(newActivity);
                    setIsAddingActivity(false);
                    setNewActivity({
                      day: 1,
                      time: "",
                      activity: "",
                      notes: "",
                    });
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
