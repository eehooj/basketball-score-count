"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface GameState {
  homeScore: number;
  awayScore: number;
  timer: number;
  shotClock: number;
  period: number;
  isRunning: boolean;
}

const initialGameState: GameState = {
  homeScore: 0,
  awayScore: 0,
  timer: 600,
  shotClock: 24,
  period: 1,
  isRunning: false,
};

const STORAGE_KEY = "basketball_game_state";
const HISTORY_KEY = "basketball_game_history";

export function useGame(roomId: string) {
  const id = roomId || "default";
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const isInitialMount = useRef(true);

  const loadState = useCallback((): GameState => {
    if (typeof window === "undefined") return initialGameState;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${id}`);
      if (!saved) return initialGameState;
      const parsed = JSON.parse(saved);
      return { ...initialGameState, ...parsed };
    } catch (e) {
      return initialGameState;
    }
  }, [id]);

  const loadHistory = useCallback((): GameState[] => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`${HISTORY_KEY}_${id}`);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [id]);

  const saveState = useCallback((newState: GameState, saveToHistory: boolean = false) => {
    if (typeof window === "undefined") return;
    try {
      if (saveToHistory) {
        const currentHistory = loadHistory();
        const currentState = loadState();
        const updatedHistory = [...currentHistory, currentState].slice(-50);
        localStorage.setItem(`${HISTORY_KEY}_${id}`, JSON.stringify(updatedHistory));
      }
      localStorage.setItem(`${STORAGE_KEY}_${id}`, JSON.stringify(newState));
      window.dispatchEvent(new CustomEvent("game_state_change", { detail: { roomId: id, state: newState } }));
    } catch (e) {
      console.error("Save error:", e);
    }
  }, [id, loadHistory, loadState]);

  useEffect(() => {
    if (isInitialMount.current) {
      setGameState(loadState());
      isInitialMount.current = false;
    }
  }, [loadState]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.type === "game_state_change" && e.detail?.roomId !== id) return;
      setGameState(loadState());
    };
    window.addEventListener("game_state_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("game_state_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [id, loadState]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (gameState.isRunning) {
      interval = setInterval(() => {
        const current = loadState();
        if (current.isRunning) {
          const next = { ...current };
          let buzzerTriggered = false;
          
          if (next.timer > 0) {
            next.timer -= 1;
            if (next.timer === 0) {
              next.isRunning = false;
              buzzerTriggered = true;
            }
          }
          
          if (next.shotClock > 0) {
            next.shotClock -= 1;
            if (next.shotClock === 0) {
              buzzerTriggered = true;
              // 샷클락 위반 시 경기를 멈출 수도 있지만, 보통 심판 휘슬 전까지 흐르므로 
              // 여기서는 소리만 나게 하고 타이머는 유지할 수도 있습니다.
              // 일단 소리 트리거를 위해 상태 반영
            }
          }

          saveState(next, false);
          setGameState(next);

          if (buzzerTriggered) {
            window.dispatchEvent(new CustomEvent("game_buzzer", { detail: { roomId: id } }));
          }
        } else {
          if (interval) clearInterval(interval);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isRunning, id, loadState, saveState]);

  const updateScore = useCallback((team: "home" | "away", delta: number) => {
    const current = loadState();
    const key = team === "home" ? "homeScore" : "awayScore";
    const next = { ...current, [key]: Math.max(0, current[key] + delta) };
    saveState(next, true);
    setGameState(next);
  }, [loadState, saveState]);

  const toggleTimer = useCallback(() => {
    const current = loadState();
    const next = { ...current, isRunning: !current.isRunning };
    saveState(next, true);
    setGameState(next);
  }, [loadState, saveState]);

  const updateTimer = useCallback((deltaSeconds: number) => {
    const current = loadState();
    const next = { ...current, timer: Math.max(0, current.timer + deltaSeconds) };
    saveState(next, true);
    setGameState(next);
  }, [loadState, saveState]);

  const resetShotClock = useCallback((seconds: number = 24) => {
    const current = loadState();
    const next = { ...current, shotClock: seconds };
    saveState(next, true);
    setGameState(next);
  }, [loadState, saveState]);

  const undo = useCallback(() => {
    const history = loadHistory();
    if (history.length > 0) {
      const prevHistory = [...history];
      const lastState = prevHistory.pop()!;
      localStorage.setItem(`${HISTORY_KEY}_${id}`, JSON.stringify(prevHistory));
      saveState(lastState, false);
      setGameState(lastState);
    }
  }, [id, loadHistory, saveState]);

  const resetGame = useCallback(() => {
    saveState(initialGameState, true);
    setGameState(initialGameState);
  }, [saveState]);

  return { 
    gameState, 
    updateScore, 
    toggleTimer, 
    updateTimer, 
    resetShotClock, 
    undo, 
    resetGame 
  };
}
