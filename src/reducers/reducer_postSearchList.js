import { SET_POST_SEARCH_LIST } from '../actions';

export default function(state = {quarters: null}, action) {
  switch (action.type) {

    case SET_POST_SEARCH_LIST:
      return action.payload;

    default:
      return state;
  }
}
