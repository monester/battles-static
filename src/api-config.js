let backendHost;

const hostname = window && window.location && window.location.hostname;

if(hostname === 'battles.universe.cc') {
  backendHost = 'https://battles.universe.cc/api';
} else if(hostname === 'staging.battles.universe.cc') {
  backendHost = 'https://staging.battles.universe.cc';
} else {
  backendHost = process.env.REACT_APP_BACKEND_HOST || 'http://127.0.0.1:8080';
}

export const API_ROOT = `${backendHost}`;
