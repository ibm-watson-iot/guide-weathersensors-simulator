// external imports
import React from 'react';

const InputText = ({ id, type, label, value, onChange, placeholder }) => (
  <div className="bx--form-item">
    <label htmlFor={id} className="bx--label">{label}</label>
    <input id={id} type={type || 'text'} className="bx--text-input" placeholder={placeholder || ''} value={value} onChange={onChange} />
  </div>
);

export default InputText;
