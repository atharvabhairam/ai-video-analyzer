'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Youtube,
  Search,
  Loader2,
  Video,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setYoutubeUrl('');
    }
  };

  const handleAnalyze = async () => {
    if (!query) {
      setError('Please enter a query to analyze the video.');
      return;
    }
    if (!videoFile && !youtubeUrl) {
      setError('Please provide a video file or a YouTube URL.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    const formData = new FormData();
    formData.append('query', query);
    if (videoFile) formData.append('video_file', videoFile);
    if (youtubeUrl) formData.append('youtube_url', youtubeUrl);

    try {
      const response = await axios.post('/api/analyze', formData);
      setResult(response.data.analysis);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeId = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
      return parsed.searchParams.get('v');
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl text-center mb-12"
      >
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-primary/20 border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-linear-to-r from-primary via-secondary to-accent animate-gradient">
          AI Video Analyzer
        </h1>
        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Unlock deep insights from any video using advanced multimodal AI.
        </p>
      </motion.header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-[2rem] p-8 md:p-10 flex flex-col gap-10"
        >
          {/* Tabs */}
          <div className="flex p-1 bg-zinc-100 rounded-xl overflow-hidden self-start">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-5 py-2.5 rounded-lg flex items-center gap-2.5 transition-all font-medium ${activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`px-5 py-2.5 rounded-lg flex items-center gap-2.5 transition-all font-medium ${activeTab === 'youtube' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <Youtube className="w-4 h-4" />
              <span>YouTube</span>
            </button>
          </div>

          {/* Media Input Container */}
          <div className="min-h-[250px] flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === 'upload' ? (
                <motion.div
                  key="upload-tab"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1"
                >
                  <label
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-full border-2 border-dashed rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center
                      ${videoFile ? 'border-indigo-500/50 bg-indigo-50/30' : 'border-zinc-200 hover:border-indigo-400 hover:bg-zinc-50'}`}
                  >
                    {videoFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-12 h-12 text-indigo-600 mb-4" />
                        <p className="text-zinc-900 font-semibold">{videoFile.name}</p>
                        <p className="text-zinc-500 text-sm mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoFile(null);
                            setVideoPreview(null);
                          }}
                          className="mt-4 text-xs text-zinc-400 hover:text-indigo-600 transition-colors underline underline-offset-4"
                        >
                          Choose different file
                        </button>
                      </div>
                    ) : (
                      <>
                        <FileVideo className="w-12 h-12 text-slate-500 mb-4" />
                        <p className="text-zinc-900 font-semibold">Click or drag video file</p>
                        <p className="text-zinc-500 text-sm mt-2 font-medium">MP4, MOV, AVI (Max 50MB recommended)</p>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="video/*"
                    />
                  </label>
                </motion.div>
              ) : (
                <motion.div
                  key="youtube-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="relative group">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors" />
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => {
                        setYoutubeUrl(e.target.value);
                        setVideoFile(null);
                        setVideoPreview(null);
                      }}
                      placeholder="Paste YouTube video URL here..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                    />
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-sm text-zinc-500 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <p>Provide a valid link like https://www.youtube.com/watch?v=...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Query Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              What insights are you seeking?
            </h3>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about the video: summaries, specific details, or complex analysis..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-5 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-zinc-900 placeholder:text-zinc-400 text-base"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || (!videoFile && !youtubeUrl)}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all
              ${loading
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-xl active:scale-[0.98]'
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Video...
              </>
            ) : (
              <>
                Analyze Video
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-accent/20 border border-accent/30 rounded-xl text-accent-foreground text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-10"
        >
          {/* Video Preview */}
          <div className="glass rounded-[2rem] overflow-hidden aspect-video relative">
            {videoPreview ? (
              <video src={videoPreview} controls className="w-full h-full object-cover" />
            ) : getYoutubeId(youtubeUrl) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`}
                className="w-full h-full border-none"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-50">
                <Video className="w-16 h-16 mb-4 opacity-10" />
                <p className="font-medium">Video Preview</p>
              </div>
            )}
          </div>

          {/* Result Card */}
          <div className="glass rounded-[2rem] flex-1 p-8 md:p-10 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-4">
              <div className={`p-2 rounded-full transition-opacity ${loading ? 'opacity-100' : 'opacity-0'}`}>
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Analysis Result</h2>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {result ? (
                <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed">
                  <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                    {result}
                  </pre>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                  <div className="flex gap-2">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-primary" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-secondary" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <p>AI is analyzing frames and processing context...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-40">
                  <Search className="w-12 h-12 mb-4" />
                  <p className="text-center">Start analysis to see results here</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-20 text-zinc-400 text-sm flex items-center gap-8 mb-10">
        <p>© 2026 Video AI Analyzer</p>
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
        <a href="#" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 font-medium">
          Documentation <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </footer>
    </div>
  );
}
