import jwtDecode from 'jwt-decode';
import { SET_USER_INFO } from '../actions';

const initObj = {};
let initState = null;
if (localStorage.getItem('jwt')) {
  initObj.jwt = localStorage.getItem('jwt');
  try {
    initState = Object.assign(initObj, jwtDecode(localStorage.getItem('jwt')).sub);
    /* will catch if jwtDecode fails (jwt not properly encoded,
       user probably manually entered non-decodable jwt) */
  } catch (err) {
    localStorage.removeItem('jwt');
  }
}

export default function (state = initState, action) {
  switch (action.type) {
  case SET_USER_INFO: {
    if (!action.payload) return null; // if deleting userInfo
    const obj = {};
    obj.jwt = action.payload;
    return Object.assign(obj, jwtDecode(action.payload).sub);
  }

  default:
    return state;
  }
}
