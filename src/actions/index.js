export const SET_USER_INFO = 'set_user_info';
export const DEL_USER_INFO = 'del_user_info';
export const SET_SEARCH_RESULTS = 'set_search_results';

export function setUserInfo(jwt) {
  return {
    type: SET_USER_INFO,
    payload: jwt
  }
}

export function setSearchResults(results) {
  return {
    type: SET_SEARCH_RESULTS,
    payload: results
  };
}

export function delUserInfo() {
  return {
    type: DEL_USER_INFO
  };
}
