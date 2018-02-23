import { combineReducers } from 'redux';
import {reducer as formReducer} from 'redux-form';
import userInfoReducer from './reducer_userInfo';
import searchResultsReducer from './reducer_searchResults';
import majorsListReducer from './reducer_majorsList';
import quartersListReducer from './reducer_quartersList';
import departmentsListReducer from './reducer_departmentsList';
import professorsListReducer from './reducer_professorsList';
import coursesListReducer from './reducer_coursesList';

const rootReducer = combineReducers({
  form: formReducer,
  userInfo: userInfoReducer,
  searchResults: searchResultsReducer,
  majorsList: majorsListReducer,
  quartersList: quartersListReducer,
  departmentsList: departmentsListReducer,
  professorsList: professorsListReducer,
  coursesList: coursesListReducer
});

export default rootReducer;
