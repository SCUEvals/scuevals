import { SET_MAJORS_LIST } from '../actions';

export default function (state = null, action) {
  switch (action.type) {
  case SET_MAJORS_LIST:
    return action.payload;

  default:
    return state;
  }
}
