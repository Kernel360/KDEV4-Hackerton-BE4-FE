import React, { useState, useEffect } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ 부트스트랩 적용
import "./../styles/SearchKakaoMap.css"; // ✅ CSS 파일 분리

interface Props {
  searchQuery: string;
  onSelectPlace: (place: {
    name: string;
    location: string;
    position: { lat: number; lng: number };
  }) => void;
}

const SearchKakaoMap: React.FC<Props> = ({ searchQuery, onSelectPlace }) => {
  const [markers, setMarkers] = useState<
    { position: { lat: number; lng: number }; content: string }[]
  >([]);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);

  // ✅ 초기 지도 중심 좌표 (서울 강남구 역삼동 826-21)
  const [center] = useState<{ lat: number; lng: number }>({
    lat: 37.499590490909185,
    lng: 127.02924733504722,
  });

  useEffect(() => {
    if (!map || !searchQuery) return;

    const ps = new kakao.maps.services.Places();
    const bounds = new kakao.maps.LatLngBounds();

    // ✅ 검색 시 강남구 역삼동을 중심으로 검색하도록 설정
    ps.keywordSearch(
      searchQuery,
      (data: kakao.maps.services.PlacesSearchResult, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const newMarkers = data.map((place) => ({
            position: { lat: Number(place.y), lng: Number(place.x) },
            content: place.place_name,
          }));

          newMarkers.forEach((marker) =>
            bounds.extend(
              new kakao.maps.LatLng(marker.position.lat, marker.position.lng)
            )
          );

          setMarkers(newMarkers);
          map.setBounds(bounds); // 검색 결과를 지도에 맞게 확대
        }
      },
      {
        location: new kakao.maps.LatLng(37.49554878921157, 127.0292913001903), // ✅ 검색 기준 위치
        radius: 300, // ✅ 반경 2km 이내에서 검색
      }
    );
  }, [map, searchQuery]);

  // 🏠 마커 클릭 시 좌표 → 주소 변환
  const handleMarkerClick = (marker: {
    position: { lat: number; lng: number };
    content: string;
  }) => {
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.coord2Address(
      marker.position.lng,
      marker.position.lat,
      (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const address = result[0].road_address
            ? result[0].road_address.address_name
            : result[0].address.address_name;
          onSelectPlace({
            name: marker.content,
            location: address,
            position: marker.position,
          });
        } else {
          console.error("주소 변환 실패");
        }
      }
    );
  };

  return (
    <div className="map-card">
      <h5 className="map-title">📍 지도에서 가게 마커 선택</h5>

      <div className="map-container">
        <Map
          center={center}
          style={{ width: "100%", height: "100%" }}
          level={3}
          onCreate={setMap}
        >
          {markers.map((marker) => (
            <MapMarker
              key={marker.content}
              position={marker.position}
              onClick={() => handleMarkerClick(marker)}
            >
              <div className="marker-info">{marker.content}</div>
            </MapMarker>
          ))}
        </Map>
      </div>
    </div>
  );
};

export default SearchKakaoMap;
