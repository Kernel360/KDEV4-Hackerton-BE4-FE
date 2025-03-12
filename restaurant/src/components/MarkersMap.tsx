import React, { useState } from "react";
import { Map, MapMarker, useMap } from "react-kakao-maps-sdk";

interface Restaurant {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

interface MarkersMapProps {
  restaurants: Restaurant[];
}

const MarkersMap: React.FC<MarkersMapProps> = ({ restaurants }) => {
  const [center] = useState({
    lat: 37.497, // 🔽 기존보다 위도를 조금 줄임 → 지도가 아래로 이동
    lng: 127.0292473350472, // 🔄 경도는 그대로 유지
  });

  const EventMarkerContainer: React.FC<{
    position: { lat: number; lng: number };
    content: string;
  }> = ({ position, content }) => {
    const map = useMap();
    const [isVisible, setIsVisible] = useState(false);

    return (
      <MapMarker
        position={position}
        onClick={(marker) => map.panTo(marker.getPosition())}
        onMouseOver={() => setIsVisible(true)}
        onMouseOut={() => setIsVisible(false)}
      >
        {isVisible && (
          <div
            style={{
              color: "#000",
              background: "#fff",
              padding: "5px",
              borderRadius: "5px",
              boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            {content}
          </div>
        )}
      </MapMarker>
    );
  };

  return (
    <Map
      center={center}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
      level={3}
    >
      {restaurants.map((restaurant) => (
        <EventMarkerContainer
          key={restaurant.id}
          position={{ lat: restaurant.lat, lng: restaurant.lng }}
          content={restaurant.name}
        />
      ))}
    </Map>
  );
};

export default MarkersMap;
