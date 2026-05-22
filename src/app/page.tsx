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
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>농구 점수판</h1>
      <div style={{ margin: "2rem 0" }}>
        <button onClick={handleCreateGame} style={{ padding: "1rem", fontSize: "1.2rem" }}>
          새 경기 시작하기 (관리자)
        </button>
      </div>
      <div style={{ borderTop: "1px solid #ccc", paddingTop: "2rem" }}>
        <input
          type="text"
          placeholder="경기 코드 입력"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button onClick={handleJoinBoard} style={{ padding: "0.5rem" }}>
          점수판 입장 (패드용)
        </button>
      </div>
    </main>
  );
}
