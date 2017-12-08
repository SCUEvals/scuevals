import { SET_USER_INFO, DEL_USER_INFO } from '../actions';
import jwtDecode from 'jwt-decode';

var obj = {};
var initState = null;
if (localStorage.jwt) {
  obj.jwt = localStorage.jwt;
  try {
    initState = Object.assign(obj, jwtDecode(localStorage.jwt).sub);
  }
  catch (err) { //will catch if jwtDecode fails (jwt not properly encoded, user probably manually entered non-decodable jwt)
    localStorage.removeItem('jwt');
  }
}

export default function(state = initState, action) {
  switch (action.type) {

    case SET_USER_INFO:
      var obj = {};
      obj.jwt = action.payload;
      return Object.assign(obj, jwtDecode(action.payload).sub);

    case DEL_USER_INFO:
      return null;

    default:
      return state;
  }
}
