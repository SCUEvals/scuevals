import { SET_USER_INFO } from '../actions';
import jwtDecode from 'jwt-decode';

let obj = {};
let initState = null;
if (localStorage.getItem('jwt')) {
  obj.jwt = localStorage.getItem('jwt');
  try {
    initState = Object.assign(obj, jwtDecode(localStorage.getItem('jwt')).sub);
  }
  catch (err) { //will catch if jwtDecode fails (jwt not properly encoded, user probably manually entered non-decodable jwt)
    localStorage.removeItem('jwt');
  }
}

export default function(state = initState, action) {
  switch (action.type) {

    case SET_USER_INFO: {
      if (!action.payload) return null; //if deleting userInfo
      let obj = {};
      obj.jwt = action.payload;
      return Object.assign(obj, jwtDecode(action.payload).sub);
    }

    default:
      return state;
  }
}
