import { combineReducers } from 'redux';
import {reducer as formReducer} from 'redux-form';
import userInfoReducer from './reducer_userInfo';



const rootReducer = combineReducers({
  form: formReducer,
  userInfo: userInfoReducer
});

export default rootReducer;
