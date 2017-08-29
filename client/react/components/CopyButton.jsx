// external imports
import React from 'react';

const CopyButton = ({ textToCopy }) => (
  <button
    className="bx--snippet-button"
    tabIndex="0"
    onClick={() => {
      // Workaround to copy text to clipboard
      const fake = document.createElement('textarea');
      fake.style.width = '0';
      fake.style.height = '0';
      document.body.appendChild(fake);
      fake.value = textToCopy;
      fake.focus();
      fake.select();
      document.execCommand('copy');
      document.body.removeChild(fake);
    }}
  >
    <svg className="bx--snippet__icon" width="18" height="24" viewBox="0 0 18 24" fillRule="evenodd">
      <path d="M13 5V0H0v19h5v5h13V5h-5zM2 17V2h9v3H5v12H2zm14 5H7V7h9v15z"></path>
      <path d="M9 9h5v2H9zM9 12h5v2H9zM9 15h3v2H9z"></path>
    </svg>
    <div className="bx--btn--copy__feedback"></div>
  </button>
);

export default CopyButton;
