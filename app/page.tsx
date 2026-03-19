"use client";

import { useRef, useState, useEffect, useCallback } from "react";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [needsUnmute, setNeedsUnmute] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsMuted(false);
        scheduleHide();
      })
      .catch(() => {
        video.muted = true;
        setIsMuted(true);
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setNeedsUnmute(true);
            scheduleHide();
          })
          .catch(() => setNeedsPlay(true));
      });
  }, [scheduleHide]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const handleScreenTap = () => {
    const video = videoRef.current;
    if (!video) return;
    if (needsPlay) {
      video.muted = false;
      setIsMuted(false);
      video.play();
      setNeedsPlay(false);
      setNeedsUnmute(false);
      scheduleHide();
      return;
    }
    if (needsUnmute) {
      video.muted = false;
      setIsMuted(false);
      setNeedsUnmute(false);
      scheduleHide();
      return;
    }
    if (video.paused) video.play();
    else video.pause();
    scheduleHide();
  };

  const toggleMute = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    scheduleHide();
  };

  const seek = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
    scheduleHide();
  };

  const toggleFullscreen = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
    scheduleHide();
  };

  const togglePlay = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
    scheduleHide();
  };

  return (
    <div
      className="grain scanline flex flex-col w-screen bg-[#030303] select-none overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* ── Ambient gradient orbs ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full opacity-[0.07] blur-[120px] animate-float"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[50vw] h-[50vw] rounded-full opacity-[0.05] blur-[100px] animate-float"
          style={{
            background: "radial-gradient(circle, #3b82f6, transparent 70%)",
            animationDelay: "-3s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full opacity-[0.04] blur-[80px]"
          style={{
            background: "radial-gradient(circle, #ec4899, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
            animationDelay: "-5s",
          }}
        />
      </div>

      {/* ── Header ── */}
      <header
        className="relative z-40 shrink-0 anim-entrance-header"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.5rem)", paddingLeft: "clamp(1.5rem, 3vw, 3.5rem)", paddingRight: "clamp(1.5rem, 3vw, 3.5rem)" }}
      >
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Left — decorative tag */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-white/25 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500/60 animate-pulse" />
            <span>Live</span>
          </div>

          {/* Center — title */}
          <div className="flex-1 sm:flex-none flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Decorative spinner */}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow text-violet-400/40" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
                <circle cx="12" cy="4" r="1" fill="currentColor" />
              </svg>

              <h1 className="text-[13px] sm:text-base md:text-lg font-light tracking-[0.15em] sm:tracking-[0.25em] uppercase text-white/90">
                Tribute to{" "}
                <span className="font-medium bg-gradient-to-r from-violet-400 via-blue-400 to-violet-400 bg-clip-text text-transparent animate-shimmer">
                  Anomalocaris
                </span>
              </h1>

              <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow text-blue-400/40" style={{ animationDirection: "reverse" }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
                <circle cx="12" cy="4" r="1" fill="currentColor" />
              </svg>
            </div>

            {/* Subtitle line */}
            <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-white/20">
              Cambrian Apex Predator
            </p>
          </div>

          {/* Right — decorative element */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-white/25 uppercase tracking-widest">
            <span>540 MYA</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
        </div>

        {/* Header bottom border — animated gradient line */}
        <div className="relative h-px w-full anim-entrance-line">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          <div
            className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent"
            style={{ animation: "shimmer 4s linear infinite", left: "0%" }}
          />
        </div>
      </header>

      {/* ── Video container ── */}
      <div
        className="relative flex-1 min-h-0 cursor-pointer anim-entrance-video"
        onClick={handleScreenTap}
        onMouseMove={scheduleHide}
        onTouchStart={scheduleHide}
      >
        {/* Corner accents */}
        <div className="pointer-events-none absolute inset-0 z-[12]">
          {/* Top-left corner */}
          <svg className="absolute top-3 left-3 sm:top-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 text-white/[0.08] anim-entrance-corner-tl" viewBox="0 0 32 32" fill="none">
            <path d="M0 12V0h12" stroke="currentColor" strokeWidth="1" />
          </svg>
          {/* Top-right corner */}
          <svg className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 text-white/[0.08] anim-entrance-corner-tr" viewBox="0 0 32 32" fill="none">
            <path d="M32 12V0H20" stroke="currentColor" strokeWidth="1" />
          </svg>
          {/* Bottom-left corner */}
          <svg className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 text-white/[0.08] anim-entrance-corner-bl" viewBox="0 0 32 32" fill="none">
            <path d="M0 20v12h12" stroke="currentColor" strokeWidth="1" />
          </svg>
          {/* Bottom-right corner */}
          <svg className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 text-white/[0.08] anim-entrance-corner-br" viewBox="0 0 32 32" fill="none">
            <path d="M32 20v12H20" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Side decorative elements — desktop only */}
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-[12] hidden lg:flex flex-col items-center gap-3 anim-entrance-side-left">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="font-mono text-[9px] text-white/15 tracking-widest" style={{ writingMode: "vertical-rl" }}>
            ANOMALOCARIS CANADENSIS
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 z-[12] hidden lg:flex flex-col items-center gap-3 anim-entrance-side-right">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="font-mono text-[9px] text-white/15 tracking-widest" style={{ writingMode: "vertical-rl" }}>
            BURGESS SHALE
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>

        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(3,3,3,0.7) 100%)",
          }}
        />

        {/* CRT SVG filter */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <filter id="crt">
              {/* Barrel distortion via displacement map */}
              <feTurbulence type="fractalNoise" baseFrequency="0.005 0.005" numOctaves="1" result="warp" seed="2" />
              <feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" result="warped" />
              {/* Subtle RGB split — red shifts left, blue shifts right */}
              <feOffset in="warped" dx="-1" dy="0" result="r" />
              <feOffset in="warped" dx="1" dy="0" result="b" />
              <feOffset in="warped" dx="0" dy="0" result="g" />
              <feColorMatrix in="r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
              <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
              <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
              <feBlend in="red" in2="green" mode="screen" result="rg" />
              <feBlend in="rg" in2="blue" mode="screen" />
            </filter>
          </defs>
        </svg>

        {/* Video with CRT filter */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain crt-video"
          src="/video.mp4"
          loop
          playsInline
          preload="auto"
        />

        {/* CRT scanlines overlay */}
        <div className="pointer-events-none absolute inset-0 z-[9] crt-scanlines" />

        {/* VHS tracking glitch — horizontal band */}
        <div className="pointer-events-none absolute inset-0 z-[9] overflow-hidden">
          <div className="crt-tracking" />
        </div>

        {/* ── "Tap for sound" / "Tap to play" prompt ── */}
        {(needsUnmute || needsPlay) && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            {/* Dim overlay to draw attention */}
            <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={handleScreenTap} />

            <div className="animate-fade-up pointer-events-auto relative flex flex-col items-center gap-4 sm:gap-5">
              {/* Outer pulsing rings */}
              <div className="relative">
                <span className="absolute inset-[-20px] sm:inset-[-28px] rounded-full border border-violet-500/10 animate-ping" style={{ animationDuration: "2s" }} />
                <span className="absolute inset-[-12px] sm:inset-[-18px] rounded-full border border-violet-500/15 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }} />

                {/* Icon circle */}
                <button
                  onClick={handleScreenTap}
                  className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all active:scale-90 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.2))",
                    boxShadow: "0 0 40px rgba(139, 92, 246, 0.3), 0 0 80px rgba(139, 92, 246, 0.1), inset 0 0 20px rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {needsPlay ? (
                    <svg className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 sm:w-9 sm:h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Label */}
              <button
                onClick={handleScreenTap}
                className="animate-pulse-glow flex items-center gap-2 rounded-full px-5 py-2 sm:px-6 sm:py-2.5 glass gradient-border transition-all active:scale-95"
              >
                <span className="text-sm sm:text-base font-medium tracking-wider text-white/95">
                  {needsPlay ? "Tap to play" : "Tap for sound"}
                </span>
              </button>

              {/* Subtle hint */}
              <p className="font-mono text-[9px] sm:text-[10px] text-white/30 tracking-widest uppercase animate-pulse">
                Click anywhere
              </p>
            </div>
          </div>
        )}

        {/* ── Bottom controls ── */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-500 ${
            showControls && !needsPlay
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          <div className="relative px-4 sm:px-6 pb-4 sm:pb-5 pt-10 sm:pt-14">
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="font-mono text-[10px] sm:text-xs text-white/40 w-8 sm:w-10 text-right tabular-nums">
                {formatTime(currentTime)}
              </span>

              <div
                className="group flex-1 h-1 sm:h-[5px] rounded-full bg-white/[0.08] cursor-pointer hover:h-2 transition-all relative overflow-hidden"
                onClick={seek}
                onTouchStart={seek}
              >
                {/* Buffer-style background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] animate-shimmer" />

                <div
                  className="h-full rounded-full relative transition-[width]"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6)",
                    boxShadow: "0 0 12px rgba(139, 92, 246, 0.4), 0 0 4px rgba(139, 92, 246, 0.6)",
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <span className="font-mono text-[10px] sm:text-xs text-white/40 w-8 sm:w-10 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-4 sm:gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white/80 hover:text-white transition-all hover:scale-110 p-1.5 sm:p-1"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Mute */}
              <button
                onClick={toggleMute}
                className="text-white/80 hover:text-white transition-all hover:scale-110 p-1.5 sm:p-1"
              >
                {isMuted ? (
                  <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>

              <div className="flex-1" />

              {/* Status badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">
                  {isPlaying ? "Playing" : "Paused"}
                </span>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white transition-all hover:scale-110 p-1.5 sm:p-1"
              >
                <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <footer
        className="relative z-40 shrink-0 anim-entrance-footer"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.25rem)", paddingLeft: "clamp(1.5rem, 3vw, 3.5rem)", paddingRight: "clamp(1.5rem, 3vw, 3.5rem)" }}
      >
        <div className="relative h-px w-full mb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
        <div className="flex items-center justify-between py-1.5 sm:py-2 anim-entrance-footer-content">
          <span className="font-mono text-[8px] sm:text-[9px] text-white/15 tracking-widest uppercase">
            Fimsh
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-mono text-[8px] sm:text-[9px] text-white/15 tracking-wider">
              Cambrian Period
            </span>
            <div className="w-px h-2.5 bg-white/10" />
            <span className="font-mono text-[8px] sm:text-[9px] text-white/15 tracking-wider">
              ~540 MYA
            </span>
          </div>
          <span className="font-mono text-[8px] sm:text-[9px] text-white/15 tracking-widest uppercase">
            Tribute
          </span>
        </div>
      </footer>
    </div>
  );
}
