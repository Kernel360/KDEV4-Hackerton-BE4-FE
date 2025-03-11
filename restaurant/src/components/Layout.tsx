import React from "react";
import { Outlet, Link } from "react-router-dom";
import WebSocketChat from "./WebSocketChat"; // 🔹 WebSocket 채팅 컴포넌트 추가
import "./../styles/Layout.css";

const Layout: React.FC = () => {
  return (
    <div className="layout">
      {/* 🔹 공통 헤더 */}
      <header className="header">
        <h1>BE4 </h1>
        <nav className="nav">
          <Link to="/" className="nav-link">
            🏠 홈
          </Link>
          <Link to="/add" className="nav-link">
            ➕ 추천 등록
          </Link>
          <Link to="/rooms" className="nav-link">
            📅 회의실 예약
          </Link>{" "}
          {/* ✅ 추가된 네비게이션 */}
        </nav>
      </header>

      {/* 🔹 메인 컨테이너 */}
      <div className="main-container">
        {/* 🔹 메인 콘텐츠 영역 (라우트 출력) */}
        <main className="content">
          <Outlet /> {/* ✅ 라우트가 여기에 출력됨 */}
        </main>

        {/* 🔹 오른쪽 채팅창 */}
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
