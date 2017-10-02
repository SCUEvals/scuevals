import { SET_SEARCH_RESULTS } from '../actions';

export default function(state = null, action) {
  switch (action.type) {

    case SET_SEARCH_RESULTS:
      return action.payload;

    default:
      return state;
  }
}
