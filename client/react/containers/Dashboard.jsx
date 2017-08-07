// external imports
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Constants
import { ERROR, SUCCESS, INFO } from '../constants/notification';
import { PUBLISH_INTERVAL_DIVISOR } from '../constants/simulator';

// components
import Page from '../components/Page';
import Form from '../components/Form';
import InputText from '../components/InputText';
import Button from '../components/Button';
import LogBox from '../components/LogBox';
import Notification from '../components/Notification';

// action creators
import { updateSimulatorStatus, runSimulator, clearSuccess, clearError } from '../actions/simulator';
import { clearLog } from '../actions/simulatorLog';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      org: '',
      apiKey: '',
      authToken: '',
      publishIntervalDivisor: PUBLISH_INTERVAL_DIVISOR,
    };
  }

  componentWillMount() {
    this.props.dispatchUpdateSimulatorStatus();
  }

  render() {
    const { isSimulatorRunning, success, error, logArray, dispatchRunSimulator, dispatchClearLog, dispatchClearSuccess, dispatchClearError } = this.props;
    const { org, apiKey, authToken, publishIntervalDivisor } = this.state;
    return (
      <Page>
        <Form>
          <InputText
            id={'org'}
            label={'WIoTP Org'}
            value={org}
            onChange={evt => this.setState({ org: evt.target.value })}
          />
          <InputText
            id={'username'}
            label={'API Key'}
            value={apiKey}
            onChange={evt => this.setState({ apiKey: evt.target.value })}
          />
          <InputText
            id={'password'}
            type={'password'}
            label={'Authentication Token'}
            value={authToken}
            onChange={evt => this.setState({ authToken: evt.target.value })}
          />
          <Button
            label={'Run Simulator'}
            onClick={() => {
              dispatchClearLog();
              dispatchRunSimulator({
                wiotp: { org, apiKey, authToken },
                params: { publishIntervalDivisor },
              });
            }}
            disabled={isSimulatorRunning || !org || !apiKey || !authToken}
          />
        </Form>
        <Notification type={INFO} message={isSimulatorRunning ? 'Running...' : 'Not running'} />
        {success ? <Notification type={SUCCESS} message={success} onClick={dispatchClearSuccess} /> : null}
        {error ? <Notification type={ERROR} message={error} onClick={dispatchClearError} /> : null}
        <LogBox logs={logArray} />
        <Button
          label={'Clear logs'}
          onClick={() => {
            dispatchClearLog();
          }}
        />
      </Page>
    );
  }
}

const mapStateToProps = (state) => ({
  isSimulatorRunning: state.simulator.isRunning,
  success: state.simulator.success,
  error: state.simulator.error,
  logArray: state.simulatorLog.completeLog,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateSimulatorStatus: () => dispatch(updateSimulatorStatus()),
  dispatchRunSimulator: (config) => dispatch(runSimulator(config)),
  dispatchClearLog: () => dispatch(clearLog()),
  dispatchClearSuccess: () => dispatch(clearSuccess()),
  dispatchClearError: () => dispatch(clearError()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
