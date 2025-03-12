import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ navigate 추가
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/RestaurantForm.css";
import SearchBar from "./SearchBar";
import InputField from "./InputField";
import SearchKakaoMap from "./SearchKakaoMap";

const RestaurantForm: React.FC<{ isEditMode?: boolean; initialData?: any }> = ({
  isEditMode = false,
  initialData,
}) => {
  const navigate = useNavigate(); // ✅ 페이지 이동을 위한 네비게이션 훅
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

    if (!selectedPlace && !isEditMode) {
      alert("❌ 식당을 지도에서 선택해야 합니다!");
      return;
    }

    const createdAt = new Date().toISOString();

    const restaurantData = {
      title,
      content: reason,
      name,
      address: location,
      lat: selectedPlace?.position.lat ?? initialData?.lat,
      lng: selectedPlace?.position.lng ?? initialData?.lng,
      createdAt,
      password,
      category: null,
      tasteRating,
      speedRating,
      priceRating,
    };

    try {
      const response = await fetch("http://211.188.56.146:8080/restaurant", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restaurantData),
      });

      if (response.ok) {
        const responseData = await response.json(); // ✅ 응답 데이터 받기
        alert(`✅ 식당 추천이 ${isEditMode ? "수정" : "등록"}되었습니다!`);
        navigate(`/restaurant/${responseData.id}`, {
          state: { post: responseData },
        }); // ✅ 데이터와 함께 이동
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
        <InputField
          label="게시글 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="search-bar-container">
          <SearchBar onSearch={handleSearch} />
        </div>

        {showMap && !isEditMode && (
          <SearchKakaoMap
            searchQuery={searchQuery}
            onSelectPlace={setSelectedPlace}
          />
        )}
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
        <InputField
          label="추천 이유"
          type="textarea"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <InputField
          label="게시글 비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

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

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={!selectedPlace && !isEditMode}
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
