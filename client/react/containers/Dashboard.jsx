// external imports
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Utils
import { getUrlQueryParameters } from '../util/util';

// components
import Page from '../components/Page';
import Form from '../components/Form';
import Label from '../components/Label';
import Link from '../components/Link';
import InputText from '../components/InputText';
import ButtonGroup from '../components/ButtonGroup';
import LogBox from '../components/LogBox';
import Notification from '../components/Notification';
import SimulatorFrame from '../components/SimulatorFrame';

// action creators
import { updateSimulatorStatus, updateWIoTPInfo, runSimulator, clearSuccess, clearError, setPublishIntervalDivisor } from '../actions/simulator';
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
    const { dispatchUpdateSimulatorStatus, dispatchUpdateWIoTPInfo, dispatchSetPublishIntervalDivisor } = this.props;
    // If simulator is running, set the isRunning state flag.
    dispatchUpdateWIoTPInfo();
    dispatchUpdateSimulatorStatus();
    setInterval(dispatchUpdateSimulatorStatus, 5000);
    // If divisor was passed, set the value to the state.
    const { divisor } = getUrlQueryParameters();
    const publishIntervalDivisor = parseFloat(divisor);
    if (publishIntervalDivisor) {
      dispatchSetPublishIntervalDivisor(publishIntervalDivisor);
    }
  }

  render() {
    const { publishIntervalDivisor, isSimulatorRunning, wiotpInfo, logArray, lastRelevantLog,
      dispatchRunSimulator, dispatchClearLog } = this.props;
    const { org, apiKey, authToken } = this.state;
    const inputsMissing = (!org || !apiKey || !authToken) && !wiotpInfo;
    const defaultNotificationMessage = inputsMissing
        ? 'Enter WIoTP org and credentials then click on Run Simulator.'
        : 'Click on Run Simulator.';
    const notificationType = lastRelevantLog.type;
    const notificationMessage = lastRelevantLog.message || (isSimulatorRunning ? 'Simulator running ...' : defaultNotificationMessage);
    const isSimulatorButtonDisabled = isSimulatorRunning || inputsMissing;
    const runSimulatorButton = (
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
          disabled: isSimulatorButtonDisabled,
        }]}
        centered
      />
    );

    const wiotpConnectionInfo = wiotpInfo || (isSimulatorRunning && org && { org, host: `${org}.internetofthings.ibmcloud.com`, name: 'WIoTP' });

    const headerLabel = <Label text={'Weather Sensor Simulator'} big centered />;
    const inputForm = wiotpConnectionInfo ? (
      <Form>
        {headerLabel}
        <Label text={'Connected to:'} centered />
        <Link href={`http://${wiotpConnectionInfo.host}/dashboard/#/devices/browse`} label={wiotpConnectionInfo.name} centered />
        <Label text={`Org: ${wiotpConnectionInfo.org}`} centered normal />
        <div style={{ height: '130px' }} />
        {runSimulatorButton}
      </Form>
    ) : (
      <Form>
        {headerLabel}
        <InputText
          id={'org'}
          label={'Watson IoT Platform Organization'}
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
        {runSimulatorButton}
      </Form>
    );

    const logForm = (
      <Form>
        <LogBox logs={logArray} />
        <ButtonGroup
          buttons={[{
            label: 'Delete simulated devices',
            onClick: () => {
              dispatchClearLog();
              dispatchRunSimulator({
                wiotp: { org, apiKey, authToken },
                params: { delete: true },
              });
            },
            disabled: isSimulatorButtonDisabled,
          }, {
            label: 'Clear logs',
            onClick: () => {
              dispatchClearLog();
            },
          }]}
        />
      </Form>
    );

    return (
      <Page>
        {<Notification type={notificationType} message={notificationMessage} />}
        <SimulatorFrame
          inputForm={inputForm}
          logForm={logForm}
        />
      </Page>
    );
  }
}

const mapStateToProps = (state) => ({
  publishIntervalDivisor: state.simulator.publishIntervalDivisor,
  isSimulatorRunning: state.simulator.isRunning,
  wiotpInfo: state.simulator.wiotpInfo,
  success: state.simulator.success,
  error: state.simulator.error,
  logArray: state.simulatorLog.completeLog,
  lastRelevantLog: state.simulatorLog.lastRelevantLog,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetPublishIntervalDivisor: (divisor) => dispatch(setPublishIntervalDivisor(divisor)),
  dispatchUpdateSimulatorStatus: () => dispatch(updateSimulatorStatus()),
  dispatchUpdateWIoTPInfo: () => dispatch(updateWIoTPInfo()),
  dispatchRunSimulator: (config) => dispatch(runSimulator(config)),
  dispatchClearLog: () => dispatch(clearLog()),
  dispatchClearSuccess: () => dispatch(clearSuccess()),
  dispatchClearError: () => dispatch(clearError()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
