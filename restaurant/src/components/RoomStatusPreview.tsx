import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/RoomList.css";
import "../styles/RoomStatusPreview.css";

interface Room {
  id: number;
  name: string;
}

interface RoomStatus {
  roomId: number;
  status: string;
  isAvailable: boolean;
  roomName: string;
}

const RoomStatusPreview: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    try {
      const response = await api.get<Room[]>("/rooms");
      setRooms(response.data);
      updateRoomStatus(response.data);
    } catch (err) {
      console.error("회의실 목록 조회 실패:", err);
    }
  };

  const updateRoomStatus = async (loadedRooms: Room[]) => {
    if (loadedRooms.length === 0) return;

    try {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);

      const newStatuses: RoomStatus[] = [];

      for (const room of loadedRooms) {
        const response = await api.get(`/room/${room.id}/reservations`);
        const reservations = response.data;

        const todayReservations = reservations.filter(
          (res: any) => res.reservationDate === today
        );

        const currentReservation = todayReservations.find((res: any) => {
          const [startHour, startMinute] = res.startTime.split(":").map(Number);
          const [endHour, endMinute] = res.endTime.split(":").map(Number);
          const [currentHour, currentMinute] = currentTime
            .split(":")
            .map(Number);

          const start = startHour * 60 + startMinute;
          const end = endHour * 60 + endMinute;
          const current = currentHour * 60 + currentMinute;

          return current >= start && current < end;
        });

        const nextReservation = todayReservations
          .filter((res: any) => {
            const [startHour, startMinute] = res.startTime
              .split(":")
              .map(Number);
            const [currentHour, currentMinute] = currentTime
              .split(":")
              .map(Number);
            return (
              startHour * 60 + startMinute > currentHour * 60 + currentMinute
            );
          })
          .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))[0];

        let statusText = "사용 가능";
        let isAvailable = true;

        if (currentReservation) {
          statusText = `사용 중 (~${currentReservation.endTime})`;
          isAvailable = false;
        } else if (nextReservation) {
          statusText = `다음 예약: ${nextReservation.startTime}`;
        }

        newStatuses.push({
          roomId: room.id,
          status: statusText,
          isAvailable: isAvailable,
          roomName: room.name,
        });
      }

      setRoomStatuses(newStatuses);
    } catch (err) {
      console.error("회의실 상태 업데이트 실패:", err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await loadRooms();
      setLoading(false);
    };

    initialize();

    let interval: NodeJS.Timeout;
    setTimeout(() => {
      if (rooms.length > 0) {
        interval = setInterval(() => updateRoomStatus(rooms), 60000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="room-preview-container">
      <div className="room-grid">
        {rooms.map((room) => {
          const status = roomStatuses.find((s) => s.roomId === room.id);
          return (
            <div
              key={room.id}
              className={`room-box ${
                status?.isAvailable ? "available" : "reserved"
              }`}
            >
              <h6>{room.name}</h6>
              <div className="status">
                {status?.status || "상태 확인 중..."}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomStatusPreview;
