import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MarkersMap from "../components/MarkersMap";
import RoomStatusPreview from "./RoomStatusPreview";
import "./../styles/Home.css";

interface Restaurant {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

const Home: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://211.188.56.146:8080/restaurant/posts")
      .then((res) => res.json())
      .then((data) => {
        const parsedData = data.map((restaurant: any) => ({
          id: restaurant.id,
          name: restaurant.name,
          lat: parseFloat(restaurant.lat),
          lng: parseFloat(restaurant.lng),
        }));

        console.log("📌 불러온 데이터:", parsedData);
        setRestaurants(parsedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("식당 데이터 불러오기 실패:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-container">
      <h1>👨🏻‍💻 Kernel Community 👩🏻‍💻</h1>
      <p>맛집 추천과 회의실 예약을 한 곳에서 편리하게 이용하세요!</p>

      {/* ✅ 지도 섹션 */}
      <div className="map-section">
        <div className="map-section-title">
          <h4>📌 동료들이 추천한 맛집 모음</h4>
          <button
            onClick={() => navigate("/restaurant/list")}
            className="details-button"
          >
            🔍 상세보기
          </button>
        </div>
        {loading ? (
          <p>⏳ 지도를 불러오는 중...</p>
        ) : (
          <MarkersMap restaurants={restaurants} />
        )}
      </div>

      {/* ✅ 회의실 현황 섹션 */}
      <div className="map-section">
        <div className="map-section-title">
          <h4>🏢 회의실 현황</h4>
          <button onClick={() => navigate("/rooms")} className="details-button">
            📅 예약하기
          </button>
        </div>
        <RoomStatusPreview />
      </div>
    </div>
  );
};

export default Home;
