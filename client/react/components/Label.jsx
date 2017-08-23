// external imports
import React from 'react';

const Label = ({ text, big, centered, normal }) => (
  <div className={`bx--form-item ${centered ? 'centered' : ''}`}>
    <label className={`bx--label ${big ? 'big' : ''} ${normal ? 'normal' : ''}`}>{text}</label>
  </div>
);

export default Label;
