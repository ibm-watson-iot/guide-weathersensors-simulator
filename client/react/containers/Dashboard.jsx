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
import CopyButton from '../components/CopyButton';
import LogBox from '../components/LogBox';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import SimulatorFrame from '../components/SimulatorFrame';

// action creators
import { updateSimulatorStatus, updateWIoTPInfo, updateCloudantInfo, updateAppInfo, runSimulator, clearSuccess, clearError,
  setPublishIntervalDivisor, setTestEnv, setDomain } from '../actions/simulator';
import { clearLog } from '../actions/simulatorLog';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      org: '',
      apiKey: '',
      authToken: '',
      isModalVisible: false,
    };
  }

  componentWillMount() {
    const { dispatchUpdateSimulatorStatus, dispatchUpdateWIoTPInfo, dispatchUpdateCloudantInfo, dispatchUpdateAppInfo,
      dispatchSetPublishIntervalDivisor, dispatchSetTestEnv, dispatchSetDomain } = this.props;
    // If simulator is running, set the isRunning state flag.
    dispatchUpdateWIoTPInfo();
    dispatchUpdateCloudantInfo();
    dispatchUpdateAppInfo();
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
    const { publishIntervalDivisor, testEnv, domain, isSimulatorRunning, wiotpInfo, cloudantInfo, appInfo, logArray, lastRelevantLog,
      dispatchRunSimulator, dispatchClearLog } = this.props;
    const { org, apiKey, authToken, isModalVisible } = this.state;
    const inputsMissing = (!org || !apiKey || !authToken) && !wiotpInfo;
    const enterCredentialsMessage = 'Enter WIoTP org and credentials then click on Run Simulator';
    const initialIdleMessage = appInfo ?
      <span>
        {`${enterCredentialsMessage} or `}
        <a href={`https://console.bluemix.net/apps/${appInfo.id}?paneId=connected-objects`} target="_blank">{'connect an WIoTP service'}</a>
      </span>
      : enterCredentialsMessage;
    const defaultNotificationMessage = inputsMissing
        ? initialIdleMessage
        : 'Click on Run Simulator';
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

    const wiotpConnectionInfo = wiotpInfo || (isSimulatorRunning && org && { org, host: `${org}.${httpDomain}` });

    const headerLabel = <Label text={'Weather Sensors Simulator'} big centered />;

    const wiotpLinkLabel = (cloudantInfo && !isSimulatorRunning) ?
      <Label text={'If you haven\'t yet configured Cloudant connector, do so before running the simulator.'} centered normal />
      : <Label text={'Check your devices in WIoTP by clicking on the link below'} centered normal />;

    const wiotpLink = (cloudantInfo && !isSimulatorRunning) ? (
      <Link
        href={`http://${wiotpConnectionInfo.host}/dashboard/#/extensions`}
        label={'Configure Cloudant connector'}
        centered
      />
    ) : (
      <Link
        href={`http://${wiotpConnectionInfo.host}/dashboard/#/devices/browse`}
        label={'Launch WIoTP Dashboard'}
        centered
      />
    );

    const wiotpServiceNameLabel = wiotpConnectionInfo && wiotpConnectionInfo.name ?
      <Label text={`Service name: ${wiotpConnectionInfo.name}`} centered normal />
      : null;

    const wiotpServiceOrgLabel = wiotpConnectionInfo && wiotpConnectionInfo.org ?
      <Label text={`Org: ${wiotpConnectionInfo.org}`} centered normal />
      : null;

    const cloudantLink = cloudantInfo ? (
      <Link
        label={'Cloudant Dashboard ...'}
        onClick={() => this.setState({ isModalVisible: true })}
        centered
      />
    ) : null;

    const cloudantLinkModal = cloudantInfo ? (
      <Modal
        title={'Cloudant Service'}
        content={(
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Label text={'Copy Cloudant password to clipboard and open Cloudant dashboard.'} centered normal />
            <div className="bx--form-item" style={{ display: 'flex', flexDirection: 'row' }}>
              <Label text={cloudantInfo.password} centered normal />
              <CopyButton textToCopy={cloudantInfo.password} />
            </div>
            <Link
              href={`http://${cloudantInfo.host}/dashboard.html`}
              label={'Launch Cloudant Dashboard'}
              centered
            />
          </div>
        )}
        isVisible={isModalVisible}
        onClose={() => this.setState({ isModalVisible: false })}
      />
    ) : null;


    const inputForm = wiotpConnectionInfo ? (
      <Form>
        {headerLabel}
        {wiotpLinkLabel}
        {wiotpLink}
        {wiotpServiceNameLabel}
        {wiotpServiceOrgLabel}
        {cloudantLink}
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
        {cloudantLinkModal}
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
  cloudantInfo: state.simulator.cloudantInfo,
  appInfo: state.simulator.appInfo,
  logArray: state.simulatorLog.completeLog,
  lastRelevantLog: state.simulatorLog.lastRelevantLog,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetPublishIntervalDivisor: (divisor) => dispatch(setPublishIntervalDivisor(divisor)),
  dispatchSetTestEnv: (testEnv) => dispatch(setTestEnv(testEnv)),
  dispatchSetDomain: (domain) => dispatch(setDomain(domain)),
  dispatchUpdateSimulatorStatus: () => dispatch(updateSimulatorStatus()),
  dispatchUpdateWIoTPInfo: () => dispatch(updateWIoTPInfo()),
  dispatchUpdateCloudantInfo: () => dispatch(updateCloudantInfo()),
  dispatchUpdateAppInfo: () => dispatch(updateAppInfo()),
  dispatchRunSimulator: (config) => dispatch(runSimulator(config)),
  dispatchClearLog: () => dispatch(clearLog()),
  dispatchClearSuccess: () => dispatch(clearSuccess()),
  dispatchClearError: () => dispatch(clearError()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
