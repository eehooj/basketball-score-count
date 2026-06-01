"use client";

import { useGame } from "@/hooks/useGame";
import { use, useEffect, useState, useCallback } from "react";

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { gameState } = useGame(id);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 전자 버저음 생성 및 재생 함수
  const playBuzzer = useCallback(() => {
    if (typeof window === "undefined") return;
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
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
      {/* 사운드 활성화 버튼 */}
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

      {/* 쿼터 점수 기록 팝업 (오버레이) */}
      {showHistory && (
        <div 
          onClick={() => setShowHistory(false)}
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 90
          }}
        >
          <div style={{ 
            backgroundColor: "#222", 
            padding: "3rem", 
            borderRadius: "20px", 
            minWidth: "400px",
            border: "2px solid #444"
          }}>
            <h2 style={{ textAlign: "center", color: "#ff0", marginBottom: "2rem", fontSize: "2.5rem" }}>PERIOD SCORES</h2>
            <table style={{ width: "100%", fontSize: "2rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #444" }}>
                  <th style={{ padding: "1rem" }}>PER</th>
                  <th style={{ padding: "1rem", color: "#0070f3" }}>{gameState.homeName || "HOME"}</th>
                  <th style={{ padding: "1rem", color: "#ff4444" }}>{gameState.awayName || "AWAY"}</th>
                </tr>
              </thead>
              <tbody>
                {(gameState.periodScores || []).map((score, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #333", textAlign: "center" }}>
                    <td style={{ padding: "1rem" }}>{index + 1}Q</td>
                    <td style={{ padding: "1rem" }}>{score.home}</td>
                    <td style={{ padding: "1rem" }}>{score.away}</td>
                  </tr>
                ))}
                {/* 현재 진행 중인 쿼터 점수 */}
                <tr style={{ textAlign: "center", color: "#aaa" }}>
                  <td style={{ padding: "1rem" }}>{gameState.period}Q*</td>
                  <td style={{ padding: "1rem" }}>{gameState.homeScore}</td>
                  <td style={{ padding: "1rem" }}>{gameState.awayScore}</td>
                </tr>
              </tbody>
            </table>
            <p style={{ textAlign: "center", marginTop: "2rem", color: "#666" }}>화면을 클릭하면 닫힙니다.</p>
          </div>
        </div>
      )}

      {/* 상단 정보 (쿼터 등) - 클릭 시 히스토리 토글 */}
      <div 
        onClick={() => setShowHistory(true)}
        style={{ 
          fontSize: "3rem", 
          marginBottom: "1rem", 
          color: "#aaa", 
          cursor: "pointer",
          border: "1px solid #333",
          padding: "0.5rem 2rem",
          borderRadius: "10px"
        }}
      >
        PERIOD {gameState.period} <span style={{ fontSize: "1.2rem", color: "#555" }}>(Click for Info)</span>
      </div>
      
      {/* 메인 점수판 레이아웃 */}
      <div style={{ display: "flex", gap: "5rem", alignItems: "center", justifyContent: "center", width: "100%" }}>
        
        {/* HOME 팀 */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "4rem", color: "#0070f3" }}>{gameState.homeName || "HOME"}</div>
          <div style={{ fontSize: "18rem", fontWeight: "bold", color: "#f00", lineHeight: 1 }}>{gameState.homeScore}</div>
        </div>

        {/* 중앙 타이머 섹션 */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
          <div style={{ fontSize: "12rem", lineHeight: 1, color: "#fff" }}>{formatTime(gameState.timer)}</div>
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
          <div style={{ fontSize: "4rem", color: "#ff4444" }}>{gameState.awayName || "AWAY"}</div>
          <div style={{ fontSize: "18rem", fontWeight: "bold", color: "#f00", lineHeight: 1 }}>{gameState.awayScore}</div>
        </div>

      </div>

      <div style={{ marginTop: "4rem", color: "#333", fontSize: "1.5rem" }}>GAME CODE: {id}</div>
    </main>
  );
}
