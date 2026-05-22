"use client";

import { useGame } from "@/hooks/useGame";
import { use } from "react";

export default function ControlPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { gameState, updateScore, toggleTimer, updateTimer, resetShotClock, undo, resetGame } = useGame(id);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <main style={{ padding: "1rem", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>컨트롤러 (CODE: {id})</h2>

      {/* 점수 조작 섹션 */}
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#0070f3" }}>HOME</h3>
          <p style={{ fontSize: "3rem", fontWeight: "bold", margin: "0.5rem 0" }}>{gameState.homeScore}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
            <button onClick={() => updateScore("home", 1)} style={{ padding: "1.2rem", fontSize: "1.2rem" }}>+1</button>
            <button onClick={() => updateScore("home", 2)} style={{ padding: "1.2rem", fontSize: "1.2rem" }}>+2</button>
            <button onClick={() => updateScore("home", 3)} style={{ padding: "1.2rem", fontSize: "1.2rem" }}>+3</button>
          </div>
        </div>
        <div style={{ width: "20px" }}></div>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#ff4444" }}>AWAY</h3>
          <p style={{ fontSize: "3rem", fontWeight: "bold", margin: "0.5rem 0" }}>{gameState.awayScore}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
            <button onClick={() => updateScore("away", 1)} style={{ padding: "1.2rem", fontSize: "1.2rem" }}>+1</button>
            <button onClick={() => updateScore("away", 2)} style={{ padding: "1.2rem", fontSize: "1.2rem" }}>+2</button>
            <button onClick={() => updateScore("away", 3)} style={{ padding: "1.2rem", fontSize: "1.2rem" }}>+3</button>
          </div>
        </div>
      </div>

      {/* 24초 타이머 섹션 */}
      <div style={{ backgroundColor: "#333", color: "#ff0", padding: "1rem", borderRadius: "12px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "2.2rem", fontWeight: "bold", paddingLeft: "1rem", fontFamily: "monospace" }}>
          {gameState.shotClock}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => resetShotClock(24)} style={{ padding: "0.8rem 1rem", backgroundColor: "#ff0", color: "#000", fontWeight: "bold" }}>RESET 24</button>
          <button onClick={() => resetShotClock(14)} style={{ padding: "0.8rem 1rem", backgroundColor: "#ffaa00", color: "#000", fontWeight: "bold" }}>RESET 14</button>
        </div>
      </div>

      {/* 타이머 표시 및 메인 컨트롤 */}
      <div style={{ backgroundColor: "#eee", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem" }}>
        <div style={{ fontSize: "2.5rem", fontWeight: "bold", fontFamily: "monospace", marginBottom: "1rem" }}>
          {formatTime(gameState.timer)}
        </div>
        
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button onClick={() => updateTimer(300)} style={{ flex: 1, padding: "0.8rem", backgroundColor: "#666" }}>+5분</button>
          <button onClick={() => updateTimer(60)} style={{ flex: 1, padding: "0.8rem", backgroundColor: "#666" }}>+1분</button>
          <button onClick={() => updateTimer(-60)} style={{ flex: 1, padding: "0.8rem", backgroundColor: "#666" }}>-1분</button>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={toggleTimer} style={{ 
            flex: 2,
            padding: "1.5rem", 
            fontSize: "1.5rem", 
            backgroundColor: gameState.isRunning ? "#ff4444" : "#44ff44",
            color: gameState.isRunning ? "white" : "black"
          }}>
            {gameState.isRunning ? "STOP" : "START"}
          </button>
          <button onClick={undo} style={{ 
            flex: 1,
            padding: "1rem", 
            fontSize: "1.2rem", 
            backgroundColor: "#333", 
            color: "white" 
          }}>
            UNDO
          </button>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => {
          if(confirm("경기를 리셋하시겠습니까?")) resetGame();
        }} style={{ color: "#999", border: "none", background: "none", textDecoration: "underline" }}>
          경기 리셋
        </button>
      </div>
    </main>
  );
}
