interface FieldErrorProps {
  message: string;
  id?: string;
}

export function FieldError({ message, id }: FieldErrorProps) {
  return (
    <p id={id} className="field-error-text field-error-with-icon" role="alert">
      <img
        src="/icons/information-circle.svg"
        alt=""
        className="field-error-icon"
        aria-hidden="true"
      />
      {message}
    </p>
  );
}
