import CustomSort from '../utils/customSort';

export const SET_USER_INFO = 'set_user_info';
export const SET_SEARCH_RESULTS = 'set_search_results';
export const SET_MAJORS_LIST = 'set_majors_list';
export const SET_QUARTERS_LIST = 'set_quarters_list';
export const SET_DEPARTMENTS_LIST = 'set_departments_list';
export const SET_PROFESSORS_LIST = 'set_professors_list';
export const SET_COURSES_LIST = 'set_courses_list';

/* Note: May store both object and sorted array since sorting a big array once and storing is more
   efficient than converting object to array and sorting each render. Storing as object to use dot
   notation for O(1) lookup instead of looking through entire array O(n) */
export function setUserInfoAction(jwt) {
  if (!jwt) localStorage.removeItem('jwt');
  else {
    try {
      localStorage.setItem('jwt', jwt);
    } catch (err) {
      /* eslint-disable no-console */
      console.error('Cannot execute localStorage.setItem(). Is private mode enabled? Error:', err);
      /* eslint-enable no-console */
    }
  }
  return {
    type: SET_USER_INFO,
    payload: jwt,
  };
}

export function setSearchResultsAction(results) {
  return {
    type: SET_SEARCH_RESULTS,
    payload: results,
  };
}

export function setMajorsListAction(majorsList) {
  const majorsListObj = majorsList ? majorsList.reduce((obj, item) => (obj[item.id] = item, obj), {}) : null;
  CustomSort('major', majorsList, null, majorsListObj);
  const returnedObj = { object: majorsListObj, array: majorsList };
  return {
    type: SET_MAJORS_LIST,
    payload: returnedObj,
  };
}


export function setQuartersListAction(quartersList) {
  quartersList.map((quarter) => { quarter.label = `${quarter.name} ${quarter.year}`; return quarter; });
  const quartersListObj = quartersList ? quartersList.reduce((obj, item) => (obj[item.id] = item, obj), {}) : null;
  CustomSort('quarter', quartersList);
  const returnedObj = { object: quartersListObj, array: quartersList };
  return {
    type: SET_QUARTERS_LIST,
    payload: returnedObj,
  };
}

export function setDepartmentsListAction(departmentsList) {
  const departmentsListObj = departmentsList ? departmentsList.reduce((obj, item) => (obj[item.id] = item, obj), {}) : null;
  CustomSort('department', departmentsList, null, departmentsListObj);
  const returnedObj = { object: departmentsListObj, array: departmentsList };
  return {
    type: SET_DEPARTMENTS_LIST,
    payload: returnedObj,
  };
}

export function setProfessorsListAction(professorsList) {
  professorsList.map((professor) => { professor.label = `${professor.last_name}, ${professor.first_name}`; });
  const professorsListObj = professorsList ? professorsList.reduce((obj, item) => (obj[item.id] = item, obj), {}) : null;
  CustomSort('professor', professorsList);
  const returnedObj = { object: professorsListObj, array: professorsList };
  return {
    type: SET_PROFESSORS_LIST,
    payload: returnedObj,
  };
}

export function setCoursesListAction(coursesList, departmentsList) {
  let returnedObj;
  const coursesListObj = coursesList ?
    // eslint-disable-next-line no-param-reassign
    coursesList.reduce((obj, item) => (obj[item.id] = item, obj), {})
    : null;
  if (departmentsList) {
    CustomSort('course', coursesList, null, coursesListObj);
    // eslint-disable-next-line no-param-reassign
    coursesList.map((course) => { course.label = `${departmentsList.object[course.department_id].abbr} ${course.number}: ${course.title}`; return course; });
    returnedObj = { object: coursesListObj, array: coursesList, departmentsListLoaded: true };
  } else returnedObj = { object: coursesListObj, array: coursesList, departmentsListLoaded: false };
  return {
    type: SET_COURSES_LIST,
    payload: returnedObj,
  };
}
