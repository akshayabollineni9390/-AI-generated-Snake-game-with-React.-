/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RefreshCw } from 'lucide-react';

// --- Constants & Types ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_FOOD = { x: 15, y: 5 };
const GAME_SPEED = 120; // Slightly faster for better feel

type Point = { x: number; y: number };

const TRACKS = [
  {
    id: 1,
    title: "Neon Overdrive (AI Generated)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Cybernetic Pulse (AI Generated)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Digital Horizon (AI Generated)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function App() {
  // --- Snake Game State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>(INITIAL_FOOD);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Game Logic ---
  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setIsGamePaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (gameOver) resetGame();
        else setIsGamePaused(p => !p);
        return;
      }

      if (gameOver || isGamePaused) return;

      setDirection(prev => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            return prev.y === 1 ? prev : { x: 0, y: -1 };
          case 'ArrowDown':
          case 's':
          case 'S':
            return prev.y === -1 ? prev : { x: 0, y: 1 };
          case 'ArrowLeft':
          case 'a':
          case 'A':
            return prev.x === 1 ? prev : { x: -1, y: 0 };
          case 'ArrowRight':
          case 'd':
          case 'D':
            return prev.x === -1 ? prev : { x: 1, y: 0 };
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isGamePaused]);

  useEffect(() => {
    if (gameOver || isGamePaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Check collision with walls
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check collision with self
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [direction, food, gameOver, isGamePaused, generateFood]);

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnded = () => {
    nextTrack();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--accent-pink)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--accent-blue)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="bento-container z-10">
        <header className="bento-header">
            <div className="bento-logo">NEON<span>CORE</span></div>
            <div style={{fontSize: '12px', color: 'var(--text-dim)'}}>SYSTEMS V.2.04.1</div>
        </header>

        <aside className="bento-card bento-playlist">
            <div className="bento-section-title">Library</div>
            {TRACKS.map((track, index) => (
              <div 
                key={track.id} 
                className={`bento-track-item ${index === currentTrackIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setIsPlaying(true);
                }}
              >
                  <div className="bento-track-thumb" style={{background: index === 0 ? 'linear-gradient(135deg, #00d4ff, #003a47)' : index === 1 ? 'linear-gradient(135deg, #ff007f, #4a0025)' : 'linear-gradient(135deg, #00ff41, #004712)'}}></div>
                  <div className="bento-track-info">
                      <span className="title">{track.title.replace(' (AI Generated)', '')}</span>
                      <span className="artist">A.I. Generated</span>
                  </div>
              </div>
            ))}
        </aside>

        <main className="bento-card bento-game-area">
            <div className="bento-snake-grid">
                {/* Food */}
                <div
                  className="bento-food"
                  style={{
                    left: `${food.x * 20 + 1}px`,
                    top: `${food.y * 20 + 1}px`,
                  }}
                />

                {/* Snake */}
                {snake.map((segment, index) => {
                  return (
                    <div
                      key={`${segment.x}-${segment.y}-${index}`}
                      className="bento-snake-segment"
                      style={{
                        left: `${segment.x * 20 + 1}px`,
                        top: `${segment.y * 20 + 1}px`,
                        background: index === 0 ? '#fff' : 'var(--accent-green)',
                        boxShadow: index === 0 ? '0 0 10px #fff' : '0 0 8px var(--accent-green)'
                      }}
                    />
                  );
                })}

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                    <h2 className="text-3xl font-black text-[var(--accent-pink)] mb-2 drop-shadow-[0_0_10px_var(--accent-pink)]">SYSTEM FAILURE</h2>
                    <p className="text-[var(--accent-green)] mb-6 font-bold">FINAL SCORE: {score}</p>
                    <button
                      onClick={resetGame}
                      className="flex items-center gap-2 px-6 py-3 bg-transparent border border-[var(--accent-green)] text-[var(--accent-green)] rounded-full hover:bg-[var(--accent-green)] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,255,65,0.3)] hover:shadow-[0_0_25px_rgba(0,255,65,0.6)] font-bold uppercase tracking-wider text-sm"
                    >
                      <RefreshCw size={16} />
                      Reboot Sequence
                    </button>
                  </div>
                )}
            </div>
            <div className="bento-system-status">LIVE FEED: COORDINATE_RX_772 {isGamePaused && !gameOver ? "- PAUSED" : ""}</div>
        </main>

        <aside className="bento-card bento-stats">
            <div className="bento-stat-block">
                <div className="bento-stat-label">Score</div>
                <div className="bento-stat-value">{score.toString().padStart(5, '0')}</div>
            </div>
            <div className="bento-stat-block">
                <div className="bento-stat-label">Multiplier</div>
                <div className="bento-stat-value" style={{color: 'var(--accent-pink)'}}>x{(1 + score/100).toFixed(1)}</div>
            </div>
            <div className="bento-stat-block">
                <div className="bento-stat-label">Status</div>
                <div className="bento-stat-value" style={{color: 'var(--text-dim)', fontSize: '20px', marginTop: '10px'}}>
                  {gameOver ? 'OFFLINE' : isGamePaused ? 'STANDBY' : 'ACTIVE'}
                </div>
            </div>
        </aside>

        <footer className="bento-card bento-player">
            <div className="bento-album-art" style={{background: currentTrackIndex === 0 ? 'linear-gradient(135deg, #00d4ff, #003a47)' : currentTrackIndex === 1 ? 'linear-gradient(135deg, #ff007f, #4a0025)' : 'linear-gradient(135deg, #00ff41, #004712)'}}></div>
            <div className="bento-now-playing-info">
                <span style={{fontSize: '14px', fontWeight: 'bold', display: 'block'}}>{TRACKS[currentTrackIndex].title.replace(' (AI Generated)', '')}</span>
                <span style={{fontSize: '11px', color: 'var(--text-dim)'}}>A.I. Generated</span>
                <div className="bento-progress-bar">
                    <div className="bento-progress-fill" style={{width: isPlaying ? '100%' : '0%', transition: isPlaying ? 'width 30s linear' : 'none'}}></div>
                </div>
            </div>
            <audio 
              ref={audioRef} 
              src={TRACKS[currentTrackIndex].url} 
              onEnded={handleTrackEnded}
              preload="auto"
            />
        </footer>

        <div className="bento-card bento-player-ctrl">
            <button className="bento-ctrl-btn" onClick={prevTrack}><SkipBack size={20} /></button>
            <button className="bento-ctrl-btn bento-play-pause" onClick={togglePlay}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button className="bento-ctrl-btn" onClick={nextTrack}><SkipForward size={20} /></button>
            <button className="bento-ctrl-btn" style={{fontSize: '14px', color: 'var(--text-dim)'}} onClick={() => setIsMuted(!isMuted)}>
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
        </div>
      </div>
    </div>
  );
}
