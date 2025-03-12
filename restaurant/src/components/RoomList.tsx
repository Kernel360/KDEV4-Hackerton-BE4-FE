import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ CSS만 사용 시
import "bootstrap/dist/js/bootstrap.bundle.min"; // ✅ JS 기능도 필요할 경우 추가
import Modal from "react-bootstrap/Modal";
import { Tab, Tabs } from "react-bootstrap";
import "../styles/RoomList.css"; // CSS 파일 import 확인

interface Room {
  id: number;
  name: string;
}

interface Team {
  id: number;
  teamName: string;
}

interface Reservation {
  id: number;
  room: Room;
  team: Team;
  reservationDate: string;
  startTime: string;
  endTime: string;
}

interface RoomStatus {
  roomId: number;
  status: string;
  isAvailable: boolean;
  teamName?: string;
  roomName: string;
}

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [formData, setFormData] = useState({
    teamId: "",
    reservationDate: "",
    startTime: "",
    endTime: "",
    password: "",
  });
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  // 날짜 포맷팅 함수
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 시간 포맷팅 함수
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  // 회의실 목록 및 상태 조회
  const loadRooms = async () => {
    try {
      const response = await api.get<Room[]>("/rooms");
      setRooms(response.data);
      updateRoomStatus();
    } catch (err) {
      console.error("회의실 목록 조회 실패:", err);
    }
  };

  // 팀 목록 조회
  const loadTeams = async () => {
    try {
      const response = await api.get<Team[]>("/teams");
      setTeams(response.data);
    } catch (err) {
      console.error("팀 목록 조회 실패:", err);
    }
  };

  // 예약 현황 조회
  const loadReservations = async () => {
    try {
      const allReservations: Reservation[] = [];
      for (const room of rooms) {
        const response = await api.get<Reservation[]>(
          `/room/${room.id}/reservations`
        );
        allReservations.push(...response.data);
      }
      setReservations(allReservations);
      updateRoomStatus();
    } catch (err) {
      console.error("예약 현황 조회 실패:", err);
    }
  };

  // 회의실 상태 업데이트
  const updateRoomStatus = async () => {
    if (rooms.length === 0) return; // ✅ rooms가 없으면 실행하지 않음.

    try {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);

      const newStatuses: RoomStatus[] = [];

      for (const room of rooms) {
        const response = await api.get<Reservation[]>(
          `/room/${room.id}/reservations`
        );
        const reservations = response.data;

        const todayReservations = reservations.filter(
          (res) => res.reservationDate === today
        );

        const currentReservation = todayReservations.find((res) => {
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
          .filter((res) => {
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
          .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

        let statusText = "사용 가능";
        let isAvailable = true;

        if (currentReservation) {
          statusText = `사용 중 (예약팀: ${
            currentReservation.team.teamName
          }, ~${formatTime(currentReservation.endTime)})`;
          isAvailable = false;
        } else if (nextReservation) {
          statusText = `사용 가능 (다음 예약: ${formatTime(
            nextReservation.startTime
          )})`;
        }

        newStatuses.push({
          roomId: room.id,
          status: statusText,
          isAvailable: isAvailable,
          roomName: room.roomName,
        });
      }

      setRoomStatuses(newStatuses);
    } catch (err) {
      console.error("회의실 상태 업데이트 실패:", err);
    }
  };

  // 시간 유효성 검사 함수
  const validateTimes = async (
    startTime: string,
    endTime: string,
    roomId: number,
    reservationDate: string
  ) => {
    // 시간을 분으로 변환하여 비교
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    // 운영 시간 검사 (09:00 ~ 20:00)
    const operatingStart = 9 * 60; // 09:00
    const operatingEnd = 20 * 60; // 20:00

    if (start < operatingStart || end > operatingEnd) {
      alert("에러: 운영 시간 제한\n\n회의실 운영 시간은 09:00~20:00입니다.");
      return false;
    }

    // 기본 유효성 검사
    if (end <= start) {
      alert("에러: 예약 시간 제한\n\n종료 시간은 시작 시간보다 뒤여야 합니다.");
      return false;
    }

    const duration = end - start;
    if (duration < 60) {
      alert("에러: 예약 시간 제한\n\n최소 1시간 이상 예약해야 합니다.");
      return false;
    }

    try {
      // 예약 가능 여부 확인 API 호출
      const params = new URLSearchParams({
        date: reservationDate,
        startTime: startTime,
        endTime: endTime,
        teamId: formData.teamId,
      });

      // 수정 시에는 기존 예약 ID를 파라미터로 추가
      if (selectedReservation) {
        params.append(
          "excludeReservationId",
          selectedReservation.id.toString()
        );
      }

      const checkResponse = await api.get(
        `/room/${roomId}/check?${params.toString()}`
      );
      return true;
    } catch (error) {
      console.error("예약 가능 여부 확인 오류:", error);
      alert(
        "에러: " + (error as any).response?.data ||
          "예약 가능 여부 확인 중 오류가 발생했습니다."
      );
      return false;
    }
  };

  // 예약 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    // 시간 유효성 검사
    if (
      !(await validateTimes(
        formData.startTime,
        formData.endTime,
        selectedRoom.id,
        formData.reservationDate
      ))
    ) {
      return;
    }

    try {
      let response;
      if (selectedReservation) {
        // 예약 수정
        response = await api.put(
          `/room/${selectedRoom.id}/reservation/${selectedReservation.id}`,
          formData
        );
      } else {
        // 새로운 예약
        response = await api.post(`/room/${selectedRoom.id}`, formData);
      }

      if (response.status === 200) {
        alert(
          selectedReservation
            ? "예약이 수정되었습니다."
            : "예약이 완료되었습니다."
        );
        setShowModal(false);
        setSelectedReservation(null);
        setFormData({
          teamId: "",
          reservationDate: "",
          startTime: "",
          endTime: "",
          password: "",
        });
        loadReservations();
        updateRoomStatus();
      }
    } catch (err) {
      console.error(
        selectedReservation ? "예약 수정 실패:" : "예약 실패:",
        err
      );
      alert(
        selectedReservation
          ? "예약 수정에 실패했습니다."
          : "예약에 실패했습니다."
      );
    }
  };

  // 시간 선택 핸들러
  const handleTimeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // 종료 시간을 선택할 때만 유효성 검사 실행
    if (
      name === "endTime" &&
      value &&
      newFormData.startTime &&
      selectedRoom &&
      newFormData.reservationDate
    ) {
      await validateTimes(
        newFormData.startTime,
        value,
        selectedRoom.id,
        newFormData.reservationDate
      );
    }
  };

  // 예약 취소
  const handleCancelReservation = async (
    roomId: number,
    reservationId: number
  ) => {
    const password = prompt("예약 취소를 위한 비밀번호를 입력하세요:");
    if (!password) return;

    try {
      await api.delete(
        `/room/${roomId}/reservation/${reservationId}?password=${password}`
      );
      alert("예약이 취소되었습니다.");
      loadReservations();
      updateRoomStatus();
    } catch (err) {
      console.error("예약 취소 실패:", err);
      alert("예약 취소에 실패했습니다.");
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await loadRooms();
      await loadTeams();
      await loadReservations();
      setLoading(false);
    };

    initialize();

    let interval: NodeJS.Timeout;
    setTimeout(() => {
      if (rooms.length > 0) {
        interval = setInterval(updateRoomStatus, 60000);
      }
    }, 1000); // ✅ 1초 후 실행하여 rooms가 로드될 시간을 줌.

    return () => clearInterval(interval);
  }, []);

  // rooms가 변경될 때마다 상태 업데이트
  useEffect(() => {
    if (rooms.length > 0) {
      updateRoomStatus();
    }
  }, [rooms]);

  // reservations가 변경될 때마다 상태 업데이트
  useEffect(() => {
    if (reservations.length > 0) {
      updateRoomStatus();
    }
  }, [reservations]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="container">
      <Tabs defaultActiveKey="rooms" className="mb-3" unmountOnExit={false}>
        <Tab eventKey="rooms" title="📝 회의실 현황">
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
                  <h3>{room.name}</h3>
                  <p>{status?.roomName || "회의실 이름 없음"}</p>
                  <div className="status">
                    {status?.status || "상태 확인 중..."}
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowModal(true);
                    }}
                  >
                    예약하기
                  </button>
                </div>
              );
            })}
          </div>
        </Tab>

        <Tab
          eventKey="reservations"
          title="📅  예약 취소/수정"
          onEnter={loadReservations}
        >
          <div className="mb-4 p-3 border rounded bg-light">
            <div className="d-flex align-items-center gap-3">
              <label htmlFor="filterDate" className="form-label mb-0 fw-bold">
                날짜별 조회:
              </label>
              <input
                type="date"
                id="filterDate"
                className="form-control"
                style={{ width: "auto", fontSize: "16px" }}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => setFilterDate("")}
              >
                전체 보기
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "15%" }}>회의실</th>
                  <th style={{ width: "20%" }}>팀</th>
                  <th style={{ width: "20%" }}>날짜</th>
                  <th style={{ width: "15%" }}>시작 시간</th>
                  <th style={{ width: "15%" }}>종료 시간</th>
                  <th style={{ width: "15%" }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {(filterDate
                  ? reservations.filter((r) => r.reservationDate === filterDate)
                  : reservations
                ).map((reservation) => {
                  const now = new Date();
                  const reservationDate = new Date(reservation.reservationDate);
                  const startTime = reservation.startTime
                    .split(":")
                    .map(Number);
                  const endTime = reservation.endTime.split(":").map(Number);

                  const reservationStart = new Date(reservationDate);
                  reservationStart.setHours(startTime[0], startTime[1]);

                  const reservationEnd = new Date(reservationDate);
                  reservationEnd.setHours(endTime[0], endTime[1]);

                  const isActive =
                    now >= reservationStart && now < reservationEnd;
                  const isPast = now > reservationEnd;

                  return (
                    <tr
                      key={reservation.id}
                      className={
                        isActive
                          ? "table-primary"
                          : isPast
                          ? "table-secondary"
                          : ""
                      }
                    >
                      <td>{reservation.room.roomName}</td>
                      <td>{reservation.team.teamName}</td>
                      <td>{formatDate(reservation.reservationDate)}</td>
                      <td>{formatTime(reservation.startTime)}</td>
                      <td>{formatTime(reservation.endTime)}</td>
                      <td>
                        {!isPast && (
                          <>
                            <button
                              className="btn btn-sm btn-danger me-1"
                              onClick={() =>
                                handleCancelReservation(
                                  reservation.room.id,
                                  reservation.id
                                )
                              }
                            >
                              취소
                            </button>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setSelectedRoom(reservation.room);
                                setSelectedReservation(reservation);
                                setFormData({
                                  ...formData,
                                  teamId: reservation.team.id.toString(),
                                  reservationDate: reservation.reservationDate,
                                  startTime: reservation.startTime,
                                  endTime: reservation.endTime,
                                });
                                setShowModal(true);
                              }}
                            >
                              수정
                            </button>
                          </>
                        )}
                        {isPast && "종료됨"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Tab>
      </Tabs>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedReservation(null);
          setFormData({
            teamId: "",
            reservationDate: "",
            startTime: "",
            endTime: "",
            password: "",
          });
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            회의실 {selectedRoom?.name}{" "}
            {selectedReservation ? "예약 수정" : "예약"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>팀 선택</label>
              <select
                className="form-control"
                value={formData.teamId}
                onChange={(e) =>
                  setFormData({ ...formData, teamId: e.target.value })
                }
                required
              >
                <option value="">팀을 선택하세요</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3">
              <label>예약 날짜</label>
              <input
                type="date"
                className="form-control"
                value={formData.reservationDate}
                onChange={(e) =>
                  setFormData({ ...formData, reservationDate: e.target.value })
                }
                min={(() => {
                  const now = new Date();
                  const hour = now.getHours();

                  // 오전 9시 이전이면 전날부터 예약 가능
                  if (hour < 9) {
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    return yesterday.toISOString().split("T")[0];
                  }
                  // 오전 9시 이후면 당일부터 예약 가능
                  return now.toISOString().split("T")[0];
                })()}
                max={(() => {
                  const now = new Date();
                  const hour = now.getHours();

                  // 오전 9시 이전이면 당일까지 예약 가능
                  if (hour < 9) {
                    return now.toISOString().split("T")[0];
                  }
                  // 오전 9시 이후면 다음날까지 예약 가능
                  const tomorrow = new Date(now);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  return tomorrow.toISOString().split("T")[0];
                })()}
                required
              />
            </div>

            <div className="form-group mb-3">
              <label>시작 시간</label>
              <select
                className="form-control"
                name="startTime"
                value={formData.startTime}
                onChange={handleTimeChange}
                required
              >
                <option value="">시작 시간 선택</option>
                {Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3">
              <label>종료 시간</label>
              <select
                className="form-control"
                name="endTime"
                value={formData.endTime}
                onChange={handleTimeChange}
                required
              >
                <option value="">종료 시간 선택</option>
                {Array.from({ length: 12 }, (_, i) => i + 10).map((hour) => (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3">
              <label>비밀번호</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={4}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                취소
              </button>
              <button type="submit" className="btn btn-primary">
                예약
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RoomList;
