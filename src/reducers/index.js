import { combineReducers } from 'redux';
import {reducer as formReducer} from 'redux-form';
import userInfoReducer from './reducer_userInfo';
import searchResultsReducer from './reducer_searchResults';
import majorsListReducer from './reducer_majorsList';
import postSearchListReducer from './reducer_postSearchList';
import { DEL_USER_INFO } from '../actions';

const rootReducer = combineReducers({
  form: formReducer.plugin({
    searchBar: (state, action) => { //if DEL_USER_INFO action type dispatched, delete input from searchBar (logging out)
      switch(action.type) {
        case DEL_USER_INFO:
          return undefined;
        default:
          return state;
      }
    }
  }),
  userInfo: userInfoReducer,
  searchResults: searchResultsReducer,
  majorsList: majorsListReducer,
  postSearchList: postSearchListReducer

});

export default rootReducer;
