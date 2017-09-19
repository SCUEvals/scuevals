import { SET_USER_INFO, DEL_USER_INFO } from '../actions';

export default function(state = null, action) {
  switch (action.type) {
  case SET_USER_INFO:
    if (action.payload.profileObj) {
    console.log("reducer used, action: ", action.payload.profileObj);
    return action.payload.profileObj;
  }
    case DEL_USER_INFO:
      return null;

  default:
    return state;
  }
}
