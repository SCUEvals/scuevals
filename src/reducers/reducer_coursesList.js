import { SET_COURSES_LIST } from '../actions';

export default function (state = null, action) {
  switch (action.type) {
    case SET_COURSES_LIST:
      return action.payload;

    default:
      return state;
  }
}
