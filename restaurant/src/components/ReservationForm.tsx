import React, { useState } from "react";
import styled from "styled-components";
import api from "../api/axios";

interface ReservationFormProps {
  roomId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReservationRequest {
  date: string;
  startTime: string;
  endTime: string;
  teamId: number;
  password: string;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  roomId,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ReservationRequest>({
    date: "",
    startTime: "",
    endTime: "",
    teamId: 1, // 임시 값
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 예약 가능 여부 확인
      await api.get(`/room/${roomId}/check`, {
        params: {
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          teamId: formData.teamId,
        },
      });

      // 예약 생성
      await api.post(`/room/${roomId}`, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data || "예약 중 오류가 발생했습니다.");
    }
  };

  return (
    <FormContainer>
      <Title>회의실 예약</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>날짜</Label>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>시작 시간</Label>
          <Input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>종료 시간</Label>
          <Input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>비밀번호</Label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={4}
          />
        </FormGroup>
        <ButtonGroup>
          <SubmitButton type="submit">예약하기</SubmitButton>
          <CancelButton type="button" onClick={onClose}>
            취소
          </CancelButton>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  color: #666;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  flex: 1;
`;

const SubmitButton = styled(Button)`
  background-color: #3498db;
  color: white;

  &:hover {
    background-color: #2980b9;
  }
`;

const CancelButton = styled(Button)`
  background-color: #95a5a6;
  color: white;

  &:hover {
    background-color: #7f8c8d;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background-color: #fadbd8;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
`;

export default ReservationForm;
