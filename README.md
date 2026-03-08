# 🎥 AI Video Analyzer

A premium, multimodal AI-powered video analysis tool built with **Next.js 15**, **React 19**, and **Tailwind CSS 4**. Unlock deep insights from any video using Google's advanced **Gemini AI**.

![AI Video Analyzer Preview](https://github.com/user-attachments/assets/placeholder-image.png)

## ✨ Features

- 📤 **Local Video Upload**: Support for MP4, MOV, and AVI formats (Recommended max 50MB).
- 🔗 **YouTube Integration**: Analyze any public YouTube video just by pasting the URL.
- 🧠 **Multimodal AI Analysis**: Powered by Google Gemini 1.5 Flash (or equivalent) for deep frame-by-frame understanding.
- 💬 **Contextual Q&A**: Ask specific questions about video content, summaries, or complex details.
- 🎨 **Premium UI/UX**:
  - Built with **Tailwind CSS 4** for next-gen styling.
  - Smooth animations using **Framer Motion**.
  - Modern "Glassmorphism" design system.
  - Fully responsive for all device sizes.

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/)
- **AI Engine**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Video Handling**: [yt-dlp-exec](https://github.com/microlinkhq/yt-dlp-exec) for YouTube processing.
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: v20 or later.
- **yt-dlp**: Required for YouTube video analysis. Ensure it is installed on your system or available in the project path.
  - *Note: The app checks for a local `yt-dlp` binary in the project root or uses the system-installed one.*

### Environment Setup

Create a `.env` file in the root directory and add your Google API Key:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/video-analyzer-next.git
   cd video-analyzer-next
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📖 Usage Guide

1. **Upload Tab**: Click the "Upload" tab to select a local video file.
2. **YouTube Tab**: Paste a YouTube URL to analyze online content.
3. **Query**: Enter your question or analysis request in the text area (e.g., "Summarize this video" or "What color is the car at 0:45?").
4. **Analyze**: Click "Analyze Video" and wait for the AI to process the frames and provide a detailed response.

## 📝 License

This project is licensed under the MIT License.

---

Built with ❤️ for the future of AI Video Analysis.
