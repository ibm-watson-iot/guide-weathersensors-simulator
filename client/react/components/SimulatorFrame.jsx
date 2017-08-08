// external imports
import React from 'react';

const SimulatorFrame = ({ inputForm, logForm }) => (
  <div className="frame">
    <div className="input-form-container">
      {inputForm}
    </div>
    <div className="log-form-container">
      {logForm}
    </div>
  </div>
);

export default SimulatorFrame;
