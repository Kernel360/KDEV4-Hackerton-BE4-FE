import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/RestaurantDetail.css";

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
const renderStars = (rating: number) => (
  <span className="star-rating">
    {"⭐".repeat(rating)}
    {"☆".repeat(5 - rating)} ({rating}/5)
  </span>
);

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 초기 데이터: state에 있으면 사용, 없으면 null
  const [post, setPost] = useState<RestaurantPost | null>(
    location.state?.post || null
  );
  const [loading, setLoading] = useState(!post);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // ✅ 게시글 데이터 가져오기 (수정 후에도 최신 데이터 반영)
  const fetchPostData = () => {
    setLoading(true);
    fetch(`http://211.188.56.146:8080/restaurant/${id}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((error) => console.error("게시글 불러오기 실패:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!post) {
      fetchPostData(); // ✅ 페이지 처음 로딩 시 데이터 가져오기
    }
  }, [id]);

  // ✅ 수정 버튼 클릭 → 수정 후 이 화면으로 다시 돌아오면 최신 데이터 반영
  const handleEditClick = () => {
    if (post) {
      navigate(`/edit/${post.id}`, {
        state: { post },
      });
    }
  };

  // ✅ 수정 완료 후 최신 데이터 불러오기
  useEffect(() => {
    const handlePopState = () => fetchPostData();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ✅ 삭제 버튼 클릭 → 비밀번호 입력 요청
  const handleDeleteClick = () => {
    setShowPasswordModal(true);
  };

  // ✅ 비밀번호 입력 후 삭제 요청
  const handleDeleteConfirm = async () => {
    if (!password.trim()) {
      alert("❌ 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `http://211.188.56.146:8080/restaurant/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      if (response.ok) {
        alert("✅ 게시글이 삭제되었습니다.");
        navigate("/"); // 삭제 후 목록으로 이동
      } else {
        alert("❌ 삭제 실패! 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("❌ 서버 오류 발생.");
    } finally {
      setShowPasswordModal(false);
      setPassword("");
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
          {post.updatedAt ? new Date(post.updatedAt).toLocaleString() : "없음"}
        </p>
      </div>

      {/* 🗺 카카오 지도 추가 */}
      <div className="map-container">
        {post.lat && post.lng ? (
          <Map
            center={{ lat: post.lat, lng: post.lng }}
            className="map"
            level={3}
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
        <button className="btn btn-warning" onClick={handleEditClick}>
          ✏️ 수정
        </button>
        <button className="btn btn-danger" onClick={handleDeleteClick}>
          🗑 삭제
        </button>
      </div>

      {/* 🆕 비밀번호 입력 모달 */}
      {showPasswordModal && (
        <div className="password-modal">
          <div className="password-modal-content">
            <h4>🔒 비밀번호 입력</h4>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="form-control"
            />
            <div className="password-modal-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                취소
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                삭제 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
