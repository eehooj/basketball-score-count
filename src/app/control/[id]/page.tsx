"use client";

import { useGame } from "@/hooks/useGame";
import { use } from "react";

export default function ControlPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { gameState, updateScore, updateTeamName, toggleTimer, updateTimer, resetShotClock, resetGame, nextPeriod } = useGame(id, true);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleNameChange = (team: "home" | "away") => {
    const currentName = team === "home" ? gameState.homeName : gameState.awayName;
    const newName = prompt("팀 이름을 입력하세요:", currentName);
    if (newName && newName.trim()) {
      updateTeamName(team, newName.trim());
    }
  };

  return (
    <main style={{ padding: "1rem", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>컨트롤러 (CODE: {id})</h2>

      {/* 쿼터 관리 섹션 */}
      <div style={{ backgroundColor: "#f0f0f0", padding: "1rem", borderRadius: "12px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>PERIOD {gameState.period}</div>
        <button onClick={() => {
          if(confirm("다음 쿼터로 넘어가시겠습니까? 현재 점수가 기록됩니다.")) nextPeriod();
        }} style={{ padding: "0.5rem 1rem", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "6px" }}>
          NEXT PERIOD
        </button>
      </div>

      {/* 점수 조작 섹션 */}
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "2rem", gap: "1rem" }}>
        {/* HOME 팀 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 
            onClick={() => handleNameChange("home")}
            style={{ color: "#0070f3", cursor: "pointer", textDecoration: "underline", margin: 0 }}
          >
            {gameState.homeName || "HOME"}
          </h3>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            backgroundColor: "#f8f9fa", 
            padding: "1rem", 
            borderRadius: "15px",
            border: "2px solid #0070f3"
          }}>
            <button 
              onClick={() => updateScore("home", 1)} 
              style={{ width: "100%", padding: "1rem", fontSize: "2rem", backgroundColor: "#0070f3", color: "white", borderRadius: "10px", border: "none" }}
            >
              ＋
            </button>
            <p style={{ fontSize: "4rem", fontWeight: "bold", margin: "0.5rem 0", color: "#333" }}>{gameState.homeScore}</p>
            <button 
              onClick={() => updateScore("home", -1)} 
              style={{ width: "100%", padding: "1rem", fontSize: "2rem", backgroundColor: "#eee", color: "#333", borderRadius: "10px", border: "1px solid #ccc" }}
            >
              －
            </button>
          </div>
        </div>

        {/* AWAY 팀 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 
            onClick={() => handleNameChange("away")}
            style={{ color: "#ff4444", cursor: "pointer", textDecoration: "underline", margin: 0 }}
          >
            {gameState.awayName || "AWAY"}
          </h3>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            backgroundColor: "#f8f9fa", 
            padding: "1rem", 
            borderRadius: "15px",
            border: "2px solid #ff4444"
          }}>
            <button 
              onClick={() => updateScore("away", 1)} 
              style={{ width: "100%", padding: "1rem", fontSize: "2rem", backgroundColor: "#ff4444", color: "white", borderRadius: "10px", border: "none" }}
            >
              ＋
            </button>
            <p style={{ fontSize: "4rem", fontWeight: "bold", margin: "0.5rem 0", color: "#333" }}>{gameState.awayScore}</p>
            <button 
              onClick={() => updateScore("away", -1)} 
              style={{ width: "100%", padding: "1rem", fontSize: "2rem", backgroundColor: "#eee", color: "#333", borderRadius: "10px", border: "1px solid #ccc" }}
            >
              －
            </button>
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
            flex: 1,
            padding: "1.5rem", 
            fontSize: "1.5rem", 
            backgroundColor: gameState.isRunning ? "#ff4444" : "#44ff44",
            color: gameState.isRunning ? "white" : "black",
            borderRadius: "10px",
            border: "none",
            fontWeight: "bold"
          }}>
            {gameState.isRunning ? "STOP" : "START"}
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
