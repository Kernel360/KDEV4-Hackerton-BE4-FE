import React from "react";
import { Outlet, Link } from "react-router-dom";
import WebSocketChat from "./WebSocketChat"; // 🔹 WebSocket 채팅 컴포넌트 추가
import "./../styles/Layout.css";

const Layout: React.FC = () => {
  return (
    <div className="layout">
      {/* 🔹 공통 헤더 */}
      <header className="header">
        <h1>🍽 맛집 추천</h1>
        <nav>
          <Link to="/">🏠 홈</Link>
          <Link to="/add">➕ 추천 등록</Link>
        </nav>
      </header>

      <div className="main-container">
        {/* 🔹 메인 콘텐츠 영역 */}
        <main className="content">
          <Outlet />
        </main>

        {/* 🔹 오른쪽 채팅창 (WebSocket 채팅 컴포넌트) */}
        <aside className="chatbox">
          <WebSocketChat />
        </aside>
      </div>

      {/* 🔹 공통 푸터 */}
      <footer className="footer">
        <p>© 2025 맛집 추천 서비스 | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Layout;
