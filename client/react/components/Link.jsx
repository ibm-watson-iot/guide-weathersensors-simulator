// external imports
import React from 'react';

const Link = ({ label, href, centered }) => (
  <div className={`bx--form-item ${centered ? 'centered' : ''}`}>
    <a target="_blank" href={href}>{label}</a>
  </div>
);

export default Link;
