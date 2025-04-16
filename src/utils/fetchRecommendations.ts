import axios from "axios";

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

interface RecommendationResponse {
  success: boolean;
  error?: string;
  recommendations?: Recommendation[];
}

export default async function fetchRecommendations(budget: number, weather: string, activity: string) {
  const response = await axios.post<RecommendationResponse>("/api/recommend", { budget, weather, activity });
  
  if (!response.data.success || response.data.error) {
    throw new Error(response.data.error || 'Failed to get recommendations');
  }
  
  if (!response.data.recommendations || !Array.isArray(response.data.recommendations)) {
    throw new Error('Invalid recommendations format received');
  }
  
  return response.data.recommendations.map(rec => rec.destination);
}
