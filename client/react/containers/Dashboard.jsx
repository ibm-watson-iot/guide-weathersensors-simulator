// external imports
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Utils
import { getUrlQueryParameters } from '../util/util';

// Constants
import { ERROR, SUCCESS, INFO } from '../constants/notification';

// components
import Page from '../components/Page';
import Form from '../components/Form';
import InputText from '../components/InputText';
import ButtonGroup from '../components/ButtonGroup';
import LogBox from '../components/LogBox';
import Notification from '../components/Notification';
import SimulatorFrame from '../components/SimulatorFrame';

// action creators
import { updateSimulatorStatus, runSimulator, clearSuccess, clearError, setPublishIntervalDivisor } from '../actions/simulator';
import { clearLog } from '../actions/simulatorLog';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      org: '',
      apiKey: '',
      authToken: '',
    };
  }

  componentWillMount() {
    const { dispatchUpdateSimulatorStatus, dispatchSetPublishIntervalDivisor } = this.props;
    // If simulator is running, set the isRunning state flag.
    dispatchUpdateSimulatorStatus();
    // If divisor was passed, set the value to the state.
    const { divisor } = getUrlQueryParameters();
    const publishIntervalDivisor = parseFloat(divisor);
    if (publishIntervalDivisor) {
      dispatchSetPublishIntervalDivisor(publishIntervalDivisor);
    }
  }

  render() {
    const { publishIntervalDivisor, isSimulatorRunning, success, error, logArray,
      dispatchRunSimulator, dispatchClearLog, dispatchClearSuccess, dispatchClearError } = this.props;
    const { org, apiKey, authToken } = this.state;
    return (
      <Page>
        {!success && !error ? <Notification type={INFO} message={isSimulatorRunning ? 'Running...' : 'Not running'} /> : null}
        {success ? <Notification type={SUCCESS} message={success} onClick={dispatchClearSuccess} /> : null}
        {error ? <Notification type={ERROR} message={error} onClick={dispatchClearError} /> : null}
        <SimulatorFrame
          inputForm={
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
              <ButtonGroup
                buttons={[{
                  label: 'Run Simulator',
                  onClick: () => {
                    dispatchClearLog();
                    dispatchRunSimulator({
                      wiotp: { org, apiKey, authToken },
                      params: { publishIntervalDivisor },
                    });
                  },
                  disabled: isSimulatorRunning || !org || !apiKey || !authToken,
                }]}
                centered
              />
            </Form>
          }
          logForm={
            <Form>
              <LogBox logs={logArray} />
              <ButtonGroup
                buttons={[{
                  label: 'Clear all data',
                  onClick: () => {
                    dispatchClearLog();
                    dispatchRunSimulator({
                      wiotp: { org, apiKey, authToken },
                      params: { delete: true },
                    });
                  },
                  disabled: isSimulatorRunning || !org || !apiKey || !authToken,
                }, {
                  label: 'Clear logs',
                  onClick: () => {
                    dispatchClearLog();
                  },
                }]}
              />
            </Form>
          }
        />
      </Page>
    );
  }
}

const mapStateToProps = (state) => ({
  publishIntervalDivisor: state.simulator.publishIntervalDivisor,
  isSimulatorRunning: state.simulator.isRunning,
  success: state.simulator.success,
  error: state.simulator.error,
  logArray: state.simulatorLog.completeLog,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetPublishIntervalDivisor: (divisor) => dispatch(setPublishIntervalDivisor(divisor)),
  dispatchUpdateSimulatorStatus: () => dispatch(updateSimulatorStatus()),
  dispatchRunSimulator: (config) => dispatch(runSimulator(config)),
  dispatchClearLog: () => dispatch(clearLog()),
  dispatchClearSuccess: () => dispatch(clearSuccess()),
  dispatchClearError: () => dispatch(clearError()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
