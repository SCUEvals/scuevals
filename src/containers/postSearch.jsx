import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, change, formValueSelector } from 'redux-form';
import Select from 'react-select';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { storeWithMiddleware, READ_EVALUATIONS } from '../index';
import API from '../services/api';
import {
  setDepartmentsListAction,
  setQuartersListAction,
  setCoursesListAction,
  setProfessorsListAction,
} from '../actions';
import CustomSort from '../utils/customSort';
import {
  quartersListPT,
  coursesListPT,
  departmentsListPT,
  professorsListPT,
  matchPT,
  historyPT,
  userInfoPT,
} from '../utils/propTypes';
import '../styles/postSearch.scss';

class PostSearch extends Component {
  static propTypes = {
    quartersList: quartersListPT,
    coursesList: coursesListPT,
    departmentsList: departmentsListPT,
    professorsList: professorsListPT,
    userInfo: userInfoPT,
    match: matchPT,
    history: historyPT,
    handleSubmit: PropTypes.func.isRequired,
    quarter: PropTypes.number,
    course: PropTypes.number,
    professor: PropTypes.number,
    initialValues: PropTypes.oneOfType([
      PropTypes.shape({
        course: PropTypes.number,
      }),
      PropTypes.shape({
        professor: PropTypes.number,
      }),
    ]),
    setDepartmentsList: PropTypes.func.isRequired,
    setQuartersList: PropTypes.func.isRequired,
    setCoursesList: PropTypes.func.isRequired,
    setProfessorsList: PropTypes.func.isRequired,
  }

  static renderQuarters(field) {
    const { input, localQuartersList, onChangeFunc } = field;
    const { meta: { submitFailed, error } } = field;
    return (
      <div>
        <h5>{!localQuartersList ? 'Loading quarters...' : 'Choose quarter'}</h5>
        <Select
          disabled={!localQuartersList}
          value={input.value}
          valueKey="id"
          className={error && submitFailed ? 'select-error' : undefined}
          simpleValue
          options={localQuartersList}
          isLoading={!localQuartersList}
          onChange={(newQuarter) => {
            input.onChange(newQuarter);
            if (newQuarter !== input.value) onChangeFunc(newQuarter);
          }}
          placeholder="Select your quarter"
        />
      </div>
    );
  }

  static renderCourses(field) {
    const {
      input, localCoursesList, onChangeFunc,
    } = field;
    const { meta: { submitFailed, error } } = field;
    return (
      <div>
        <h5>{!localCoursesList ? 'Loading courses...' : 'Choose course'}</h5>
        <Select
          disabled={!localCoursesList}
          value={input.value}
          valueKey="id"
          className={error && submitFailed ? 'select-error' : undefined}
          simpleValue
          options={localCoursesList}
          isLoading={!localCoursesList}
          onChange={(newCourse) => {
            input.onChange(newCourse);
            if (newCourse !== input.value) onChangeFunc(newCourse);
          }}
          placeholder="Select your course"
        />
      </div>
    );
  }

  static renderProfessors(field) {
    const {
      input, localProfessorsList, postSearchForm, onChangeFunc,
    } = field;
    const { meta: { submitFailed, error } } = field;
    return (
      <div>
        <h5>{!localProfessorsList ? 'Loading professors...' : 'Choose professor'}</h5>
        <Select
          disabled={!localProfessorsList}
          value={input.value}
          valueKey="id"
          className={error && submitFailed ? 'select-error' : undefined}
          simpleValue
          options={localProfessorsList}
          isLoading={!localProfessorsList}
          onChange={(newProfessor) => {
            input.onChange(newProfessor);
            if (newProfessor !== input.value) onChangeFunc(newProfessor);
          }}
          placeholder="Select your professor"
          onOpen={() => {
            if (window.innerHeight < postSearchForm.clientHeight + 240) postSearchForm.style.marginBottom = '125px';
          }}
          onClose={() => (postSearchForm.style.marginBottom = '')}
        />
      </div>
    );
  }

