import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/RestaurantList.css"; // 스타일 파일
import MarkersMap from "../components/MarkersMap"; // ✅ 지도 컴포넌트 추가

interface RestaurantPost {
  id: number;
  title: string;
  name: string;
  lat: number; // ✅ 추가
  lng: number; // ✅ 추가
}

const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurantPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ 게시글 목록 불러오기
  useEffect(() => {
    fetch("http://211.188.56.146:8080/restaurant/posts")
      .then((res) => res.json())
      .then((data: RestaurantPost[]) => {
        const parsedData = data.map((restaurant: RestaurantPost) => ({
          ...restaurant,
          lat: parseFloat(String(restaurant.lat)), // ✅ 타입 안전하게 변환
          lng: parseFloat(String(restaurant.lng)),
        }));

        console.log("📌 변환된 데이터:", parsedData);
        setRestaurants(parsedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("식당 목록 불러오기 실패:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading-text">⏳ 로딩 중...</p>;

  return (
    <div className="restaurant-list-container">
      <div className="restaurant-header">
        <h2>🍽 식당 추천 목록</h2>
        {/* ✅ 게시글 추가 버튼 */}
        <button
          className="add-button"
          onClick={() => navigate("/restaurant/add")}
        >
          ➕ 게시글 추가
        </button>
      </div>

      {/* ✅ 지도 추가 (식당 목록 데이터를 지도에 전달) */}
      <MarkersMap restaurants={restaurants} />

      <ul className="restaurant-list">
        {restaurants.map((post) => (
          <li
            key={post.id}
            className="restaurant-item"
            onClick={() => navigate(`/restaurant/${post.id}`)}
          >
            <span className="title">📌 {post.title}</span>
            <span className="name">🏠 {post.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RestaurantList;
