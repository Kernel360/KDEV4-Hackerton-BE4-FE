import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// 메시지 타입 정의
interface Message {
  id: string;
  senderId: string;
  payload: string;
  timestamp: number[];
}

const WebSocketChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]); // 메시지 배열 상태
  const [inputMessage, setInputMessage] = useState<string>(""); // 사용자 입력 메시지 상태
  const socketRef = useRef<WebSocket | null>(null); // WebSocket 객체를 참조
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // 메시지 끝을 가리킬 ref
  const timeoutRef = useRef<NodeJS.Timeout|number | null>(null);

  // WebSocket 연결 설정
  const connectWebSocket = () => {
    console.log("connectWebSocket");
    // WebSocket 객체 생성 및 연결
    socketRef.current = new WebSocket("ws://211.188.56.146:8080/connect"); // 서버 URL에 맞게 수정 필요

    // 메시지를 받았을 때 처리
    socketRef.current.onmessage = (event: MessageEvent) => {
      const receivedMessage: Message = JSON.parse(event.data); // 받은 메시지 JSON 파싱
      setMessages((prevMessages) => [...prevMessages, receivedMessage]); // 메시지를 배열에 추가
    };

    // WebSocket 연결이 열렸을 때 처리
    socketRef.current.onopen = () => {
      console.log("WebSocket 연결 성공");
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    // WebSocket 연결이 종료됐을 때 처리
    socketRef.current.onclose = () => {
      console.log("WebSocket 연결 종료. 3초 뒤 재연결 시도...");
      timeoutRef.current = setTimeout(() => {
        connectWebSocket(); // 연결 끊기면 3초 뒤 재연결
      }, 3000);
    };
  };

  // 처음 컴포넌트가 마운트될 때 WebSocket 연결
  useEffect(() => {
    console.log("init");
    connectWebSocket(); // WebSocket 연결 시도

    // 컴포넌트가 언마운트될 때 WebSocket 종료
    return () => {
      console.log("destroy");
      socketRef.current?.close();
    };
  }, []);

  // 메시지 전송 함수
  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      socketRef.current?.send(inputMessage); // 서버로 메시지 전송
      setInputMessage(""); // 입력란 초기화
    }
  };

  // 메시지 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.nativeEvent.isComposing === false) {
      sendMessage();
    }
  };

  // 서버로부터 받은 메시지 출력 형식
  const formatMessage = (message: Message) => {
    const formattedTime = `${message.timestamp[3]}:${message.timestamp[4]}:${message.timestamp[5]}`; // 시간을 HH:MM:SS 형식으로 변환
    const uniqueKey = `${message.id}`;
    return (
      <div key={uniqueKey} className="mb-2">
        <strong>유저{message.senderId.substring(0, 5)}</strong>{" "}
        <span>({formattedTime})</span>: {message.payload}
      </div>
    );
  };

  // 메시지 리스트가 변경될 때마다 자동으로 스크롤을 가장 아래로 내리기
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="container my-4" style={{ maxWidth: "400px" }}>
      <div className="card">
        <div className="card-header">
          <h4>BE4 채팅</h4>
        </div>
        <div
          className="card-body"
          style={{
            maxHeight: "300px", // 고정된 높이
            overflowY: "auto", // 스크롤 가능
            paddingRight: "15px", // 스크롤바 여백
            height: "300px", // 고정된 높이
          }}
        >
          {/* 메시지 리스트 */}
          {messages.map(formatMessage)} {/* 메시지 배열을 화면에 출력 */}
          <div ref={messagesEndRef} />
        </div>
        <div className="card-footer">
          <div className="input-group">
            {/* 메시지 입력 */}
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="form-control"
              placeholder="메시지를 입력하세요"
            />
            <button onClick={sendMessage} className="btn btn-primary ms-2">
              보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketChat;
