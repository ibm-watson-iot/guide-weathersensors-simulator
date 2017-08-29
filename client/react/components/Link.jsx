// external imports
import React from 'react';

const Link = ({ label, href, onClick, centered }) => (
  <div className={`bx--form-item ${centered ? 'centered' : ''}`}>
    <a target={href ? '_blank' : ''} href={href || '#'} onClick={onClick}>{label}</a>
  </div>
);

export default Link;
