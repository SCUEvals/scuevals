import { SET_USER_INFO, DEL_USER_INFO } from '../actions';
import jwtDecode from 'jwt-decode';

var obj = {};
var initState;
if (localStorage.jwt) {
  obj.jwt = localStorage.jwt;
  initState = Object.assign(obj, jwtDecode(localStorage.jwt).sub);
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
