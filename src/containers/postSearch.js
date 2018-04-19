import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, change, formValueSelector } from 'redux-form';
import Select from 'react-select';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { storeWithMiddleware } from '../index';
import API from '../services/api';
import { READ_EVALUATIONS } from '../index';
import { setDepartmentsList, setQuartersList, setCoursesList, setProfessorsList } from '../actions';
import CustomSort from '../utils/customSort';

class PostSearch extends Component {
  static propTypes = {
    quartersList: PropTypes.object,
    coursesList: PropTypes.object,
    departmentsList: PropTypes.object,
    professorsList: PropTypes.object,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    userInfo: PropTypes.object.isRequired,
    quarter: PropTypes.number,
    course: PropTypes.number,
    professor: PropTypes.number,
    initialValues: PropTypes.object,
    setDepartmentsList: PropTypes.func.isRequired,
    setQuartersList: PropTypes.func.isRequired,
    setCoursesList: PropTypes.func.isRequired,
    setProfessorsList: PropTypes.func.isRequired,

  }

  constructor(props) {
    super(props);
    const {
      departmentsList, quartersList, coursesList, professorsList, initialValues, userInfo, setDepartmentsList, setQuartersList, setCoursesList, setProfessorsList,
    } = props;
    this.state = {
      alreadyPosted: false,
      checkingIfPosted: false,
      localQuartersList: quartersList ? quartersList.array : undefined,
      localCoursesList: coursesList && coursesList.departmentsListLoaded ? coursesList.array : undefined,
      localProfessorsList: professorsList ? professorsList.array : undefined,
      selectionOrder: initialValues && initialValues.course ? ['course'] : initialValues && initialValues.professor ? ['professor'] : [], // keep track of order of selected fields to behave appropriately (clear/repopulate proper fields)
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
        client.get('/courses', courses => setCoursesList(courses, departmentsList)); // departmentsList needed to lookup ids. May not be loaded yet, but that's handled below
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
      if (localQuartersList === undefined && quartersList) this.setState({ localQuartersList: quartersList.array });
      if (localCoursesList === undefined && coursesList && coursesList.departmentsListLoaded) this.setState({ localCoursesList: coursesList.array });
      if (localProfessorsList === undefined && professorsList) this.setState({ localProfessorsList: professorsList.array });
    } else if (initialValues.professor && localCoursesList === undefined && professorsList && departmentsList) {
      const client = new API();
      this.setState({ selectionOrder: ['professor'] });
      this.getField('quarter', client, null, null, id);
      this.getField('course', client, null, null, id, departmentsList);
      this.setState({ localProfessorsList: professorsList.array });
    }

    if (this.props.coursesList && !this.props.coursesList.departmentsListLoaded && this.props.departmentsList) { this.props.setCoursesList(this.props.coursesList.array.slice(), this.props.departmentsList); } // make deep copy of current, state immutable
  }

  onSubmit(values) {
    this.props.history.push({
      pathname: `/post/${values.quarter}/${values.course}/${values.professor}`,
      state: {
        quarter_id: values.quarter,
        course_id: values.course,
        professor_id: values.professor,
      },
    });
  }

