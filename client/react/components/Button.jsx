// external imports
import React from 'react';

const Button = ({ label, onClick, disabled }) => (
  <div className="bx--form-item">
    <button
      className="bx--btn bx--btn--primary"
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  </div>
);

export default Button;
