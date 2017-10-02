import { combineReducers } from 'redux';
import {reducer as formReducer} from 'redux-form';
import userInfoReducer from './reducer_userInfo';
import searchResultsReducer from './reducer_searchResults';

const rootReducer = combineReducers({
  form: formReducer,
  userInfo: userInfoReducer,
  searchResults: searchResultsReducer
});

export default rootReducer;
