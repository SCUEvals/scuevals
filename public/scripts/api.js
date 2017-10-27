import axios from 'axios';

import { storeWithMiddleware } from '../../app/index';

storeWithMiddleware.subscribe(listener);
console.log('store w/ middleware', storeWithMiddleware);
function select(state) {
  if (state.userInfo) return state.userInfo.jwt;
  else return '';
}

function listener() {
  let token = select(storeWithMiddleware.getState());
  axios.defaults.headers.common['Authorization'] = token;
}

const api = axios.create({
  baseURL: 'http://api.scuevals.com',
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
