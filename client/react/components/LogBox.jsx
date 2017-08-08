// external imports
import ReactDOM from 'react-dom';
import React, { Component } from 'react';

class LogBox extends Component {
  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    const node = ReactDOM.findDOMNode(this.logEnd);
    node.scrollIntoView({ behavior: 'smooth' });
  }

  render = () => (
    <div className="bx--form-item">
      <label htmlFor="log-box" className="bx--label">{'Log'}</label>
      <div id="log-box" className="log-box">
        {this.props.logs.map((log, i) => <p key={i}>{JSON.stringify(log)}</p>)}
        <div style={{ float: 'left', clear: 'both' }} ref={el => { this.logEnd = el; }} />
      </div>
    </div>
  );
}

export default LogBox;
