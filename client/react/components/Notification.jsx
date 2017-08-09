// external imports
import React from 'react';

import { ERROR, SUCCESS, WARNING, INFO } from '../constants/notification';

const Notification = ({ type, message, onClick }) => {
  let notificationTitle = '';
  let colorClass = '';
  let icon = null;
  switch (type) {
    case ERROR:
      notificationTitle = 'Error:';
      colorClass = 'bx--inline-notification--error';
      icon = <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM5.1 13.3L3.5 12 11 2.6l1.5 1.2-7.4 9.5z"></path>;
      break;
    case SUCCESS:
      notificationTitle = 'Success:';
      colorClass = 'bx--inline-notification--success';
      icon = <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM6.7 11.5L3.4 8.1l1.4-1.4 1.9 1.9 4.1-4.1 1.4 1.4-5.5 5.6z"></path>;
      break;
    case WARNING:
      notificationTitle = 'Warning:';
      colorClass = 'bx--inline-notification--warning';
      icon = <path d="M8 1L0 15h16L8 1zm-.8 5h1.5v1.4L8.3 11h-.8l-.4-3.6V6h.1zm.8 8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"></path>;
      break;
    case INFO:
    default:
      notificationTitle = 'Info:';
      colorClass = 'bx--inline-notification--info';
      icon = <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 4c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm2 8H6v-1h1V8H6V7h3v4h1v1z"></path>;
      break;
  }
  return (
    <div data-notification className={`bx--inline-notification ${colorClass}`} role="alert">
      <div className="bx--inline-notification__details">
        <svg className="bx--inline-notification__icon" width="16" height="16" viewBox="0 0 16 16" fillRule="evenodd">
          {icon}
        </svg>
        <div className="bx--inline-notification__text-wrapper">
          <h3 className="bx--inline-notification__title">{notificationTitle}</h3>
          <p className="bx--inline-notification__subtitle">{message}</p>
        </div>
      </div>
      {onClick ? (
        <button data-notification-btn className="bx--inline-notification__close-button" type="button" onClick={onClick}>
          <svg className="bx--inline-notification__close-icon" aria-label="close" width="10" height="10" viewBox="0 0 10 10" fillRule="evenodd">
            <path d="M9.8 8.6L8.4 10 5 6.4 1.4 10 0 8.6 3.6 5 .1 1.4 1.5 0 5 3.6 8.6 0 10 1.4 6.4 5z"></path>
          </svg>
        </button>) : null
      }
    </div>
  );
};

export default Notification;
