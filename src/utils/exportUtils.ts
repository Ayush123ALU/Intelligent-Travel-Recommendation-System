import { jsPDF } from "jspdf";
import { createEvents, EventAttributes } from "ics";

interface Activity {
  day: number;
  time: string;
  activity: string;
  notes?: string;
}

interface Budget {
  accommodation: number;
  activities: number;
  food: number;
  transportation: number;
  miscellaneous: number;
  [key: string]: number;
}

interface TravelPlan {
  destination: string;
  startDate: string;
  endDate: string;
  budget: Budget;
  activities: Activity[];
  notes?: string;
}

export const exportToPDF = (plan: TravelPlan) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text(`Travel Plan: ${plan.destination}`, 20, 20);

  doc.setFontSize(12);
  doc.text(`Date: ${plan.startDate} to ${plan.endDate}`, 20, 35);

  doc.setFontSize(14);
  doc.text("Budget Allocation:", 20, 50);
  doc.setFontSize(12);
  let yPos = 60;
  Object.entries(plan.budget).forEach(([category, amount]) => {
    doc.text(
      `${category.charAt(0).toUpperCase() + category.slice(1)}: $${amount}`,
      30,
      yPos
    );
    yPos += 10;
  });
  doc.text(
    `Total Budget: $${Object.values(plan.budget).reduce(
      (a: number, b: number) => a + b,
      0
    )}`,
    30,
    yPos
  );

  yPos += 20;
  doc.setFontSize(14);
  doc.text("Activities:", 20, yPos);
  doc.setFontSize(12);
  yPos += 10;

  plan.activities.forEach((activity: Activity) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`Day ${activity.day} - ${activity.time}`, 30, yPos);
    yPos += 7;
    doc.text(activity.activity, 40, yPos);
    yPos += 7;
    if (activity.notes) {
      const splitNotes = doc.splitTextToSize(activity.notes, 150);
      splitNotes.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 40, yPos);
        yPos += 7;
      });
    }
    yPos += 5;
  });

  if (plan.notes) {
    yPos += 10;
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.text("Additional Notes:", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    const splitNotes = doc.splitTextToSize(plan.notes, 170);
    splitNotes.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 20, yPos);
      yPos += 7;
    });
  }

  doc.save(
    `travel-plan-${plan.destination.toLowerCase().replace(/\s+/g, "-")}.pdf`
  );
};

export const exportToCalendar = (plan: TravelPlan) => {
  const events: EventAttributes[] = plan.activities.map(
    (activity: Activity) => {
      const [activityDate, activityMonth, activityYear] = new Date(
        plan.startDate
      )
        .toLocaleDateString("en-GB")
        .split("/")
        .map(Number);

      const [hours, minutes] = activity.time.split(":").map(Number);

      return {
        title: activity.activity,
        description: activity.notes,
        start: [
          activityYear,
          activityMonth,
          activityDate + activity.day - 1,
          hours,
          minutes,
        ] as [number, number, number, number, number],
        duration: { hours: 1 },
        location: plan.destination,
      };
    }
  );

  createEvents(events, (error: Error | undefined, value: string) => {
    if (error) {
      console.error(error);
      return;
    }

    const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `travel-plan-${plan.destination
      .toLowerCase()
      .replace(/\s+/g, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
