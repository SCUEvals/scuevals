import { SET_USER_INFO, DEL_USER_INFO } from '../actions';
import jwtDecode from 'jwt-decode';

export default function(state = localStorage.jwt ? jwtDecode(localStorage.jwt) : null, action) {
  switch (action.type) {
        
    case SET_USER_INFO:
      return jwtDecode(action.payload);

    case DEL_USER_INFO:
      return null;

    default:
      return state;
  }
}
