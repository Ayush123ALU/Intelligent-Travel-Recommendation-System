import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { budget, weather, activity } = await req.json();
    
    if (!budget || !weather || !activity) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    return new Promise((resolve) => {
      const scriptPath = path.join(process.cwd(), "src", "scripts", "recommend.py");
      console.log("Executing Python script at:", scriptPath);
      
      const pythonProcess = spawn("python", [
        scriptPath,
        budget.toString(),
        weather,
        activity
      ], {
        cwd: path.join(process.cwd(), "src", "scripts")
      });

      let result = "";
      let errorOutput = "";

      pythonProcess.stdout.on("data", (data) => {
        const output = data.toString();
        console.log("Python stdout:", output);
        result += output;
      });

      pythonProcess.stderr.on("data", (data) => {
        const error = data.toString();
        console.log("Python stderr:", error);
        try {
          const debugInfo = JSON.parse(error);
          if (debugInfo.type === "debug") {
            console.log("Debug info:", debugInfo);
          } else {
            errorOutput += error;
          }
        } catch {
          errorOutput += error;
        }
      });

      pythonProcess.on("error", (error) => {
        console.error("Failed to start Python process:", error);
        resolve(
          NextResponse.json(
            { error: "Failed to start recommendation engine", details: error.message },
            { status: 500 }
          )
        );
      });

      pythonProcess.on("close", (code) => {
        console.log("Python process exited with code:", code);
        console.log("Final result:", result);
        
        if (code !== 0) {
          console.error("Python script error:", errorOutput);
          resolve(
            NextResponse.json(
              { error: "Failed to generate recommendations", details: errorOutput },
              { status: 500 }
            )
          );
          return;
        }

        try {
          const recommendations = JSON.parse(result);
          if (recommendations.error) {
            resolve(
              NextResponse.json(
                { error: recommendations.error },
                { status: 500 }
              )
            );
            return;
          }
          resolve(NextResponse.json(recommendations));
        } catch (error) {
          console.error("Error parsing Python output:", error);
          console.error("Raw output:", result);
          resolve(
            NextResponse.json(
              { error: "Invalid response format from recommendation engine", details: result },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
