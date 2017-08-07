/**
 *****************************************************************************
 Copyright (c) 2017 IBM Corporation and other Contributors.
 All rights reserved. This program and the accompanying materials
 are made available under the terms of the Eclipse Public License v1.0
 which accompanies this distribution, and is available at
 http://www.eclipse.org/legal/epl-v10.html
 *****************************************************************************
 **/

/* eslint-disable no-console */

'use strict';

// External dependencies
const mqtt = require('mqtt');
const request = require('request');
const csv = require('csvtojson');

const DEFAULT_HTTP_DOMAIN = 'internetofthings.ibmcloud.com';
const DEFAULT_MQTT_DOMAIN = `messaging.${DEFAULT_HTTP_DOMAIN}`;
const DEFAULT_CSV_FILE_PATH = './server/data/cloudant.csv';
const DEVICE_PASSWORD = 'iotanalytics';
// Do not interrupt simulator on these errors
// 400 - Device type cannot be deleted because there are devices of this type
// 409 - Cannot create device (or device type) because it already exists
const ACCEPTED_WIOTP_API_ERRORS = [400, 409];
// Add messages for WIoTP REST API errors that are not provided in the response body
// Reference: https://docs.internetofthings.ibmcloud.com/apis/swagger/v0002/org-admin.html
const WIOTP_API_ERROR_MESSAGES = new Map();
WIOTP_API_ERROR_MESSAGES.set(401, 'The authentication token is empty or invalid');
WIOTP_API_ERROR_MESSAGES.set(403, 'The authentication method is invalid or the API key used does not exist');
WIOTP_API_ERROR_MESSAGES.set(404, 'The organization does not exist');
const SOCKET_MESSAGE_TYPE = 'MESSAGE';
const SUCCESS_MESSAGE = 'Simulator has completed its tasks. Check the logs for more details.';

