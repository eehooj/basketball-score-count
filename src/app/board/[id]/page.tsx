"use client";

import { useGame } from "@/hooks/useGame";
import { use, useEffect, useState, useCallback } from "react";

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { gameState } = useGame(id);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // 전자 버저음 생성 및 재생 함수
  const playBuzzer = useCallback(() => {
    if (typeof window === "undefined") return;
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "square"; // 거친 전자음 느낌
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // 낮은 주파수
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 1.5);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.5);
  }, []);

  useEffect(() => {
    const handleBuzzer = (e: any) => {
      if (e.detail?.roomId === id && audioEnabled) {
        playBuzzer();
      }
    };

    window.addEventListener("game_buzzer", handleBuzzer);
    return () => window.removeEventListener("game_buzzer", handleBuzzer);
  }, [id, audioEnabled, playBuzzer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <main style={{ 
      backgroundColor: "#000", 
      color: "#fff", 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "monospace",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* 사운드 활성화 버튼 (브라우저 정책상 사용자 클릭 필요) */}
      {!audioEnabled && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100
        }}>
          <button 
            onClick={() => setAudioEnabled(true)}
            style={{ padding: "2rem", fontSize: "2rem", backgroundColor: "#f00", color: "#fff", cursor: "pointer" }}
          >
            소리 켜기 (Buzzer Enable)
          </button>
        </div>
      )}

      {/* 상단 정보 (쿼터 등) */}
      <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "#aaa" }}>PERIOD {gameState.period}</div>
      
      {/* 메인 점수판 레이아웃 */}
      <div style={{ display: "flex", gap: "5rem", alignItems: "center", justifyContent: "center", width: "100%" }}>
        
        {/* HOME 팀 */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "4rem", color: "#0070f3" }}>HOME</div>
          <div style={{ fontSize: "18rem", fontWeight: "bold", color: "#f00", lineHeight: 1 }}>{gameState.homeScore}</div>
        </div>

        {/* 중앙 타이머 섹션 */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
          {/* 메인 게임 타이머 */}
          <div style={{ fontSize: "12rem", lineHeight: 1, color: "#fff" }}>{formatTime(gameState.timer)}</div>
          
          {/* 24초 공격 제한 시간 (Shot Clock) */}
          <div style={{ 
            fontSize: "10rem", 
            color: gameState.shotClock <= 0 ? "#ff0000" : (gameState.shotClock <= 5 ? "#ff0000" : "#ffff00"), 
            border: "4px solid",
            borderColor: gameState.shotClock <= 0 ? "#ff0000" : (gameState.shotClock <= 5 ? "#ff0000" : "#ffff00"),
            padding: "0 2rem",
            borderRadius: "20px",
            lineHeight: 1.2,
            minWidth: "200px"
          }}>
            {gameState.shotClock}
          </div>
        </div>

        {/* AWAY 팀 */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "4rem", color: "#ff4444" }}>AWAY</div>
          <div style={{ fontSize: "18rem", fontWeight: "bold", color: "#f00", lineHeight: 1 }}>{gameState.awayScore}</div>
        </div>

      </div>

      {/* 하단 경기 코드 정보 */}
      <div style={{ marginTop: "4rem", color: "#333", fontSize: "1.5rem" }}>GAME CODE: {id}</div>
    </main>
  );
}
