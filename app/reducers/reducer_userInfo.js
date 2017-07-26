import { SET_USER_INFO } from '../actions';

export default function(state = {givenName:"Sign in with SCU Gmail", imageUrl:null}, action) {
  switch (action.type) {
  case SET_USER_INFO:
    if (action.payload.profileObj) {
    console.log("reducer used, action: ", action.payload.profileObj);
    return action.payload.profileObj;
  }
  
  default:
    return state;
  }
}
