const PROTOCOL = window.location.protocol;
const HOSTNAME = window.location.hostname;
const PORT = ((window.location.port) ? `:${window.location.port}` : '');
export const BASE_URL = `${PROTOCOL}//${HOSTNAME}${PORT}`;
export const ROUTE_BLUEMIX_URL = window.bluemixUrl;
export const ROUTE_CONTEXT_ROOT = '/';