  constructor(props) {
    super(props);
    const {
      departmentsList,
      quartersList,
      coursesList,
      professorsList,
      initialValues,
      userInfo,
      setDepartmentsList,
      setQuartersList,
      setCoursesList,
      setProfessorsList,
    } = props;
    this.state = {
      alreadyPosted: false,
      checkingIfPosted: false,
      localQuartersList: quartersList ? quartersList.array : undefined,
      localCoursesList: coursesList && coursesList.departmentsListLoaded ?
        coursesList.array : undefined,
      localProfessorsList: professorsList ? professorsList.array : undefined,
      /* keep track of order of selected fields to behave appropriately (clear/repopulate proper
         fields) */
      selectionOrder: initialValues && initialValues.course ?
        ['course'] : initialValues && initialValues.professor ? ['professor'] : [],
    };

    if (!userInfo.permissions.includes(READ_EVALUATIONS)) {
      if (!departmentsList) {
        const client = new API();
        client.get('/departments', departments => setDepartmentsList(departments));
      }
      if (!quartersList) {
        const client = new API();
        client.get('/quarters', quarters => setQuartersList(quarters));
      }
      if (!coursesList) {
        const client = new API();
        /* departmentsList needed to lookup ids. May not be loaded yet, but that's handled in
           componentDidUpdate */
        client.get('/courses', courses => setCoursesList(courses, departmentsList));
      }
      if (!professorsList) {
        const client = new API();
        client.get('/professors', professors => setProfessorsList(professors));
      }
    }
  }

  componentDidMount() { // need to make sure component mounted before calling setState
    const { initialValues, departmentsList } = this.props;
    const { id } = this.props.match.params;
    if (initialValues && initialValues.course) {
      const client = new API();
      this.getField('quarter', client, null, id, null);
      this.getField('professor', client, null, id, null);
    } else if (initialValues && initialValues.professor && departmentsList) {
      const client = new API();
      this.getField('quarter', client, null, null, id);
      this.getField('course', client, null, null, id, departmentsList);
    }
  }

  componentDidUpdate() {
    const {
      quartersList, coursesList, professorsList, initialValues, departmentsList,
    } = this.props;
    const { localQuartersList, localCoursesList, localProfessorsList } = this.state;
    const { id } = this.props.match.params;
    if (!initialValues) {
      // if undefined but NOT null (treated differently in this component)
      if (localQuartersList === undefined
        && quartersList
      ) this.setState({ localQuartersList: quartersList.array });
      if (localCoursesList === undefined
        && coursesList
        && coursesList.departmentsListLoaded
      ) this.setState({ localCoursesList: coursesList.array });
      if (localProfessorsList === undefined
        && professorsList
      ) this.setState({ localProfessorsList: professorsList.array });
    } else if (initialValues.professor
      && localCoursesList === undefined
      && professorsList && departmentsList
    ) {
      const client = new API();
      this.setState({ selectionOrder: ['professor'] });
      this.getField('quarter', client, null, null, id);
      this.getField('course', client, null, null, id, departmentsList);
      this.setState({ localProfessorsList: professorsList.array });
    }

    if (this.props.coursesList
      && !this.props.coursesList.departmentsListLoaded
      && this.props.departmentsList
    ) this.props.setCoursesList(this.props.coursesList.array.slice(), this.props.departmentsList);
  }

  onSubmit(values) {
    this.props.history.push({
      pathname: `/post/${values.quarter}/${values.course}/${values.professor}`,
      state: {
        quarterID: values.quarter,
        courseID: values.course,
        professorID: values.professor,
      },
    });
  }

