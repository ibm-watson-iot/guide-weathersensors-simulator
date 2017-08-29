
// external imports
import React from 'react';

const Modal = ({ title, content, onClose, isVisible }) => (
  <div className={`bx--modal ${isVisible ? 'is-visible' : ''}`} tabIndex="-1">
    <div className="bx--modal-container">
      <div className="bx--modal-header">
        <p className="bx--modal-header__heading bx--type-beta">{title}</p>
        <button className="bx--modal-close" type="button" aria-label="close modal" onClick={onClose}>
          <svg className="bx--modal-close__icon" width="10" height="10" viewBox="0 0 10 10" fillRule="evenodd">
            <title>Close Modal</title>
            <path d="M9.8 8.6L8.4 10 5 6.4 1.4 10 0 8.6 3.6 5 .1 1.4 1.5 0 5 3.6 8.6 0 10 1.4 6.4 5z"></path>
          </svg>
        </button>
      </div>

      <div className="bx--modal-content">
        {content}
      </div>

      <div className="bx--modal-footer">
        <button className="bx--btn bx--btn--secondary" type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export default Modal;
