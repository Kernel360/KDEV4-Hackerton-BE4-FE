import React from "react";
import { Link } from "react-router-dom";
import "./../styles/Home.css"; // 홈 화면 전용 CSS 파일

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <h1>🍽 BE Commu - 맛집 & 회의실 예약</h1>
      <p>맛집 추천과 회의실 예약을 한 곳에서 편리하게 이용하세요!</p>

      <div className="home-links">
        <Link to="/add" className="home-button">
          🍽 식당 게시판 보기
        </Link>
        <Link to="/rooms" className="home-button">
          📅 회의실 예약하기
        </Link>
      </div>
    </div>
  );
};

export default Home;
