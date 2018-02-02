import { SET_MY_EVALS_LIST } from '../actions';

export default function(state = null, action) {
  switch (action.type) {

    case SET_MY_EVALS_LIST:
      return action.payload;

    default:
      return state;
  }
}
