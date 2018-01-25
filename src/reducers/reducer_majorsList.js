import { SET_MAJORS_LIST } from '../actions';

export default function(state = null, action) {
  switch (action.type) {

    case SET_MAJORS_LIST:
      let newObj = action.payload.reduce((obj, item) => (obj[item.id] = item, obj) ,{});
      return newObj;

    default:
      return state;
  }
}
