import { SET_QUARTERS_LIST } from '../actions';

export default function (state = null, action) {
  switch (action.type) {
  case SET_QUARTERS_LIST:
    return action.payload;

  default:
    return state;
  }
}
