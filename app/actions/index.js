import axios from 'axios';

export const FETCH_SEARCH = 'fetch_search'; //from searchbar
export const FETCH_EVALS = 'fetch_evals';//from selecting choices shown after search
export const POST_EVAL = 'post_eval';
export const SET_USER_INFO = 'set_user_info';
export const DEL_USER_INFO = 'del_user_info';

export const ROOT_URL = 'http://api.scuevals.com';

export const postConfig = {
  headers: {
    'Content-Type': 'application/json'
  }
}

export function setUserInfo(info) {
  return {
    type: SET_USER_INFO,
    payload: info
  };
}

export function delUserInfo() {
  return {
    type: DEL_USER_INFO
  };
}

export function fetchSearch(values) {
  const request = axios.post(`${ROOT_URL}/${FALL2017}/all`, `q=${values.searchbar}`, postConfig);

  return {
    type: FETCH_EVALS,
    payload: request
  };
}

export function fetchEvals(id) {
  const request = axios.get(`${ROOT_URL}/${FALL2017}/all`);

  return {
    type: FETCH_SEARCH,
    payload: request
  };
}

export function postEval(values, callback) {
  const request = axios.post(`${ROOT_URL}/${FALL2017}/all`, values)
    .then(() => callback());

  return {
    type: POST_EVAL,
    payload: request
  };
}