  // eslint-disable-next-line camelcase
  getField(field, client, quarter_id, course_id, professor_id, departmentsList) {
    switch (field) {
    case 'quarter':
      this.setState({ localQuartersList: null }, () => client.get('/quarters', (quarters) => {
        if (this.postSearchForm) {
          CustomSort('quarter', quarters);
          // eslint-disable-next-line no-param-reassign
          quarters.map(quarter => (quarter.label = `${quarter.name} ${quarter.year}`));
          this.setState({ localQuartersList: quarters });
        }
      }, { quarter_id, course_id, professor_id }));
      break;
    case 'course':
      this.setState({ localCoursesList: null }, () => client.get('/courses', (courses) => {
        if (this.postSearchForm) {
          CustomSort('course', courses);
          // eslint-disable-next-line no-param-reassign
          courses.map(course => (course.label = `${departmentsList.object[course.department_id].abbr} ${course.number}: ${course.title}`));

          this.setState({ localCoursesList: courses });
        }
      }, { quarter_id, course_id, professor_id }));
      break;
    case 'professor':
      this.setState({ localProfessorsList: null }, () => client.get('/professors', (professors) => {
        if (this.postSearchForm) {
          // eslint-disable-next-line no-param-reassign
          professors.map(professor => (professor.label = `${professor.last_name}, ${professor.first_name}`));
          CustomSort('professor', professors);
          this.setState({ localProfessorsList: professors });
        }
      }, { quarter_id, course_id, professor_id }));
      break;
    default:
      break;
    }
  }

  populateFields(currentField, field1, field2, newValue) {
    const {
      quartersList, coursesList, professorsList, departmentsList, quarter, course, professor,
    } = this.props;
    const { selectionOrder } = this.state;
    let quarterID;
    let courseID;
    let professorID;
    switch (currentField) {
    case 'quarter':
      quarterID = newValue;
      courseID = course;
      professorID = professor;
      break;
    case 'course':
      quarterID = quarter;
      courseID = newValue;
      professorID = professor;
      break;
    case 'professor':
      quarterID = quarter;
      courseID = course;
      professorID = newValue;
      break;
    default:
      break;
    }
    const client = new API();
    if (selectionOrder.includes(currentField)) {
      // clear values ahead of currentField. If at index 0, do nothing, so only loop while i > 0
      for (let i = selectionOrder.length - 1; i > 0; i--) {
        if (selectionOrder[i] === currentField) {
          switch (currentField) {
          case 'quarter':
            if (courseID && professorID) this.authIfPosted(quarterID, courseID, professorID);
            break;
          case 'course':
            if (quarterID && professorID) this.authIfPosted(quarterID, courseID, professorID);
            break;
          case 'professor':
            if (quarterID && courseID) this.authIfPosted(quarterID, courseID, professorID);
            break;
          default:
            break;
          }
          break;
        }
        storeWithMiddleware.dispatch(change('postSearch', selectionOrder[i], ''));
        switch (selectionOrder[i]) {
        case 'quarter':
          quarterID = null;
          break;
        case 'course':
          courseID = null;
          break;
        case 'professor':
          professorID = null;
          break;
        default:
          break;
        }
        selectionOrder.pop();
      }
      if (!quarterID && !courseID && !professorID) {
        this.setState({
          localQuartersList: quartersList.array,
          localCoursesList: coursesList.array,
          localProfessorsList: professorsList.array,
          selectionOrder: [],
        });
        return;
      }
      if (!quarterID && currentField !== 'quarter' && (courseID || professorID)) this.getField('quarter', client, quarterID, courseID, professorID);
      if (!courseID && currentField !== 'course' && (quarterID || professorID)) this.getField('course', client, quarterID, courseID, professorID, departmentsList);
      if (!professorID && currentField !== 'professor' && (quarterID || courseID)) this.getField('professor', client, quarterID, courseID, professorID);
    } else {
      selectionOrder.push(currentField);
      if (selectionOrder.length === 3) this.authIfPosted(quarterID, courseID, professorID);
      else {
        /* in large arrays, multiple includes is inefficient, but for clean code and since array
           will only ever be max size 3, keeping it for simplicity */
        if (!selectionOrder.includes(field1)) {
          this.getField(field1, client, quarterID, courseID, professorID, departmentsList);
        }
        if (!selectionOrder.includes(field2)) {
          this.getField(field2, client, quarterID, courseID, professorID, departmentsList);
        }
      }
    }
  }

