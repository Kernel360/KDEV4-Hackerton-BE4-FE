import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/RestaurantForm.css"; // 스타일 파일
import InputField from "./InputField";

const RestaurantEditForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const post = location.state?.post; // ✅ 이전 화면에서 넘겨준 데이터 가져오기

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [password, setPassword] = useState(""); // 🔒 비밀번호 입력 필드 추가
  const [category, setCategory] = useState(post?.category || "한식"); // ✅ 기본 카테고리 설정
  const [tasteRating, setTasteRating] = useState(post?.tasteRating || 3);
  const [priceRating, setPriceRating] = useState(post?.priceRating || 3);
  const [speedRating, setSpeedRating] = useState(post?.speedRating || 3);

  // ✅ 수정 요청 (비밀번호 포함)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      alert("❌ 비밀번호를 입력해주세요.");
      return;
    }

    // ✅ 서버에 보낼 데이터 (백엔드 DTO와 일치하도록 변경)
    const updatedData = {
      title,
      content,
      updatedAt: new Date().toISOString(), // ✅ 수정 날짜 자동 업데이트
      password,
      category,
      tasteRating,
      speedRating,
      priceRating,
    };

    try {
      const response = await fetch(
        `http://localhost:8080/restaurant/${post.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.status === 200) {
        alert("✅ 게시글이 수정되었습니다.");
        navigate(`/restaurant/${post.id}`);
      } else if (response.status === 403) {
        alert("❌ 비밀번호가 틀렸습니다. 다시 입력해주세요.");
        setPassword(""); // 비밀번호 필드 초기화
      } else {
        alert("❌ 수정 실패! 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("수정 실패:", error);
      alert("❌ 서버 오류 발생.");
    }
  };

  if (!post) return <p>⏳ 로딩 중...</p>;

  return (
    <div className="restaurant-form-container">
      <h2>✏️ 식당 게시글 수정</h2>

      <form onSubmit={handleSubmit}>
        {/* 🆕 게시글 제목 입력 */}
        <InputField
          label="게시글 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* 🔒 수정 불가능한 필드 */}
        <InputField label="식당 이름" value={post.name} disabled />
        <InputField label="주소" value={post.address} disabled />

        {/* 📝 추천 이유 수정 가능 */}
        <InputField
          label="추천 이유"
          type="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        {/* 🔹 카테고리 선택 */}
        <div className="form-group">
          <label>카테고리</label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="한식">한식</option>
            <option value="중식">중식</option>
            <option value="일식">일식</option>
            <option value="양식">양식</option>
            <option value="패스트푸드">패스트푸드</option>
          </select>
        </div>

        {/* ⭐ 별점 수정 가능 */}
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

        {/* 🔒 비밀번호 입력 필드 */}
        <InputField
          label="🔒 비밀번호 입력"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary w-100">
          수정 완료
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

export default RestaurantEditForm;
