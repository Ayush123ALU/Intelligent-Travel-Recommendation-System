import jsPDF from 'jspdf';

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

interface UserPreferences {
  budget: number;
  weather: string;
  activity: string;
}

export function generateRecommendationsPDF(
  recommendations: Recommendation[],
  preferences: UserPreferences,
  plan?: Plan
) {
  const doc = new jsPDF();
  let yPos = 20;
  const margin = 20;
  const lineHeight = 7;

  const addText = (text: string, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('bold');
    } else {
      doc.setFont('normal');
    }
    doc.text(text, margin, yPos);
    yPos += lineHeight;
  };

  addText('Travel Recommendations & Plan', 24, true);
  yPos += 10;

  addText('Your Preferences:', 16, true);
  addText(`Budget: $${preferences.budget}`);
  addText(`Weather: ${preferences.weather}`);
  addText(`Activity: ${preferences.activity}`);
  yPos += 10;

  recommendations.forEach((rec) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    addText(rec.destination, 18, true);
    addText(`Match Score: ${rec.match_score.toFixed(1)}%`);
    addText('Destination Features:', 14, true);
    addText(`Weather: ${rec.features.weather}`);
    addText(`Main Activity: ${rec.features.activity}`);
    addText(`Safety Score: ${rec.features.safety_score.toFixed(1)}%`);
    addText(`Popularity: ${rec.features.popularity.toFixed(1)}%`);
    addText(`Language Barrier: ${rec.features.language_barrier.toFixed(1)}%`);
    addText(`Cuisine Rating: ${rec.features.cuisine_rating.toFixed(1)}%`);
    addText(`Nightlife Rating: ${rec.features.nightlife.toFixed(1)}%`);
    yPos += 10;
  });

  if (plan) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    addText('Travel Plan Details', 18, true);
    yPos += 5;

    addText('Budget Allocation:', 14, true);
    Object.entries(plan.budget).forEach(([category, amount]) => {
      addText(`${category.charAt(0).toUpperCase() + category.slice(1)}: $${amount} (${Math.round((amount / preferences.budget) * 100)}%)`);
    });
    yPos += 10;

    if (plan.activities.length > 0) {
      addText('Planned Activities:', 14, true);
      let currentDay = 0;

      plan.activities.sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.time.localeCompare(b.time);
      }).forEach((activity) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        if (currentDay !== activity.day) {
          currentDay = activity.day;
          yPos += 5;
          addText(`Day ${activity.day}:`, 12, true);
        }

        addText(`${activity.time} - ${activity.activity}`);
        if (activity.notes) {
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(activity.notes, margin + 5, yPos);
          yPos += lineHeight;
          doc.setTextColor(0);
        }
      });
    }

    if (plan.notes) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      yPos += 10;
      addText('Trip Notes:', 14, true);
      doc.setFontSize(12);
      const splitNotes = doc.splitTextToSize(plan.notes, 170);
      doc.text(splitNotes, margin, yPos);
      yPos += splitNotes.length * lineHeight;
    }
  }

  return doc;
} 