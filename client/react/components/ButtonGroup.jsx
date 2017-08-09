// external imports
import React from 'react';

const ButtonGroup = ({ buttons, centered }) => (
  <div className={`bx--form-item ${centered ? 'centered' : ''}`}>
    {buttons.map(({ label, onClick, disabled }, i) => (
      <button
        key={i}
        className="bx--btn bx--btn--primary"
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
    ))}
  </div>
);

export default ButtonGroup;
