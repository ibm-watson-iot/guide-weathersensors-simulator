'use strict';

import requestModule from 'request';

import { BASE_URL } from '../constants/route';

const request = requestModule.defaults({
  baseUrl: BASE_URL,
});

const doRequest = (method, url, params) => new Promise((resolve, reject) => {
  const options = {
    url,
    method,
    body: params,
    json: true,
    headers: { 'Content-Type': 'application/json', csrfToken: window.csrfToken },
  };

  request(options, (err, response, body) => {
    if (err) {
      reject(err);
    }
    else {
      resolve(body);
    }
  });
});

export const doGet = (url) => doRequest('GET', url, 'GET', {});
export const doPost = (url, params) => doRequest('POST', url, params);
export const doDelete = (url, params) => doRequest('DELETE', url, params);
