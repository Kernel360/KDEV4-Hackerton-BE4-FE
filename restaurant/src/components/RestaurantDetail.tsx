import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Map, MapMarker } from "react-kakao-maps-sdk"; // 🆕 카카오 지도 추가
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/RestaurantDetail.css"; // 스타일 파일

interface RestaurantPost {
  id: number;
  title: string;
  content: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  tasteRating: number;
  priceRating: number;
  speedRating: number;
  createdAt: string;
  updatedAt?: string | null;
}

/* ⭐ 별점 표시 함수 */
const renderStars = (rating: number) => {
  const fullStars = "⭐".repeat(rating);
  const emptyStars = "☆".repeat(5 - rating);
  return (
    <span className="star-rating">
      {fullStars}
      {emptyStars} ({rating}/5)
    </span>
  );
};

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // URL에서 ID 가져오기
  const navigate = useNavigate();
  const [post, setPost] = useState<RestaurantPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/restaurants/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("게시글 불러오기 실패:", error);
        setLoading(false);
      });
  }, [id]);

  // 🔹 게시글 삭제 함수
  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`http://localhost:8080/restaurants/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("✅ 게시글이 삭제되었습니다.");
        navigate("/"); // 삭제 후 목록으로 이동
      } else {
        alert("❌ 삭제 실패!");
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("❌ 서버 오류 발생.");
    }
  };

  if (loading) return <p>⏳ 로딩 중...</p>;
  if (!post) return <p>❌ 게시글을 찾을 수 없습니다.</p>;

  return (
    <div className="restaurant-detail-container">
      <h2>📌 {post.title}</h2>
      <p className="content">{post.content}</p>

      <div className="info">
        <p>
          <strong>🏠 식당 이름:</strong> {post.name}
        </p>
        <p>
          <strong>📍 주소:</strong> {post.address}
        </p>
        <p>
          <strong>⭐ 맛 점수:</strong> {renderStars(post.tasteRating)}
        </p>
        <p>
          <strong>💰 가격 점수:</strong> {renderStars(post.priceRating)}
        </p>
        <p>
          <strong>⏳ 속도 점수:</strong> {renderStars(post.speedRating)}
        </p>
        <p>
          <strong>🕒 등록일:</strong>{" "}
          {new Date(post.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>📝 수정일:</strong>{" "}
          {post.updatedAt ? new Date(post.updatedAt).toLocaleString() : ""}
        </p>
      </div>

      {/* 🗺 카카오 지도 추가 (크기 및 마커 확인) */}
      <div className="map-container">
        <h4>📍 식당 위치</h4>
        {post.lat && post.lng ? (
          <Map
            center={{ lat: post.lat, lng: post.lng }}
            className="map"
            level={3} // 🔹 지도 확대 수준 조정
          >
            <MapMarker position={{ lat: post.lat, lng: post.lng }}>
              <div style={{ padding: "5px", color: "#000" }}>
                <strong>{post.name}</strong>
                <br />
                <a
                  href={`https://map.kakao.com/link/map/${post.name},${post.lat},${post.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "blue" }}
                >
                  큰 지도 보기
                </a>
              </div>
            </MapMarker>
          </Map>
        ) : (
          <p>⚠️ 지도 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      {/* 버튼 컨테이너 */}
      <div className="button-container">
        <button
          className="btn btn-warning"
          onClick={() => navigate(`/edit/${post.id}`)}
        >
          ✏️ 수정
        </button>
        <button className="btn btn-danger" onClick={handleDelete}>
          🗑 삭제
        </button>
      </div>
    </div>
  );
};

export default RestaurantDetail;
