import { SET_SEARCH_RESULTS, SET_USER_INFO } from '../actions';

export default function (state = null, action) {
  switch (action.type) {
  case SET_SEARCH_RESULTS:
    return action.payload;

  case SET_USER_INFO:
    if (!action.payload) return null;
    return state;

  default:
    return state;
  }
}
