"use client";
import { useState } from "react";
import fetchRecommendations from "@/utils/fetchRecommendations";
import { generateRecommendationsPDF } from "@/utils/generatePDF";
import TravelPlanner from "./components/TravelPlanner";

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

export default function Home() {
  const [budget, setBudget] = useState<number>(2000);
  const [weather, setWeather] = useState<string>("warm");
  const [activity, setActivity] = useState<string>("beach");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ budget, weather, activity }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get recommendations"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (recommendations.length === 0) return;

    const doc = generateRecommendationsPDF(recommendations, {
      budget,
      weather,
      activity,
    });
    doc.save("travel-recommendations.pdf");
  };

  const weatherOptions = [
    { value: "cold", label: "❄️ Cold", description: "Below 10°C / 50°F" },
    { value: "cool", label: "🌥️ Cool", description: "10-18°C / 50-65°F" },
    { value: "mild", label: "☀️ Mild", description: "18-25°C / 65-77°F" },
    { value: "warm", label: "🌡️ Warm", description: "Above 25°C / 77°F" },
  ];

  const activityOptions = [
    { value: "beach", icon: "🏖️", description: "Relax by the sea" },
    {
      value: "culture",
      icon: "🏛️",
      description: "Museums and local traditions",
    },
    {
      value: "history",
      icon: "🏰",
      description: "Historical sites and architecture",
    },
    {
      value: "technology",
      icon: "🔬",
      description: "Innovation and science hubs",
    },
    {
      value: "urban",
      icon: "🏙️",
      description: "City exploration and nightlife",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
      <header className="bg-gradient-to-r from-indigo-800 via-blue-700 to-indigo-800 text-white py-6 shadow-lg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">TravelSense</h1>
              <p className="text-indigo-200 mt-1">
                Intelligent Travel Recommendation System
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm font-medium bg-white/10 px-4 py-1 rounded-full">
                Final Year Project - 2025
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-indigo-900 mb-4">
            Personalized Travel Recommendations
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            This intelligent system uses machine learning algorithms to analyze
            your preferences and suggest optimal travel destinations based on
            your budget, weather preferences, and activity interests.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </span>
            Configure Parameters
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Budget Allocation
              </label>
              <p className="text-xs text-gray-500">
                Maximum amount for your travel expenses
              </p>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  className="block w-full pl-8 pr-12 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  min="0"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  {budget <= 1000
                    ? "Budget"
                    : budget <= 3000
                    ? "Standard"
                    : "Luxury"}{" "}
                  Range
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Climate Preference
              </label>
              <p className="text-xs text-gray-500">
                Ideal temperature range for your destination
              </p>
              <select
                className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                required
              >
                {weatherOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-2 mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Primary Activity Interest
              </label>
              <p className="text-xs text-gray-500">
                Main type of experience you're seeking
              </p>
              <input type="hidden" value={activity} required />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                {activityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActivity(option.value)}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-lg border transition-all
                      ${
                        activity === option.value
                          ? "bg-indigo-600 text-white border-transparent shadow-md"
                          : "border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50"
                      }
                    `}
                  >
                    <span className="text-2xl mb-2">{option.icon}</span>
                    <span className="font-medium">
                      {option.value.charAt(0).toUpperCase() +
                        option.value.slice(1)}
                    </span>
                    <span
                      className={`text-xs mt-1 ${
                        activity === option.value
                          ? "text-indigo-100"
                          : "text-gray-500"
                      }`}
                    >
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`
                px-8 py-4 rounded-lg text-white font-medium text-lg
                transition-all transform hover:scale-105 hover:shadow-lg
                flex items-center space-x-2 
                ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800"
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              `}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing Algorithm...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Generate Recommendations</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {recommendations.length > 0 && (
          <section className="transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="bg-green-100 text-green-700 p-2 rounded-lg mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                Algorithm Results
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {recommendations.length} destinations found
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Recommendations
                </h3>
                <button
                  onClick={handleDownloadPDF}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Download PDF
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {recommendations.map((rec) => (
                  <div
                    key={rec.destination}
                    className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-md overflow-hidden border border-indigo-100 transform transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="h-48 bg-indigo-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl">
                          {activity === "beach"
                            ? "🏖️"
                            : activity === "culture"
                            ? "🏛️"
                            : activity === "history"
                            ? "🏰"
                            : activity === "technology"
                            ? "🔬"
                            : "🏙️"}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 text-xs font-medium text-indigo-700 px-2 py-1 rounded-full">
                        Match Score: {rec.match_score.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-bold text-gray-800">
                          {rec.destination}
                        </h4>
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                          {weather.charAt(0).toUpperCase() + weather.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          Budget-friendly
                        </span>
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                          {activity.charAt(0).toUpperCase() + activity.slice(1)}
                        </span>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          Highly Rated
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        This destination aligns perfectly with your preferences
                        for {activity} activities in {weather} weather within
                        your budget range.
                      </p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Estimated cost: ${Math.round(budget * 0.8)}-${budget}
                        </span>
                        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {recommendations.length > 0 && (
          <TravelPlanner
            recommendations={recommendations}
            budget={budget}
            weather={weather}
            activity={activity}
          />
        )}
      </main>

      <footer className="bg-indigo-900 text-white py-8 mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold">TravelSense</h2>
              <p className="text-indigo-200 text-sm mt-1">
                Intelligent Travel Recommendation System
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-indigo-200 text-sm">Final Year Project</p>
              <p className="text-indigo-300 text-xs mt-1">
                Computer Science Department, 2025
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-indigo-800 text-center text-xs text-indigo-300">
            <p>
              This project demonstrates the application of machine learning for
              personalized recommendations.
            </p>
            <p className="mt-2">© 2025 All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
