import { storeWithMiddleware } from '../index';

// obj param for initial sorting when store not yet sorted or set (only passed in actions/index.js)
export default function customSort(sortValue, arr, defaultSort, obj) {
  switch (sortValue) {
  case 'quarter':
    sortByQuarter(arr);
    break;

  case 'course':
    sortByCourse(arr, defaultSort, obj);
    break;

  case 'professor':
    sortByProfessor(arr, defaultSort, obj);
    break;

  case 'votes_score':
    sortByVotesScore(arr, defaultSort);
    break;

  case 'major':
    sortByMajor(arr, defaultSort, obj);
    break;

  case 'grad_year':
    sortByGradYear(arr, defaultSort);
    break;

  case 'recent':
    sortByPostTime(arr);
    break;

  case 'department':
    sortByDepartment(arr);
    break;

  default: // if no sortValue, use default sort for component
    switch (defaultSort) {
    case 'quarter':
      sortByQuarter(arr);
      break;

    case 'recent':
      sortByPostTime(arr);
      break;

    default:
      break;
    }
  }
}

// private helper functions
function sortByQuarter(arr) {
  arr.sort(orderByQuarter);
}

function sortByCourse(arr, defaultSort) {
  arr.sort((a, b) => {
    const aDptID = a.course ? a.course.department_id : a.department_id;
    const bDptID = b.course ? b.course.department_id : b.department_id;
    const aNum = a.course ? a.course.number : a.number;
    const bNum = b.course ? b.course.number : b.number;
    if (aDptID === bDptID) {
      // can have letters in them too (ex. 12L), so parse integers & compare
      const parsedANum = parseInt(aNum, 10);
      const parsedBNum = parseInt(bNum, 10);
      // if integers same, check for letters to decide
      if (parsedANum === parsedBNum) {
        return aNum > bNum ? 1
          : aNum < bNum ? -1
          : orderByDefault(a, b, defaultSort);
      }
      return parsedANum > parsedBNum ? 1 : -1;
    }
    const departmentsListObj = storeWithMiddleware.getState().departmentsList.object;
    return departmentsListObj[aDptID].name > departmentsListObj[bDptID].name ? 1
      : departmentsListObj[aDptID].name < departmentsListObj[bDptID].name ? -1
      : orderByDefault(a, b, defaultSort);
  });
}

function sortByProfessor(arr, defaultSort, obj) {
  const professorsListObj = obj || storeWithMiddleware.getState().professorsList.object;
  if (professorsListObj) {
    arr.sort((a, b) => {
      const aProfID = a.professor ? a.professor.id : a.id;
      const bProfID = b.professor ? b.professor.id : b.id;
      return professorsListObj[aProfID].label > professorsListObj[bProfID].label ? 1
        : professorsListObj[aProfID].label < professorsListObj[bProfID].label ? -1
        : orderByDefault(a, b, defaultSort);
    });
  }
}

function sortByMajor(arr, defaultSort, obj) {
  // if sorting for store, no authors
  if (obj) {
    arr.sort((a, b) => (a.name > b.name ? 1
      : a.name < b.name ? -1
      : 0));
  } else {
    arr.sort((a, b) => {
      const majorsListObj = storeWithMiddleware.getState().majorsList.object;
      if (!a.author.majors && !b.author.majors) return orderByDefault(a, b, defaultSort);
      else if (!a.author.majors) return 1;
      else if (!b.author.majors) return -1;

      const aMajors = a.author.majors.slice();
      const bMajors = b.author.majors.slice();
      aMajors.sort((a2, b2) => ( // alphabetically sort majors if multiple
        majorsListObj[a2].name > majorsListObj[b2].name ? 1 : -1
      ));
      bMajors.sort((a2, b2) => ( // alphabetically sort majors if multiple
        majorsListObj[a2].name > majorsListObj[b2].name ? 1 : -1
      ));
      if (!aMajors[0] && !bMajors[0]) return orderByDefault(a, b, defaultSort);
      for (let i = 0; i < Math.max(aMajors.length, bMajors.length); i++) {
        if (!aMajors[i]) return -1;
        else if (!bMajors[i]) return 1;
        else if (aMajors[i] !== bMajors[i]) {
          return majorsListObj[aMajors[i]].name > majorsListObj[bMajors[i]].name ? 1 : -1;
        }
      }
      return orderByDefault(a, b, defaultSort);
    });
  }
}

function sortByVotesScore(arr, defaultSort) {
  arr.sort((a, b) => (
    a.votes_score > b.votes_score ? -1
    : a.votes_score < b.votes_score ? 1
    : orderByDefault(a, b, defaultSort)
  ));
}

function sortByGradYear(arr, defaultSort) {
  arr.sort((a, b) => {
    const aGradYear = a.author.graduation_year;
    const bGradYear = b.author.graduation_year;
    return (
      !aGradYear && !bGradYear ? orderByDefault(a, b, defaultSort)
      : !bGradYear || aGradYear > bGradYear ? -1
      : !aGradYear || aGradYear < bGradYear ? 1
      : orderByDefault(a, b, defaultSort)
    );
  });
}

function sortByPostTime(arr) {
  arr.sort(orderByPostTime);
}

function sortByDepartment(arr) {
  arr.sort((a, b) => (a.name > b.name ? 1
    : a.name < b.name ? -1
    : 0
  ));
}

function orderByDefault(a, b, defaultVal) {
  switch (defaultVal) {
  case 'quarter':
    return orderByQuarter(a, b);

  case 'recent':
    return orderByPostTime(a, b);

  default:
    return 0;
  }
}

function orderByQuarter(a, b) {
  return (
    a.quarter_id > b.quarter_id ? -1
    : a.quarter_id < b.quarter_id ? 1
    : orderByPostTime(a, b)
  );
}

function orderByPostTime(a, b) {
  return a.post_time > b.post_time ? -1 : 1;
}
