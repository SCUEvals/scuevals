import { SET_DEPARTMENTS_LIST } from '../actions';

export default function (state = null, action) {
  switch (action.type) {
    case SET_DEPARTMENTS_LIST:
      return action.payload;

    default:
      return state;
  }
}
