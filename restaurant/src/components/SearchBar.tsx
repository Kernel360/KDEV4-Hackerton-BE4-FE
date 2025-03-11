import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState("");

  // 🔍 검색 실행 함수 (엔터 키 또는 버튼 클릭 시 실행)
  const handleSearch = () => {
    if (searchInput.trim() === "") return; // 빈 입력 방지
    onSearch(searchInput);
  };

  // 🔍 엔터 키 입력 감지
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // 기본 폼 제출 동작 방지
      handleSearch();
    }
  };

  return (
    <div className="input-group mb-3">
      <input
        type="text"
        className="form-control"
        placeholder="식당 이름 검색..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={handleKeyPress} // ✅ 엔터 키 입력 감지
      />
      <button className="btn btn-primary" onClick={handleSearch}>
        검색
      </button>
    </div>
  );
};

export default SearchBar;
