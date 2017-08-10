// external imports
import React, { Component } from 'react';

class LogBox extends Component {
  componentDidMount() {
    this.previousScrollHeight = this.logBox.scrollHeight;
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    const scrolledBottom = ((this.logBox.offsetHeight + this.logBox.scrollTop) >= this.previousScrollHeight);
    // If its on bottom continue the scroll on bottom
    if (scrolledBottom) this.logBox.scrollTop = this.logBox.scrollHeight;
    this.previousScrollHeight = this.logBox.scrollHeight;
  }

  render = () => (
    <div className="bx--form-item">
      <label htmlFor="log-box" className="bx--label">{'Log'}</label>
      <div id="log-box" className="log-box" ref={el => { this.logBox = el; }}>
        {this.props.logs.map((log, i) => <p key={i}>{JSON.stringify(log)}</p>)}
      </div>
    </div>
  );
}

export default LogBox;
