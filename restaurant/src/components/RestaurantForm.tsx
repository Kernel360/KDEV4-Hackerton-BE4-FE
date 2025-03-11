import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/RestaurantForm.css"; // 스타일 파일
import SearchBar from "./SearchBar";
import InputField from "./InputField";
import SearchKakaoMap from "./SearchKakaoMap";

interface RestaurantFormProps {
  isEditMode?: boolean;
  initialData?: {
    id: number;
    title?: string;
    name: string;
    location: string;
    reason: string;
    lat: number;
    lng: number;
    password?: string;
    speedRating?: number;
    priceRating?: number;
    tasteRating?: number;
    createdAt?: string;
  };
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({
  isEditMode = false,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [name, setName] = useState(initialData?.name || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [reason, setReason] = useState(initialData?.reason || "");
  const [password, setPassword] = useState(initialData?.password || "");
  const [speedRating, setSpeedRating] = useState(initialData?.speedRating || 3);
  const [priceRating, setPriceRating] = useState(initialData?.priceRating || 3);
  const [tasteRating, setTasteRating] = useState(initialData?.tasteRating || 3);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    location: string;
    position: { lat: number; lng: number };
  } | null>(null);
  const [showMap, setShowMap] = useState(false);

  // 🔹 지도에서 선택된 장소의 정보를 업데이트
  useEffect(() => {
    if (selectedPlace) {
      setName(selectedPlace.name || "");
      setLocation(selectedPlace.location || "");
    }
  }, [selectedPlace]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowMap(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlace) {
      alert("❌ 식당을 지도에서 선택해야 합니다!");
      return;
    }

    // ✅ 현재 시간을 ISO 8601 형식으로 변환
    const createdAt = new Date().toISOString();

    // ✅ 서버로 보낼 데이터 객체
    const restaurantData = {
      title,
      name,
      location,
      comment: reason, // 🆕 추천 이유 필드명을 `comment`로 변경
      password,
      tasteRating,
      priceRating,
      speedRating,
      lat: selectedPlace?.position.lat ?? initialData?.lat, // 🔹 값이 없으면 기존 데이터 유지
      lng: selectedPlace?.position.lng ?? initialData?.lng,
      createdAt, // ✅ 현재 시간 추가
    };

    try {
      const response = await fetch(
        isEditMode
          ? `http://localhost:8080/restaurants/${initialData?.id}`
          : "http://localhost:8080/restaurants",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(restaurantData),
        }
      );

      if (response.ok) {
        alert(`✅ 식당 추천이 ${isEditMode ? "수정" : "등록"}되었습니다!`);
      } else {
        alert(`❌ ${isEditMode ? "수정" : "등록"}에 실패했습니다.`);
      }
    } catch (error) {
      console.error(`${isEditMode ? "수정" : "등록"} 실패:`, error);
      alert("❌ 서버 오류 발생. 나중에 다시 시도해주세요.");
    }
  };

  return (
    <div className="restaurant-form-container">
      <h2>{isEditMode ? "🍽 식당 정보 수정" : "🍽 식당 추천하기"}</h2>

      <form onSubmit={handleSubmit}>
        {/* 🆕 게시글 제목 입력 */}
        <div className="form-group">
          <InputField
            label="게시글 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* 🔹 검색 바 위쪽에 간격 추가 */}
        <div className="search-bar-container">
          <SearchBar onSearch={handleSearch} />
        </div>

        {showMap && (
          <SearchKakaoMap
            searchQuery={searchQuery}
            onSelectPlace={setSelectedPlace}
          />
        )}

        {/* 🔒 이름 & 위치는 항상 비활성화 상태 */}
        <InputField
          label="식당 이름"
          value={name}
          onChange={() => {}}
          disabled
        />
        <InputField
          label="위치"
          value={location}
          onChange={() => {}}
          disabled
        />

        {/* 📝 추천 이유 */}
        <InputField
          label="추천 이유"
          type="textarea"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        {/* 비밀번호 입력 */}
        <InputField
          label="게시글 비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={4}
          maxLength={6}
          required
        />

        {/* ⭐ 별점 선택 UI */}
        <RatingInput
          label="🍽 음식 나오는 속도"
          rating={speedRating}
          setRating={setSpeedRating}
        />
        <RatingInput
          label="💰 가격"
          rating={priceRating}
          setRating={setPriceRating}
        />
        <RatingInput
          label="😋 맛"
          rating={tasteRating}
          setRating={setTasteRating}
        />

        {/* 🔒 지도에서 선택하지 않으면 제출 불가 */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={!selectedPlace}
        >
          {isEditMode ? "수정 완료" : "게시글 올리기"}
        </button>
      </form>
    </div>
  );
};

/**
 * ⭐ 별점 입력 컴포넌트
 */
const RatingInput: React.FC<{
  label: string;
  rating: number;
  setRating: (value: number) => void;
}> = ({ label, rating, setRating }) => {
  return (
    <div className="rating-container">
      <label>{label}</label>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            className={num <= rating ? "star selected" : "star"}
            onClick={() => setRating(num)}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
};

export default RestaurantForm;
