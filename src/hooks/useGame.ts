"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ref, onValue, set, get, child } from "firebase/database";
import { db } from "@/lib/firebase";

export interface GameState {
  homeScore: number;
  awayScore: number;
  homeName: string;
  awayName: string;
  timer: number;
  shotClock: number;
  period: number;
  isRunning: boolean;
  periodScores: { home: number; away: number }[];
}

const initialGameState: GameState = {
  homeScore: 0,
  awayScore: 0,
  homeName: "HOME",
  awayName: "AWAY",
  timer: 600,
  shotClock: 24,
  period: 1,
  isRunning: false,
  periodScores: [],
};

export function useGame(roomId: string, isController: boolean = false) {
  const id = roomId || "default";
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const isInitialMount = useRef(true);
  const gameRef = ref(db, `games/${id}`);

  // Firebase에서 초기 상태 로드 및 구독
  useEffect(() => {
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
      } else if (isInitialMount.current && isController) {
        // 컨트롤러에서 데이터가 없으면 초기값으로 설정
        set(gameRef, initialGameState);
      }
    });

    isInitialMount.current = false;
    return () => unsubscribe();
  }, [id, isController]);

  const saveState = useCallback(async (newState: GameState) => {
    if (!isController) return; // 컨트롤러가 아니면 저장 권한 없음
    try {
      await set(gameRef, newState);
    } catch (e) {
      console.error("Firebase Save error:", e);
    }
  }, [id, isController, gameRef]);

  // 타이머 로직 (컨트롤러에서만 실행)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isController && gameState.isRunning) {
      interval = setInterval(async () => {
        const snapshot = await get(gameRef);
        const current = snapshot.val() as GameState || gameState;
        
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
            }
          }

          await saveState(next);

          if (buzzerTriggered) {
            // 로컬 알림 (부저)
            window.dispatchEvent(new CustomEvent("game_buzzer", { detail: { roomId: id } }));
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isController, gameState.isRunning, id, saveState, gameRef, gameState]);

  const updateScore = useCallback((team: "home" | "away", delta: number) => {
    const key = team === "home" ? "homeScore" : "awayScore";
    const next = { ...gameState, [key]: Math.max(0, gameState[key] + delta) };
    saveState(next);
  }, [gameState, saveState]);

  const updateTeamName = useCallback((team: "home" | "away", name: string) => {
    const key = team === "home" ? "homeName" : "awayName";
    const next = { ...gameState, [key]: name };
    saveState(next);
  }, [gameState, saveState]);

  const toggleTimer = useCallback(() => {
    const next = { ...gameState, isRunning: !gameState.isRunning };
    saveState(next);
  }, [gameState, saveState]);

  const updateTimer = useCallback((deltaSeconds: number) => {
    const next = { ...gameState, timer: Math.max(0, gameState.timer + deltaSeconds) };
    saveState(next);
  }, [gameState, saveState]);

  const resetShotClock = useCallback((seconds: number = 24) => {
    const next = { ...gameState, shotClock: seconds };
    saveState(next);
  }, [gameState, saveState]);

  const resetGame = useCallback(() => {
    saveState(initialGameState);
  }, [saveState]);

  const nextPeriod = useCallback(() => {
    const nextScores = [...(gameState.periodScores || []), { home: gameState.homeScore, away: gameState.awayScore }];
    const next = { 
      ...gameState, 
      period: gameState.period + 1,
      timer: 600,
      shotClock: 24,
      isRunning: false,
      periodScores: nextScores
    };
    saveState(next);
  }, [gameState, saveState]);

  return { 
    gameState, 
    updateScore, 
    updateTeamName,
    toggleTimer, 
    updateTimer, 
    resetShotClock, 
    resetGame,
    nextPeriod
  };
}
