import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/RestaurantList.css"; // 스타일 파일

interface RestaurantPost {
  id: number;
  title: string;
  name: string;
}

const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurantPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ 게시글 목록 불러오기
  useEffect(() => {
    fetch("http://211.188.56.146:8080/restaurant/posts")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("게시글 목록 불러오기 실패:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading-text">⏳ 로딩 중...</p>;

  return (
    <div className="restaurant-list-container">
      <h2>🍽 식당 추천 목록</h2>
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
