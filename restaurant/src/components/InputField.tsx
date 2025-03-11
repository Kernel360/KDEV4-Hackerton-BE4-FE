interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  required?: boolean;
  disabled?: boolean; // 🔥 추가
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false, // 🔥 추가
}) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      {type === "textarea" ? (
        <textarea
          className="form-control"
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled} // 🔥 적용
        />
      ) : (
        <input
          type={type}
          className="form-control"
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled} // 🔥 적용
        />
      )}
    </div>
  );
};

export default InputField;