module.exports = (io) => {
  // Listen to socket connections if io was passed
  // Then override console.log so that it also fires socket.emit()
  if (io) {
    io.on('connection', (socket) => {
      const consoleLog = console.log;
      console.log = (log) => {
        socket.emit('action', { type: SOCKET_MESSAGE_TYPE, log });
        consoleLog(log);
      };
    });
  }

  // Print response from external APIs
  const printResponse = (error, statusCode, body) => {
    console.log(error);
    console.log(statusCode);
    console.log(body);
  };

  // Convert milliseconds to HH:MM:SS
  const millisecondsToHHMMSS = (intervalInMilliseconds) => {
    const milliseconds = parseInt((intervalInMilliseconds % 1000) / 100, 10);
    let seconds = parseInt((intervalInMilliseconds / 1000) % 60, 10);
    let minutes = parseInt((intervalInMilliseconds / (1000 * 60)) % 60, 10);
    let hours = parseInt((intervalInMilliseconds / (1000 * 60 * 60)) % 24, 10);
    hours = (hours < 10) ? `0${hours}` : hours;
    minutes = (minutes < 10) ? `0${minutes}` : minutes;
    seconds = (seconds < 10) ? `0${seconds}` : seconds;
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  // Calculate simulator execution time
  const getExecutionTime = (startDate) => millisecondsToHHMMSS(new Date().getTime() - startDate.getTime());

  // Convert a raw JSON obtained from a row in the CSV file to a JSON with device events (containing metadata and payload to be published to WIoTP)
  const convertFromRawDeviceData = (rawDeviceData) => {
    const { timestamp, deviceType, deviceId, eventType, format } = rawDeviceData;
    const rawDevicePayloadPrefix = `${deviceType}_${eventType}_`;

    const deviceData = { timestamp, deviceType, deviceId, eventType, format, d: {} };
    Object.keys(rawDeviceData).forEach(key => {
      if (key.startsWith(rawDevicePayloadPrefix) && rawDeviceData[key] !== '') {
        deviceData.d[key.split(rawDevicePayloadPrefix)[1]] = parseFloat(rawDeviceData[key]);
      }
    });
    return deviceData;
  };

  // Iterate through a sorted array of device event JSONs and add the 'timeSinceLastEvent' attribute
  // with the interval (in milliseconds) between the previous event timestamp and the current event timestamp.
  const addTimeSinceLastEvent = (sortedDevicesData) => sortedDevicesData
    .map((data, i, arr) => Object.assign({}, data, {
      timeSinceLastEvent: ((i > 0) ? (new Date(data.timestamp).getTime() - new Date(arr[i - 1].timestamp).getTime()) : 0),
    }));

  // Sort an array of device JSONs by timestamp.
  const sortDevicesDataByTimestamp = (devicesData) => devicesData
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Read the CSV file with device events and return an array of JSONs containing device metadata
  // and the payload to be published to WIoTP
  const readSimulatedDataFile = (fileName) => new Promise((resolve, reject) => {
    const simulatedDevicesData = [];
    csv().fromFile(fileName)
      .on('json', jsonObj => {
        simulatedDevicesData.push(convertFromRawDeviceData(jsonObj));
      })
      .on('done', error => {
        if (error) {
          reject({ message: `Error trying to read CSV file: ${error.message}` });
        }
        else {
          resolve(addTimeSinceLastEvent(sortDevicesDataByTimestamp(simulatedDevicesData)));
        }
      });
  });

  // Extract an array of unique devices (objects with id and type) from the array of device event JSONs
  const getDevicesFromSimulatedData = (simulatedDevicesData) => Promise.resolve(simulatedDevicesData
    .filter((el1, i, arr) => arr.findIndex(el2 => el2.deviceId === el1.deviceId && el2.deviceType === el1.deviceType) === i)
    .map(el => ({
      id: el.deviceId,
      type: el.deviceType,
    })));

  // Extract an array of unique device types from the array of devices
  const getDeviceTypesFromDevices = (devices) => Promise.resolve(devices
    .filter((el1, i, arr) => arr.findIndex(el2 => el2.type === el1.type) === i)
    .map(el => el.type));

  const handleWIoTPResponse = (error, response, body, resolve, reject, successMessage) => {
    const statusCode = (response && response.statusCode) || 404;
    const hasError = error || statusCode >= 400;
    const errorMessage = hasError && body && body.message ? body.message : WIOTP_API_ERROR_MESSAGES.get(statusCode);
    const isUnacceptedError = hasError && !ACCEPTED_WIOTP_API_ERRORS.find(e => e === statusCode);
    const outputMessage = error || hasError ? errorMessage : successMessage;
    printResponse(outputMessage, statusCode, body);
    if (isUnacceptedError) {
      reject({ message: outputMessage });
    }
    else {
      resolve();
    }
  };

  // Check if Org is valid
  const checkWIoTPOrg = (iotApi, username, password) => new Promise((resolve, reject) => {
    request.get({
      url: `${iotApi}/`,
      rejectUnauthorized: false,
      json: true,
    }, (error, response, body) => {
      handleWIoTPResponse(error, response, body, resolve, reject, 'Organization is valid.');
    })
    .auth(username, password, true);
  });


  // Delete device types from WIoTP using an array of unique device types
  const deleteDeviceTypesFromWIoTP = (deviceTypes, iotApi, username, password) => new Promise((resolve, reject) => {
    Promise.all(deviceTypes.map(type => new Promise((deleteResolve, deleteReject) => {
      request.delete({
        url: `${iotApi}/device/types/${type}`,
        rejectUnauthorized: false,
      }, (error, response, body) => {
        handleWIoTPResponse(error, response, body, deleteResolve, deleteReject, 'Device types deleted successfully.');
      })
      .auth(username, password, true);
    })))
    .then(resolve)
    .catch(reject);
  });


  // Create device types in WIoTP using an array of unique device types
  const createDeviceTypesInWIoTP = (deviceTypes, iotApi, username, password) => new Promise((resolve, reject) => {
    Promise.all(deviceTypes.map(type => new Promise((postResolve, postReject) => {
      request.post({
        url: `${iotApi}/device/types`,
        rejectUnauthorized: false,
        json: true,
        body: {
          id: type,
          description: type,
          classId: 'Device',
          deviceInfo: {},
          metadata: {},
        },
      }, (error, response, body) => {
        handleWIoTPResponse(error, response, body, postResolve, postReject, 'Device types created successfully.');
      })
      .auth(username, password, true);
    })))
    .then(resolve)
    .catch(reject);
  });


  // Delete devices from WIoTP using an array of unique devices
  const deleteDevicesFromWIoTP = (devices, iotApi, username, password) => new Promise((resolve, reject) => {
    const body = [];
    devices.forEach(device => {
      body.push({ typeId: device.type, deviceId: device.id });
    });

    request.post({
      url: `${iotApi}/bulk/devices/remove`,
      rejectUnauthorized: false,
      json: true,
      body,
    }, (error, response, respBody) => {
      handleWIoTPResponse(error, response, respBody, resolve, reject, 'Devices deleted successfully.');
    })
    .auth(username, password, true);
  });


  // Create devices in WIoTP using an array of unique devices
  const createDevicesInWIoTP = (devices, iotApi, username, password) => new Promise((resolve, reject) => {
    const devicesBody = [];
    devices.forEach(device => {
      devicesBody.push({
        typeId: device.type,
        deviceId: device.id,
        metadata: {},
        authToken: DEVICE_PASSWORD,
      });
    });

    request.post({
      url: `${iotApi}/bulk/devices/add`,
      rejectUnauthorized: false,
      json: true,
      body: devicesBody,
    }, (error, response, body) => {
      handleWIoTPResponse(error, response, body, resolve, reject, 'Devices created successfully.');
    })
    .auth(username, password, true);
  });

  // Connect devices to WIoTP using an array of unique devices
  const connectDevicesInWIoTP = (devices, org, mqttUrl) => new Promise(resolve => {
    // Array of device connections
    const connectionsMap = new Map();
    Promise.all(devices.map(device => new Promise(connectionResolve => {
      const { id, type } = device;
      const clientId = `d:${org}:${type}:${id}`;
      const createDeviceConnection = () => mqtt.connect(mqttUrl, {
        clientId,
        username: 'use-token-auth',
        rejectUnauthorized: false,
        password: DEVICE_PASSWORD,
      });

      const client = createDeviceConnection();

      client.on('connect', () => {
        console.log(`Device connection ${clientId} successfully established.`);
        if (!connectionsMap.has(clientId)) {
          connectionsMap.set(clientId, client);
          console.log(`${clientId} was added to the connection pool (size ${connectionsMap.size}).`);
        }
        connectionResolve();
      });

      client.on('error', (error) => {
        console.log(`An error occurred for ${clientId} error ${error}`);
        if (!connectionsMap.has(clientId)) {
          console.log(`Failed to create device connection ${clientId}.`);
        }
        connectionResolve();
      });

      client.on('close', () => {
        console.log(`Connection ${clientId} closed.`);
        if (connectionsMap.has(clientId)) {
          connectionsMap.delete(clientId);
          console.log(`${clientId} was removed from the connection pool (size ${connectionsMap.size}).`);
        }
      });
    }))).then(() => resolve(connectionsMap));
  });

  // Publish a device payload to WIoTP using a JSON with device events (containing metadata and payload)
  const sendSimulatedPayloadToWIoTP = (deviceData, connectionsMap, org) => new Promise(resolve => {
    const { deviceId, deviceType, eventType, format, d } = deviceData;
    const clientId = `d:${org}:${deviceType}:${deviceId}`;
    const client = connectionsMap.get(clientId);
    const topic = `iot-2/evt/${eventType}/fmt/${format}`;
    const payload = JSON.stringify(d);
    if (client) {
      client.publish(topic, payload, {}, () => {
        console.log(`${clientId} published payload ${payload} to topic ${topic}.`);
        resolve(true);
      });
    }
    else {
      console.log(`Device connection ${clientId} not found. Payload not sent.`);
      resolve(false);
    }
  });

  // Disconnect all devices using connectionsMap
  const disconnectDevicesFromWIoTP = (connectionsMap) => new Promise(resolve => {
    Promise.all(Array.from(connectionsMap, ([clientId, client]) => new Promise(connectionResolve => {
      client.end();
      console.log(`Trying to close connection for ${clientId}`);
      client.on('close', () => connectionResolve());
    }))).then(resolve);
  });

  // Flag that indicates if the simulator is running
  let running = false;
  const rejectWithError = (error, reject) => {
    running = false;
    reject(error);
  };
  const resolveWithSuccess = (resolve) => {
    running = false;
    resolve({ message: SUCCESS_MESSAGE });
  };

  // Delay the execution of a function that returns a promise
  const delayPromiseExecution = (promiseFunction, milliseconds) => new Promise(resolve => {
    console.log(`Delaying ${millisecondsToHHMMSS(milliseconds)} ...`);
    // This flag should always be true while the simulation is running, if it is set to false, it means that the user has interrupted the simulator.
    if (running) {
      setTimeout(() => {
        promiseFunction().then(resolve);
      }, milliseconds);
    }
    else {
      console.log('Simulation cancelled, ignoring device event.');
      resolve();
    }
  });

  return ({
    isRunning: () => running,
    stop: () => { running = false; },
    run: req => {
      running = true;
      const { body: { wiotp, params } } = req;
      const ORG = wiotp.org;
      const USERNAME = wiotp.apiKey;
      const PASSWORD = wiotp.authToken;
      const HTTP_DOMAIN = wiotp.httpDomain || DEFAULT_HTTP_DOMAIN;
      const MQTT_DOMAIN = wiotp.mqttDomain || DEFAULT_MQTT_DOMAIN;
      const IOTP_API = `https://${ORG}.${HTTP_DOMAIN}/api/v0002`;
      const MQTT_URL = `mqtts://${ORG}.${MQTT_DOMAIN}:8883`;

      // Simulator params
      const CSV_FILE_PATH = params.csvFilePath || DEFAULT_CSV_FILE_PATH;
      const EVENT_INTERVAL_DIVISOR = params.publishIntervalDivisor || 100;
      const DELETE_DATA = params.delete || false;
      const REBUILD_DATA = params.rebuild || false;
      const SIMULATE_DATA = params.simulate || false;
      // Default action: rebuild WIoTP data and simulate
      const REBUILD_AND_SIMULATE_DATA = !DELETE_DATA && !REBUILD_DATA && !SIMULATE_DATA;

      // Set a timestamp before running the simulator
      const startDate = new Date();
      let numberOfPayloadsPublished = 0;

      // Bind methods that depend on user input
      const checkOrg = () => checkWIoTPOrg(IOTP_API, USERNAME, PASSWORD);
      const deleteDeviceTypes = (deviceTypes) => deleteDeviceTypesFromWIoTP(deviceTypes, IOTP_API, USERNAME, PASSWORD);
      const deleteDevices = (devices) => deleteDevicesFromWIoTP(devices, IOTP_API, USERNAME, PASSWORD);
      const createDeviceTypes = (deviceTypes) => createDeviceTypesInWIoTP(deviceTypes, IOTP_API, USERNAME, PASSWORD);
      const createDevices = (devices) => createDevicesInWIoTP(devices, IOTP_API, USERNAME, PASSWORD);
      const connectDevices = (devices) => connectDevicesInWIoTP(devices, ORG, MQTT_URL);
      const sendSimulatedPayload = (deviceData, connectionsMap) => sendSimulatedPayloadToWIoTP(deviceData, connectionsMap, ORG);
      const disconnectDevices = disconnectDevicesFromWIoTP;

      // Iterate through all elements in the device event JSON array and
      // create a chained promise that calls sendSimulatedPayload() in series for each event in the array
      // (and respecting the interval between events)
      const simulate = (devicesData, connectionsMap) => {
        const deviceDataPublishPromises = devicesData
          .map(deviceData => () => delayPromiseExecution(
            () => sendSimulatedPayload(deviceData, connectionsMap)
              .then(sent => (numberOfPayloadsPublished += (sent ? 1 : 0))),
              deviceData.timeSinceLastEvent / EVENT_INTERVAL_DIVISOR
            )
          );
        return deviceDataPublishPromises.reduce((p, f) => p.then(f), Promise.resolve());
      };

      // Helper function that extracts all the information needed by the simulator from the CSV file.
      // It also forwards the arrays needed for further steps in the simulation.
      const extractDataFromSimulatedDataFile = (csvFilePath) => readSimulatedDataFile(csvFilePath)
        .then(simulatedData => getDevicesFromSimulatedData(simulatedData)
          .then(devices => getDeviceTypesFromDevices(devices)
            .then(deviceTypes => Promise.resolve({ deviceTypes, devices, simulatedData }))
          )
        );

      // Helper function that extracts all the information needed to delete/create devices and device types in WIoTP
      // from the CSV file and deletes all these devices and device types from WIoTP.
      // It also forwards the arrays needed for further steps in the simulation.
      const deleteWIoTPDevicesDataFromSimulatedDataFile = (csvFilePath) => checkOrg()
        .then(() => extractDataFromSimulatedDataFile(csvFilePath))
        .then(({ deviceTypes, devices, simulatedData }) => deleteDevices(devices)
          .then(() => deleteDeviceTypes(deviceTypes))
          .then(() => Promise.resolve({ deviceTypes, devices, simulatedData }))
        );

      // Helper function that calls deleteWIoTPDevicesDataFromSimulatedDataFile() and also recreates devices and device types in WIoTP
      // It also forwards the arrays needed for further steps in the simulation.
      const rebuildWIoTPDevicesDataFromSimulatedDataFile = (csvFilePath) => deleteWIoTPDevicesDataFromSimulatedDataFile(csvFilePath)
        .then(({ deviceTypes, devices, simulatedData }) => createDeviceTypes(deviceTypes)
          .then(() => createDevices(devices))
          .then(() => Promise.resolve({ deviceTypes, devices, simulatedData }))
        );

      return new Promise((resolve, reject) => {
        if (!ORG || !USERNAME || !PASSWORD || !HTTP_DOMAIN || !MQTT_DOMAIN) {
          return reject({ message: 'Missing one or more WIoTP connection settings.' });
        }

        // Run the selected job in the simulator ('delete', 'rebuild', 'simulate', or the default option which is 'rebuild then simulate')
        if (DELETE_DATA) {
          return deleteWIoTPDevicesDataFromSimulatedDataFile(CSV_FILE_PATH)
            .then(() => console.log(`Finished deleting devices and device types in ${getExecutionTime(startDate)}`))
            .then(() => resolveWithSuccess(resolve))
            .catch(e => rejectWithError(e, reject));
        }
        else if (REBUILD_DATA) {
          return rebuildWIoTPDevicesDataFromSimulatedDataFile(CSV_FILE_PATH)
            .then(() => console.log(`Finished rebuilding devices and device types in ${getExecutionTime(startDate)}`))
            .then(() => resolveWithSuccess(resolve))
            .catch(e => rejectWithError(e, reject));
        }
        else if (SIMULATE_DATA) {
          return checkOrg()
            .then(() => extractDataFromSimulatedDataFile(CSV_FILE_PATH))
            .then(({ devices, simulatedData }) => getDevicesFromSimulatedData(simulatedData)
              .then(() => console.log('Simulation data successfully read from CSV file. Connecting devices ...'))
              .then(() => connectDevices(devices))
              .then((connectionsMap) => Promise.resolve(console.log('Devices connected. Starting simulation ...'))
                .then(() => simulate(simulatedData, connectionsMap))
                .then(() => console.log(`Simulation ended (${numberOfPayloadsPublished} events published). Disconnecting devices ...`))
                .then(() => disconnectDevices(connectionsMap))
              )
            )
            .then(() => console.log(`Done in ${getExecutionTime(startDate)}`))
            .then(() => resolveWithSuccess(resolve))
            .catch(e => rejectWithError(e, reject));
        }
        else if (REBUILD_AND_SIMULATE_DATA) {
          return rebuildWIoTPDevicesDataFromSimulatedDataFile(CSV_FILE_PATH)
            .then(({ devices, simulatedData }) => Promise.resolve(() => console.log('Devices and device types successfully created. Connecting devices ...'))
              .then(() => connectDevices(devices))
              .then((connectionsMap) => Promise.resolve(console.log('Devices connected. Starting simulation ...'))
                .then(() => simulate(simulatedData, connectionsMap))
                .then(() => console.log(`Simulation ended (${numberOfPayloadsPublished} events published). Disconnecting devices ...`))
                .then(() => disconnectDevices(connectionsMap))
              )
            )
            .then(() => console.log(`Done in ${getExecutionTime(startDate)}`))
            .then(() => resolveWithSuccess(resolve))
            .catch(e => rejectWithError(e, reject));
        }
        return null;
      });
    },
  });
};
