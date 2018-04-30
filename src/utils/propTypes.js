import PropTypes from 'prop-types';

export const UserInfoPT = PropTypes.shape({
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

export const MajorsListPT = PropTypes.shape({
  object: PropTypes.object,
  array: PropTypes.array,
});

export const QuartersListPT = PropTypes.shape({
  object: PropTypes.object,
  array: PropTypes.array,
});

export const CoursesListPT = PropTypes.shape({
  object: PropTypes.object,
  array: PropTypes.array,
});

export const DepartmentsListPT = PropTypes.shape({
  object: PropTypes.object,
  array: PropTypes.array,
});

export const ProfessorsListPT = PropTypes.shape({
  object: PropTypes.object,
  array: PropTypes.array,
});

export const LocationPT = PropTypes.shape({
  pathname: PropTypes.string,
}).isRequired;

export const MatchPT = PropTypes.shape({
  params: PropTypes.object,
}).isRequired;
