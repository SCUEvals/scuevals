import { SET_USER_INFO } from '../actions';

export default function(state = {profileObj: {name:"Sign in"}}, action) {
  switch (action.type) {
  case SET_USER_INFO:
    console.log("reducer used, action: ", action);
    return action.payload;

  default:
    return state;
  }
}
