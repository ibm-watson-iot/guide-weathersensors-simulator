// external imports
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Utils
import { getUrlQueryParameters } from '../util/util';

// constants
import { DEFAULT_DOMAIN } from '../constants/simulator';

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
import { updateSimulatorStatus, updateWIoTPInfo, runSimulator, clearSuccess, clearError,
  setPublishIntervalDivisor, setTestEnv, setDomain } from '../actions/simulator';
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
    const { dispatchUpdateSimulatorStatus, dispatchUpdateWIoTPInfo, dispatchSetPublishIntervalDivisor, dispatchSetTestEnv, dispatchSetDomain } = this.props;
    // If simulator is running, set the isRunning state flag.
    dispatchUpdateWIoTPInfo();
    dispatchUpdateSimulatorStatus();
    setInterval(dispatchUpdateSimulatorStatus, 5000);
    // If query params were passed, set their values to the state
    const { divisor, testenv, domain } = getUrlQueryParameters();
    const publishIntervalDivisor = parseFloat(divisor);
    if (publishIntervalDivisor) {
      dispatchSetPublishIntervalDivisor(publishIntervalDivisor);
    }
    if (testenv) {
      dispatchSetTestEnv(testenv);
    }
    if (domain) {
      dispatchSetDomain(domain);
    }
  }

  render() {
    const { publishIntervalDivisor, testEnv, domain, isSimulatorRunning, wiotpInfo, logArray, lastRelevantLog,
      dispatchRunSimulator, dispatchClearLog } = this.props;
    const { org, apiKey, authToken } = this.state;
    const inputsMissing = (!org || !apiKey || !authToken) && !wiotpInfo;
    const defaultNotificationMessage = inputsMissing
        ? 'Enter WIoTP org and credentials then click on Run Simulator.'
        : 'Click on Run Simulator.';
    const notificationType = lastRelevantLog.type;
    const notificationMessage = lastRelevantLog.message || (isSimulatorRunning ? 'Simulator running ...' : defaultNotificationMessage);
    const isSimulatorButtonDisabled = isSimulatorRunning || inputsMissing;
    const baseDomain = domain || DEFAULT_DOMAIN;
    const httpDomain = testEnv ? `${testEnv}.test.${baseDomain}` : baseDomain;
    const mqttDomain = testEnv ? `messaging.${testEnv}.test.${baseDomain}` : `messaging.${baseDomain}`;

    const runSimulatorButton = (
      <ButtonGroup
        buttons={[{
          label: 'Run Simulator',
          onClick: () => {
            dispatchClearLog();
            dispatchRunSimulator({
              wiotp: { org, apiKey, authToken, httpDomain, mqttDomain },
              params: { publishIntervalDivisor },
            });
          },
          disabled: isSimulatorButtonDisabled,
        }]}
        centered
      />
    );

    const wiotpConnectionInfo = wiotpInfo || (isSimulatorRunning && org && { org, host: `${org}.${httpDomain}`, name: 'WIoTP' });
    const headerLabel = <Label text={'Weather Sensors Simulator'} big centered />;

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
                wiotp: { org, apiKey, authToken, httpDomain, mqttDomain },
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
  testEnv: state.simulator.testEnv,
  domain: state.simulator.domain,
  isSimulatorRunning: state.simulator.isRunning,
  wiotpInfo: state.simulator.wiotpInfo,
  logArray: state.simulatorLog.completeLog,
  lastRelevantLog: state.simulatorLog.lastRelevantLog,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetPublishIntervalDivisor: (divisor) => dispatch(setPublishIntervalDivisor(divisor)),
  dispatchSetTestEnv: (testEnv) => dispatch(setTestEnv(testEnv)),
  dispatchSetDomain: (domain) => dispatch(setDomain(domain)),
  dispatchUpdateSimulatorStatus: () => dispatch(updateSimulatorStatus()),
  dispatchUpdateWIoTPInfo: () => dispatch(updateWIoTPInfo()),
  dispatchRunSimulator: (config) => dispatch(runSimulator(config)),
  dispatchClearLog: () => dispatch(clearLog()),
  dispatchClearSuccess: () => dispatch(clearSuccess()),
  dispatchClearError: () => dispatch(clearError()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
