import React, { useState, useEffect, useRef } from "react";

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
  const chatBodyRef = useRef<HTMLDivElement | null>(null); // 채팅 메시지 컨테이너 ref
  const timeoutRef = useRef<NodeJS.Timeout | number | null>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true); // 자동 스크롤 여부 상태

  // WebSocket 연결 설정
  const connectWebSocket = () => {
    console.log("connectWebSocket");
    socketRef.current = new WebSocket("ws://211.188.56.146:8080/connect"); // 서버 URL에 맞게 수정 필요

    socketRef.current.onmessage = (event: MessageEvent) => {
      const receivedMessage: Message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    };

    socketRef.current.onopen = () => {
      console.log("WebSocket 연결 성공");
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket 연결 종료. 3초 뒤 재연결 시도...");
      timeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };
  };

  // 처음 컴포넌트가 마운트될 때 WebSocket 연결
  useEffect(() => {
    console.log("init");
    connectWebSocket();

    return () => {
      console.log("destroy");
      socketRef.current?.close();
    };
  }, []);

  // 메시지 전송 함수
  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      socketRef.current?.send(inputMessage);
      setInputMessage("");
    }
  };

  // 메시지 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      sendMessage();
    }
  };

  // 서버로부터 받은 메시지 출력 형식
  const formatMessage = (message: Message) => {
    const formattedTime = `${message.timestamp[3]}:${message.timestamp[4]}:${message.timestamp[5]}`;
    const uniqueKey = `${message.id}`;
    return (
      <div key={uniqueKey} className="mb-2">
        <strong>유저{message.senderId.substring(0, 5)}</strong>{" "}
        <span style={{ fontSize: "12px", color: "#6c757d" }}>
          ({formattedTime})
        </span>
        : {message.payload}
      </div>
    );
  };

  // ✅ 유저가 스크롤을 위로 올렸는지 감지하는 함수
  const handleScroll = () => {
    if (!chatBodyRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    const isUserAtBottom = scrollHeight - scrollTop <= clientHeight + 10; // 오차 허용

    setIsAutoScroll(isUserAtBottom);
  };

  // ✅ 메시지 리스트가 변경될 때 자동으로 스크롤 (단, 유저가 위로 스크롤한 경우 제외)
  useEffect(() => {
    if (isAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAutoScroll]);

  return (
    <div className="container my-4" style={{ maxWidth: "400px" }}>
      <div className="card">
        <div className="card-header">
          <h4>익명 채팅</h4>
        </div>
        <div
          ref={chatBodyRef}
          className="card-body"
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            paddingRight: "15px",
            height: "300px",
          }}
          onScroll={handleScroll} // ✅ 스크롤 이벤트 추가
        >
          {messages.map(formatMessage)}
          <div ref={messagesEndRef} />
        </div>

        {/* ✅ 입력창과 버튼을 세로로 배치 */}
        <div className="card-footer d-flex flex-column gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="form-control"
            placeholder="메시지를 입력하세요"
          />
          <button onClick={sendMessage} className="custom-chat-button">
            보내기
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebSocketChat;
