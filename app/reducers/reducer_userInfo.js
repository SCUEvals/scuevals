import { SET_USER_INFO, DEL_USER_INFO } from '../actions';
import jwtDecode from 'jwt-decode';

var obj = {};
var initState;
if (localStorage.jwt) {
  obj.jwt = localStorage.jwt;
  try {
    initState = Object.assign(obj, jwtDecode(localStorage.jwt).sub);
  }
  catch (e) { //will catch is jwtDecode fails. If jwtDecode fails, then falsy token exists (user probably manually entered non-decodable jwt)
    localStorage.removeItem('jwt');
    initState = null;
  }
} else initState = null;


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