  /* pass in values as parameters rather than read from props because last selection won't be
     updated until next re-render, sending undefined as one of the ids */
  authIfPosted(quarter, course, professor) {
    const client = new API();
    // course and professor swapped because API currently has different order than site
    this.setState(
      { checkingIfPosted: true },
      () => client.get(
        `/classes/${quarter}/${professor}/${course}`,
        classInfo => this.setState({
          checkingIfPosted: false,
          alreadyPosted: classInfo.user_posted,
        }),
      ).catch(() => this.setState({ checkingIfPosted: false })),
    );
  }

  render() {
    const { handleSubmit, userInfo } = this.props;
    const {
      localQuartersList, localCoursesList, localProfessorsList, checkingIfPosted, alreadyPosted,
    } = this.state;
    const readAccess = userInfo.permissions.includes(READ_EVALUATIONS);
    return (
      <form
        ref={node => (this.postSearchForm = node)}
        styleName="postSearch"
        className="content"
        onSubmit={handleSubmit(this.onSubmit.bind(this))}
      >
        {!readAccess && (
          <div className="noWriteDiv">
            <Link className="homeBtn" to="/">
              <i className="fa fa-home" />
            </Link>
          </div>
        )}
        <small style={{ marginTop: '5px' }}>
          In any order, select the correct combination and select {'"Continue"'} to start filling
          your evaluation.
        </small>
        <hr />
        <Field
          name="quarter" // responsible for object's key name for values
          component={PostSearch.renderQuarters}
          localQuartersList={localQuartersList}
          onChangeFunc={newQuarter => this.setState(
            { alreadyPosted: false },
            this.populateFields('quarter', 'course', 'professor', newQuarter),
          )}
        />

        <Field
          name="course" // responsible for object's key name for values
          component={PostSearch.renderCourses}
          localCoursesList={localCoursesList}
          onChangeFunc={newCourse => this.setState(
            { alreadyPosted: false },
            this.populateFields('course', 'quarter', 'professor', newCourse),
          )}
        />

        <Field
          name="professor" // responsible for object's key name for values
          component={PostSearch.renderProfessors}
          onChangeFunc={newProfessor => this.setState(
            { alreadyPosted: false },
            this.populateFields('professor', 'quarter', 'course', newProfessor),
          )}
          localProfessorsList={localProfessorsList}
          postSearchForm={this.postSearchForm}
        />

        <button
          type="submit"
          disabled={checkingIfPosted || alreadyPosted}
          className="btn"
        >
          {checkingIfPosted ? ' Checking...' : alreadyPosted ? 'Already posted' : 'Continue'}
        </button>
      </form>
    );
  }
}

function validate(values) {
  const errors = {};
  if (!values.quarter) errors.quarter = 'No quarter input.';
  if (!values.course) errors.course = 'No course input.';
  if (!values.professor) errors.professor = 'No professor input.';
  return errors;
}

const PostSearchWithReduxForm = reduxForm({
  validate,
  form: 'postSearch',
})(PostSearch);

const mapStateToProps = (state, ownProps) => {
  const selector = formValueSelector('postSearch'); // <-- same as form name
  const { quarter, course, professor } = selector(state, 'quarter', 'course', 'professor');
  return {
    quarter,
    course,
    professor,
    userInfo: state.userInfo,
    quartersList: state.quartersList,
    departmentsList: state.departmentsList,
    coursesList: state.coursesList,
    professorsList: state.professorsList,
    initialValues: ownProps.type === 'professors' ?
      { professor: parseInt(ownProps.match.params.id, 10) }
      : ownProps.type === 'courses' ?
        { course: parseInt(ownProps.match.params.id, 10) }
        : null,
  };
};

const mapDispatchToProps = {
  setDepartmentsList: setDepartmentsListAction,
  setQuartersList: setQuartersListAction,
  setCoursesList: setCoursesListAction,
  setProfessorsList: setProfessorsListAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(PostSearchWithReduxForm);
