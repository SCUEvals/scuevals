export const SET_USER_INFO = 'set_user_info';
export const DEL_USER_INFO = 'del_user_info';
export const SET_SEARCH_RESULTS = 'set_search_results';
export const SET_MAJORS_LIST = 'set_majors_list';
export const SET_QUARTERS_LIST = 'set_quarters_list';
export const SET_DEPARTMENTS_LIST = 'set_departments_list';
export const SET_PROFESSORS_LIST = 'set_professors_list';
export const SET_COURSES_LIST = 'set_courses_list';

/*Note: May store both object and sorted array since sorting a big array once and storing is more efficient than converting object to array and sorting each render
  Storing as object to use dot notation for O(1) lookup instead of looking through entire array O(n)
*/

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
  majorsList.sort((a, b) => {
    return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
  });
  let majorsListObj = majorsList ? majorsList.reduce((obj, item) => (obj[item.id] = item, obj) ,{}) : null;
  let returnedObj = {object: majorsListObj, array: majorsList};
  return {
    type: SET_MAJORS_LIST,
    payload: returnedObj
  };
}


export function setQuartersList(quartersList) {
  quartersList.sort((a, b) => { //convert object with ids as keys into array of objects, then sort
    return a.year > b.year ? 1 : a.year < b.year ? -1 : a.name == 'Winter' ? -1 : a.name == 'Fall' ? 1 : b.name == 'Fall' ? -1 : 1;
  }).map(quarter => {quarter.label = quarter.name + ' ' + quarter.year; return quarter;});
  let quartersListObj = quartersList ? quartersList.reduce((obj, item) => (obj[item.id] = item, obj) ,{}) : null;
  let returnedObj = {object: quartersListObj, array: quartersList};
  return {
    type: SET_QUARTERS_LIST,
    payload: returnedObj
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
  professorsList.map(professor => {professor.label = professor.last_name + ', ' + professor.first_name});
  professorsList.sort((a, b) => {
    return a.label > b.label ? 1 : a.label < b.label ? -1 : 0;
  });
  let professorsListObj = professorsList ? professorsList.reduce((obj, item) => (obj[item.id] = item, obj) ,{}) : null;
  let returnedObj = {object: professorsListObj, array: professorsList};
  return {
    type: SET_PROFESSORS_LIST,
    payload: returnedObj
  };
}

export function setCoursesList(coursesList, departmentsList) {
  let returnedObj;
  let coursesListObj = coursesList ? coursesList.reduce((obj, item) => (obj[item.id] = item, obj) ,{}) : null;
  if (departmentsList) {
    coursesList.sort((a, b) => {
      if (a.department_id == b.department_id) {
        //nums can have letters in them too (ex. 12L), so parse integers and compare
        let parsedANum = parseInt(a.number, 10);
        let parsedBNum = parseInt(b.number, 10);
        //if integers same, check for letters to decide
        if (parsedANum == parsedBNum) return a.number > b.number ? 1 : a.number < b.number ? -1 : 0;
        return parsedANum > parsedBNum ? 1 : parsedANum < parsedBNum ? -1 : 0;
      }
      else return departmentsList[a.department_id].abbr > departmentsList[b.department_id].abbr ? 1 : departmentsList[a.department_id].abbr < departmentsList[b.department_id].abbr ? -1 : 0;
    }).map(course => {course.label = departmentsList[course.department_id].abbr + ' ' + course.number + ': ' +course.title; return course;});
    returnedObj = {object: coursesListObj, array: coursesList, departmentsListLoaded: true};
  }
  else returnedObj = {object: coursesListObj, array: coursesList, departmentsListLoaded: false};
  return {
    type: SET_COURSES_LIST,
    payload: returnedObj
  };
}
