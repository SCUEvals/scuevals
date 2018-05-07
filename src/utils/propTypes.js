import PropTypes from 'prop-types';

export const userInfoPT = PropTypes.shape({
  jwt: PropTypes.string,
  id: PropTypes.number,
  university_id: PropTypes.number,
  email: PropTypes.string,
  picture: PropTypes.string,
  type: PropTypes.string,
  permissions: PropTypes.array,
  gender: PropTypes.string,
  // graduation_year: PropTypes.number,
  // majors: PropTypes.array
});

export const majorsListPT = PropTypes.shape({
  object: PropTypes.object,
  array: PropTypes.array,
});

export const quartersListPT = PropTypes.shape({
  object: PropTypes.object,
  array: PropTypes.array,
});

export const coursesListPT = PropTypes.shape({
  object: PropTypes.object,
  array: PropTypes.array,
});

export const departmentsListPT = PropTypes.shape({
  object: PropTypes.object,
  array: PropTypes.array,
});

export const professorsListPT = PropTypes.shape({
  object: PropTypes.object,
  array: PropTypes.array,
});

export const locationPT = PropTypes.shape({
  pathname: PropTypes.string,
}).isRequired;

export const matchPT = PropTypes.shape({
  params: PropTypes.object,
}).isRequired;

export const historyPT = PropTypes.shape({
  action: PropTypes.string,
  push: PropTypes.func,
}).isRequired;

export const searchResultsPT = PropTypes.shape({
  courses: PropTypes.array,
  professors: PropTypes.array,
});
