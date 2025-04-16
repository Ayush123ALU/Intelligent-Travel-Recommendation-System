import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { destination, weather, activity_type, budget } = await req.json();
    
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), "src", "scripts", "suggest_activities.py");
      const pythonProcess = spawn("python", [
        scriptPath,
        destination,
        weather,
        activity_type,
        budget.toString()
      ]);

      let result = "";
      let errorMsg = "";

      pythonProcess.stdout.on("data", (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorMsg += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("Python script error:", errorMsg);
          return reject(NextResponse.json({ error: "Failed to get suggestions" }, { status: 500 }));
        }

        try {
          const suggestions = JSON.parse(result.trim());
          resolve(NextResponse.json(suggestions));
        } catch (jsonError) {
          console.error("JSON Parse Error:", jsonError, "Raw result:", result);
          resolve(NextResponse.json({ error: "Invalid response format" }, { status: 500 }));
        }
      });
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
} 