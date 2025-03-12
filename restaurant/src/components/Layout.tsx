import React from "react";
import { Outlet, Link } from "react-router-dom";
import WebSocketChat from "./WebSocketChat"; //WebSocket 채팅 컴포넌트 추가
import "./../styles/Layout.css";

const Layout: React.FC = () => {
  return (
    <div className="layout">
      {/* 🔹 공통 헤더 */}
      <header className="header">
        {/* ✅ FAST KERNEL을 클릭하면 홈("/")으로 이동 */}
        <h1>
          <Link to="/" className="logo-link">
            💻 FAST KERNEL
          </Link>
        </h1>

        <nav className="nav">
          <Link to="/" className="nav-link">
            🏠 홈
          </Link>
          <Link to="/restaurant/list" className="nav-link">
            🍽 식당 게시판
          </Link>
          <Link to="/rooms" className="nav-link">
            📅 회의실 예약
          </Link>
        </nav>
      </header>

      {/* 🔹 메인 컨테이너 */}
      <main className="main-container">
        {/* 🔹 메인 콘텐츠 영역 (라우트 출력) */}
        <div className="content">
          <Outlet /> {/* ✅ 라우트가 여기에 출력됨 */}
        </div>

        {/* 🔹 오른쪽 채팅창 */}
        <aside className="chatbox">
          <WebSocketChat />
        </aside>
      </main>

      {/* 🔹 공통 푸터 */}
      <footer className="footer">
        <p>© Be4 FAST KERNEL </p>
      </footer>
    </div>
  );
};

export default Layout;
