export const SET_USER_INFO = 'set_user_info';
export const DEL_USER_INFO = 'del_user_info';
export const SET_SEARCH_RESULTS = 'set_search_results';
export const SET_MAJORS_LIST = 'set_majors_list';
export const SET_QUARTERS_LIST = 'set_quarters_list';
export const SET_DEPARTMENTS_LIST = 'set_departments_list';
export const SET_PROFESSORS_LIST = 'set_professors_list';

export function setUserInfo(jwt) {
  return {
    type: SET_USER_INFO,
    payload: jwt
  }
}

export function setSearchResults(results) {
  return {
    type: SET_SEARCH_RESULTS,
    payload: results
  };
}

export function delUserInfo() {
  return {
    type: DEL_USER_INFO
  };
}

export function setMajorsList(majorsList) {
  let majorsListObj = majorsList ? majorsList.reduce((obj, item) => (obj[item.id] = item, obj) ,{}) : null;
  return {
    type: SET_MAJORS_LIST,
    payload: majorsListObj
  };
}


export function setQuartersList(quartersList) {
  let quartersListObj = quartersList ? quartersList.reduce((obj, item) => (obj[item.id] = item, obj) ,{}) : null;
  return {
    type: SET_QUARTERS_LIST,
    payload: quartersListObj
  };
}

export function setDepartmentsList(departmentsList) {
  let departmentsListObj = departmentsList ? departmentsList.reduce((obj, item) => (obj[item.id] = item, obj) ,{}) : null;
  return {
    type: SET_DEPARTMENTS_LIST,
    payload: departmentsListObj
  };
}

export function setProfessorsList(professorsList) {
  return {
    type: SET_PROFESSORS_LIST,
    payload: professorsList
  };
}
