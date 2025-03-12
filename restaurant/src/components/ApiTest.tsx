import React, { useEffect, useState } from "react";
import api from "../api/axios";

interface Room {
  id: number;
  name: string;
  capacity: number;
  description: string;
}

const ApiTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] =
    useState<string>("테스트 중...");
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get<Room[]>("/rooms");
        setConnectionStatus("연결 성공!");
        setRooms(response.data);
        console.log("API 응답:", response.data);
      } catch (error) {
        setConnectionStatus("연결 실패");
        console.error("API 에러:", error);
      }
    };

    testConnection();
  }, []);

  return (
    <div>
      <h2>예약 시스템 API 연결 테스트</h2>
      <p>상태: {connectionStatus}</p>
      {rooms.length > 0 && (
        <div>
          <h3>회의실 목록:</h3>
          <ul>
            {rooms.map((room) => (
              <li key={room.id}>
                {room.name} - 수용 인원: {room.capacity}명
                <p>{room.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
