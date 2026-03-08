import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import ytdlp from "yt-dlp-exec";
import fs from "fs";
import path from "path";
import os from "os";

const API_KEY = process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const query = formData.get("query") as string;
    const videoFile = formData.get("video_file") as File | null;
    const youtubeUrl = formData.get("youtube_url") as string | null;

    if (!API_KEY) {
      return NextResponse.json(
        { detail: "GOOGLE_API_KEY not configured" },
        { status: 500 },
      );
    }

    let videoPath = "";
    let isTemp = false;

    const tempDir = os.tmpdir();
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (videoFile) {
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      videoPath = path.join(tempDir, `${uniqueId}-${videoFile.name}`);
      fs.writeFileSync(videoPath, buffer);
      isTemp = true;
    } else if (youtubeUrl) {
      const outputName = `${uniqueId}.mp4`;
      videoPath = path.join(tempDir, outputName);

      try {
        // Use local yt-dlp binary if available, otherwise fallback to default
        const localYtDlpPath = path.join(process.cwd(), "yt-dlp");
        const ytCallable = fs.existsSync(localYtDlpPath)
          ? (await import("yt-dlp-exec")).create(localYtDlpPath)
          : ytdlp;

        await ytCallable(youtubeUrl, {
          format: "worst[ext=mp4]",
          output: videoPath,
          noCheckCertificate: true,
          noWarnings: true,
          preferFreeFormats: true,
        });
        isTemp = true;
      } catch (err: any) {
        console.error("YT-DLP Error:", err);
        return NextResponse.json(
          {
            detail: `YouTube download failed: ${err.message || "Unknown error"}. Ensure yt-dlp is installed and the URL is correct.`,
          },
          { status: 500 },
        );
      }
    } else {
      return NextResponse.json(
        { detail: "No video provided" },
        { status: 400 },
      );
    }

    // 1. Upload to Gemini
    const uploadResponse = await fileManager.uploadFile(videoPath, {
      mimeType: "video/mp4",
      displayName: "Analysis Video",
    });

    // 2. Wait for processing
    let file = await fileManager.getFile(uploadResponse.file.name);
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(uploadResponse.file.name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error("Video processing failed on Google servers");
    }

    // 3. Analyze with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // Ensure this is the correct model ID
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
      {
        text: `Analyze the video for content and context. Respond to the following query: ${query}. Provide a detailed, user-friendly, and actionable response.`,
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up
    if (isTemp && fs.existsSync(videoPath)) {
      try {
        fs.unlinkSync(videoPath);
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    }

    return NextResponse.json({ analysis: text });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { detail: `Analysis failed: ${error.message}` },
      { status: 500 },
    );
  }
}
