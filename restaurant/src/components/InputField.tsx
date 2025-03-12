interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void; // ✅ 선택적 속성으로 변경
  required?: boolean;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      {type === "textarea" ? (
        <textarea
          className="form-control"
          value={value}
          onChange={onChange} // ✅ 선택적 속성이므로, 존재할 때만 실행됨
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          className="form-control"
          value={value}
          onChange={onChange} // ✅ 선택적 속성이므로, 존재할 때만 실행됨
          required={required}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default InputField;
