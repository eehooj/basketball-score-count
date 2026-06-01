"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleCreateGame = () => {
    const newId = Math.random().toString(36).substring(2, 8);
    router.push(`/control/${newId}`);
  };

  const handleJoinBoard = () => {
    if (roomId) router.push(`/board/${roomId}`);
  };

  return (
    <main style={{ 
      padding: "2rem", 
      textAlign: "center", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "80vh" 
    }}>
      <h1 style={{ marginBottom: "3rem" }}>🏀 농구 점수판</h1>
      
      <div style={{ marginBottom: "4rem", width: "100%", maxWidth: "400px" }}>
        <button 
          type="button"
          onClick={handleCreateGame} 
          style={{ 
            width: "100%",
            padding: "1.5rem", 
            fontSize: "1.3rem", 
            backgroundColor: "#0070f3", 
            color: "white", 
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            WebkitTapHighlightColor: "transparent"
          }}
        >
          새 경기 시작 (관리자)
        </button>
      </div>

      <div style={{ 
        borderTop: "1px solid #eee", 
        paddingTop: "3rem", 
        width: "100%", 
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <h3 style={{ color: "#666", marginBottom: "0.5rem" }}>이미 진행 중인 경기에 참여</h3>
        <input
          type="text"
          placeholder="경기 코드 입력 (예: x2b4s1)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ 
            padding: "1rem", 
            fontSize: "1.1rem", 
            borderRadius: "8px", 
            border: "2px solid #ddd",
            textAlign: "center"
          }}
        />
        <button 
          type="button"
          onClick={handleJoinBoard} 
          style={{ 
            padding: "1.2rem", 
            fontSize: "1.1rem",
            backgroundColor: "#333",
            color: "white",
            borderRadius: "8px",
            WebkitTapHighlightColor: "transparent"
          }}
        >
          점수판 화면 입장
        </button>
      </div>
    </main>
  );
}