  renderQuarters(field) {
    const { input, localQuartersList, populateFields } = field;
    const { meta: { submitFailed, error } } = field;
    return (
      <div>
        <h4>{!localQuartersList ? 'Loading quarters...' : 'Choose quarter'}</h4>
        <Select
          disabled={!localQuartersList}
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'select-error' : undefined}
          simpleValue
          options={localQuartersList}
          isLoading={!localQuartersList}
          onChange={(newQuarter) => {
            input.onChange(newQuarter);
            if (newQuarter != input.value) this.setState({ alreadyPosted: false }, populateFields(newQuarter));
          }}
          placeholder='Select your quarter'
        />
      </div>
    );
  }

  renderCourses(field) {
    const { input, localCoursesList, populateFields } = field;
    const { meta: { submitFailed, error } } = field;
    return (
      <div>
        <h4>{!localCoursesList ? 'Loading courses...' : 'Choose course'}</h4>
        <Select
          disabled={!localCoursesList}
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'select-error' : undefined}
          simpleValue
          options={localCoursesList}
          isLoading={!localCoursesList}
          onChange={(newCourse) => {
            input.onChange(newCourse);
            if (newCourse != input.value) this.setState({ alreadyPosted: false }, populateFields(newCourse));
          }}
          placeholder='Select your course'
        />
      </div>
    );
  }

  renderProfessors(field) {
    const {
      input, localProfessorsList, populateFields, postSearchForm,
    } = field;
    const { meta: { submitFailed, error } } = field;
    return (
      <div>
        <h4>{!localProfessorsList ? 'Loading professors...' : 'Choose professor'}</h4>
        <Select
          disabled={!localProfessorsList}
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'select-error' : undefined}
          simpleValue
          options={localProfessorsList}
          isLoading={!localProfessorsList}
          onChange={(newProfessor) => {
            input.onChange(newProfessor);
            if (newProfessor != input.value) this.setState({ alreadyPosted: false }, populateFields(newProfessor));
          }}
          placeholder='Select your professor'
          onOpen={() => {
            if (window.innerHeight < postSearchForm.clientHeight + 240) postSearchForm.style.marginBottom = '115px';
          }}
          onClose={() => postSearchForm.style.marginBottom = ''}
        />
      </div>
    );
  }

  authIfPosted(quarter, course, professor) { // pass in values as parameters rather than read from props because last selection won't be updated until next re-render, sending undefined as one of the ids
    const client = new API();
    // course and professor swapped because API currently has different order than site
    this.setState({ checkingIfPosted: true }, () => client.get(`/classes/${quarter}/${professor}/${course}`, classInfo => this.setState({ checkingIfPosted: false, alreadyPosted: classInfo.user_posted }))
      .catch(() => this.setState({ checkingIfPosted: false })));
  }

  populateFields(currentField, field1, field2, newValue) {
    const {
      quartersList, coursesList, professorsList, departmentsList, quarter, course, professor,
    } = this.props;
    const { selectionOrder } = this.state;
    let quarter_id,
      course_id,
      professor_id; //= currently selected values
    switch (currentField) {
    case 'quarter':
      quarter_id = newValue;
      course_id = course;
      professor_id = professor;
      break;
    case 'course':
      quarter_id = quarter;
      course_id = newValue;
      professor_id = professor;
      break;
    case 'professor':
      quarter_id = quarter;
      course_id = course;
      professor_id = newValue;
      break;
    }
    const client = new API();
    if (selectionOrder.includes(currentField)) {
      for (let i = selectionOrder.length - 1; i > 0; i--) { // clear values ahead of currentField. If at index 0, do nothing, so only loop while i > 0
        if (selectionOrder[i] === currentField) {
          switch (currentField) {
          case 'quarter':
            if (course_id && professor_id) this.authIfPosted(quarter_id, course_id, professor_id);
            break;
          case 'course':
            if (quarter_id && professor_id) this.authIfPosted(quarter_id, course_id, professor_id);
            break;
          case 'professor':
            if (quarter_id && course_id) this.authIfPosted(quarter_id, course_id, professor_id);
            break;
          }
          break;
        }
        storeWithMiddleware.dispatch(change('postSearch', selectionOrder[i], ''));
        switch (selectionOrder[i]) {
        case 'quarter':
          quarter_id = null;
          break;
        case 'course':
          course_id = null;
          break;
        case 'professor':
          professor_id = null;
          break;
        }
        selectionOrder.pop();
      }
      if (!quarter_id && !course_id && !professor_id) {
        this.setState({
          localQuartersList: quartersList.array,
          localCoursesList: coursesList.array,
          localProfessorsList: professorsList.array,
          selectionOrder: [],
        });
        return;
      }
      if (!quarter_id && currentField !== 'quarter' && (course_id || professor_id)) this.getField('quarter', client, quarter_id, course_id, professor_id);
      if (!course_id && currentField !== 'course' && (quarter_id || professor_id)) this.getField('course', client, quarter_id, course_id, professor_id, departmentsList);
      if (!professor_id && currentField !== 'professor' && (quarter_id || course_id)) this.getField('professor', client, quarter_id, course_id, professor_id);
    } else {
      selectionOrder.push(currentField);
      if (selectionOrder.length === 3) this.authIfPosted(quarter_id, course_id, professor_id);
      else {
        // in large arrays, multiple includes is inefficient, but for clean code and since array will only ever be max size 3, keeping it for simplicity
        if (!selectionOrder.includes(field1)) this.getField(field1, client, quarter_id, course_id, professor_id, departmentsList);
        if (!selectionOrder.includes(field2)) this.getField(field2, client, quarter_id, course_id, professor_id, departmentsList);
      }
    }
  }

  getField(field, client, quarter_id, course_id, professor_id, departmentsList) {
    switch (field) {
    case 'quarter':
      this.setState({ localQuartersList: null }, () => client.get('/quarters', (quarters) => {
        if (this.postSearchForm) {
          CustomSort('quarter', quarters);
          quarters.map(quarter => quarter.label = `${quarter.name} ${quarter.year}`);
          this.setState({ localQuartersList: quarters });
        }
      }, { quarter_id, course_id, professor_id }));
      break;
    case 'course':
      this.setState({ localCoursesList: null }, () => client.get('/courses', (courses) => {
        if (this.postSearchForm) {
          CustomSort('course', courses);
          courses.map(course => course.label = `${departmentsList[course.department_id].abbr} ${course.number}: ${course.title}`);

          this.setState({ localCoursesList: courses });
        }
      }, { quarter_id, course_id, professor_id }));
      break;
    case 'professor':
      this.setState({ localProfessorsList: null }, () => client.get('/professors', (professors) => {
        if (this.postSearchForm) {
          professors.map(professor => professor.label = `${professor.last_name}, ${professor.first_name}`);
          CustomSort('professor', professors);
          this.setState({ localProfessorsList: professors });
        }
      }, { quarter_id, course_id, professor_id }));
      break;
    }
  }

  render() {
    const { handleSubmit, userInfo } = this.props;
    const {
      localQuartersList, localCoursesList, localProfessorsList, checkingIfPosted, alreadyPosted,
    } = this.state;
    const read_access = userInfo.permissions.includes(READ_EVALUATIONS);
    return (
      <form ref={node => this.postSearchForm = node} className='content' onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        {!read_access && (
          <div className='noWriteDiv'>
            <Link className='homeBtn' to={'/'}>
              <i className='fa fa-home' />
            </Link>
          </div>
        )}
        <small style={{ marginTop: '5px' }}>In any order, select the correct combination and select {'"Continue"'} to start filling your evaluation.</small>
        <hr />
        <Field
          name='quarter' // responsible for object's key name for values
          component={this.renderQuarters.bind(this)}
          localQuartersList={localQuartersList}
          populateFields={newValue => this.populateFields('quarter', 'course', 'professor', newValue)}
        />

        <Field
          name='course' // responsible for object's key name for values
          component={this.renderCourses.bind(this)}
          localCoursesList={localCoursesList}
          populateFields={newValue => this.populateFields('course', 'quarter', 'professor', newValue)}
        />

        <Field
          name='professor' // responsible for object's key name for values
          component={this.renderProfessors.bind(this)}
          localProfessorsList={localProfessorsList}
          populateFields={newValue => this.populateFields('professor', 'quarter', 'course', newValue)}
          postSearchForm={this.postSearchForm}
        />

        <button type='submit' disabled={checkingIfPosted || alreadyPosted} className='btn'>{checkingIfPosted ? ' Checking...' : alreadyPosted ? 'Already posted' : 'Continue'}</button>
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
      { professor: parseInt(ownProps.match.params.id) }
      : ownProps.type === 'courses' ?
        { course: parseInt(ownProps.match.params.id) }
        : null,
  };
};

export default connect(mapStateToProps, {
  setDepartmentsList, setQuartersList, setCoursesList, setProfessorsList,
})(PostSearchWithReduxForm);
