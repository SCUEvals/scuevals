import axios from 'axios';

export const FETCH_SEARCH = 'fetch_search'; //from searchbar
export const FETCH_EVALS = 'fetch_evals';//from selecting choices shown after search
export const POST_EVAL = 'post_eval';
export const SET_USER_INFO = 'set_user_info';

const ROOT_URL = 'https://www.scu.edu/apps/ws/courseavail/search/';
const FALL2017 = 3900;

export function setUserInfo(info) {
  return {
    type: SET_USER_INFO,
    payload: info
  };
}





const config = {headers: {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Referer': 'https://www.scu.edu/apps/courseavail/?p=schedule'
  }
}

export function fetchSearch(values) {
  const request = axios.post(`${ROOT_URL}/${FALL2017}/all`, `q=${values.searchbar}`, config);

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
