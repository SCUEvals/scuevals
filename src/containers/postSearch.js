import React, { Component } from 'react';
import { Field, reduxForm, change, formValueSelector } from 'redux-form';
import Select from 'react-select';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { storeWithMiddleware } from '../index';
import API from '../services/api';

class PostSearch extends Component {

  static defaultProps = {
    history: PropTypes.obj,
    handleSubmit: PropTypes.obj
  }

  constructor(props) {
    super(props);
    this.state = {
      localQuartersList: props.quartersList ? props.quartersList.array : null,
      localCoursesList: props.coursesList && props.coursesList.departmentsListLoaded ? props.coursesList.array : null,
      localProfessorsList: props.professorsList ? props.professorsList.array : null,
      selectionOrder: []
    };
  }

  componentDidUpdate() {
    const { quartersList, coursesList, professorsList } = this.props;
    const { localQuartersList, localCoursesList, localProfessorsList } = this.state;
    if (!localQuartersList && quartersList) this.setState({localQuartersList: quartersList.array});
    if (!localCoursesList && coursesList && coursesList.departmentsListLoaded) this.setState({localCoursesList: coursesList.array});
    if (!localProfessorsList && professorsList) this.setState({localProfessorsList: professorsList.array});
  }

  onSubmit(values) {
    this.props.history.push('/post/' + values.quarter + '/' + values.course + '/' + values.professor);
  }

  renderQuarters(field) {
    const { input, localQuartersList, populateFields } = field;
    const { meta: {submitFailed, error} } = field;
    return (
      <div>
        <h4>{!localQuartersList || localQuartersList.length == 0 ? 'Loading quarters...' : 'Choose quarter'}</h4>
        <Select
          disabled={!localQuartersList || localQuartersList.length == 0}
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'error' : ''}
          simpleValue
          options={localQuartersList}
          isLoading={!localQuartersList || localQuartersList.length == 0}
          onChange={newQuarter => {
            input.onChange(newQuarter);
            if (newQuarter != input.value) populateFields(newQuarter);
          }}
          placeholder="Select your quarter"
        />
      </div>
    );
  }

  renderCourses(field) {
    const { input, localCoursesList, populateFields } = field;
    const { meta: {submitFailed, error} } = field;
    return (
      <div>
        <h4>{!localCoursesList || localCoursesList.length == 0 ? 'Loading courses...' : 'Choose course'}</h4>
        <Select
          disabled={!localCoursesList || localCoursesList.length == 0}
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'error' : ''}
          simpleValue
          options={localCoursesList}
          isLoading={!localCoursesList || localCoursesList.length == 0}
          onChange={newCourse => {
            input.onChange(newCourse);
            if (newCourse != input.value) populateFields(newCourse);
          }}
          placeholder="Select your course"
        />
      </div>
    );
  }

  renderProfessors(field) {
    const { input, localProfessorsList, populateFields, postSearchForm } = field;
    const { meta: {submitFailed, error} } = field;
    return (
      <div>
        <h4>{!localProfessorsList || localProfessorsList.length == 0 ? 'Loading professors...' : 'Choose professor'}</h4>
        <Select
          disabled={!localProfessorsList || localProfessorsList.length == 0}
          value={input.value}
          valueKey={'id'}
          labelKey={'full_name'}
          className={error && submitFailed ? 'error' : ''}
          simpleValue
          options={localProfessorsList}
          isLoading={!localProfessorsList || localProfessorsList.length == 0}
          onChange={newProfessor => {
            input.onChange(newProfessor);
            if (newProfessor != input.value) populateFields(newProfessor);
          }}
          placeholder="Select your professor"
          onOpen={() => postSearchForm.style.marginBottom='115px'}
          onClose={() => postSearchForm.style.marginBottom=''}
        />
      </div>
    );
  }

  populateFields(currentField, field1, field2, newValue) {
    const { quartersList, coursesList, professorsList, departmentsList } = this.props;
    const { selectionOrder } = this.state;
    let quarter_id, course_id, professor_id; //= currently selected values
    switch (currentField) {
      case 'quarter':
        quarter_id = newValue;
        course_id = this.props.course;
        professor_id = this.props.professor;
        break;
      case 'course':
        quarter_id = this.props.quarter;
        course_id = newValue;
        professor_id = this.props.professor;
        break;
      case 'professor':
        quarter_id = this.props.quarter;
        course_id = this.props.course;
        professor_id = newValue;
        break;
    }
    let client = new API();
    if (selectionOrder.includes(currentField)) {
      for (let i = selectionOrder.length - 1; i > 0; i--) { //clear values .//if at index 0, do nothing, so only loop while i > 0
        if (selectionOrder[i] == currentField) break;
        storeWithMiddleware.dispatch(change('postSearch', selectionOrder[i], ''));
        switch(selectionOrder[i]) {
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
        this.setState({localQuartersList: quartersList.array, localCoursesList: coursesList.array, localProfessorsList: professorsList.array});
        return;
      }
      if (!quarter_id && currentField != 'quarter' && (course_id || professor_id)) this.getField('quarter', client, quarter_id, course_id, professor_id);
      if (!course_id && currentField != 'course' && (quarter_id || professor_id)) this.getField('course', client, quarter_id, course_id, professor_id, departmentsList);
      if (!professor_id && currentField != 'professor' && (quarter_id || course_id)) this.getField('professor', client, quarter_id, course_id, professor_id);
    }
    else {
      selectionOrder.push(currentField);
      if (!newValue && !selectionOrder.includes(field1) && !selectionOrder.includes(field2)) { //if nothing selected, show full lists of each (stored in Redux)
        this.setState({localQuartersList: quartersList.array, localCoursesList: coursesList.array, localProfessorsList: professorsList.array});
      }
      else  {
        if (!selectionOrder.includes(field1)) {
          this.getField(field1, client, quarter_id, course_id, professor_id, departmentsList);
        }
        if (!selectionOrder.includes(field2)) {
          this.getField(field2, client, quarter_id, course_id, professor_id, departmentsList);
        }
      }
    }
  }

  getField(field, client, quarter_id, course_id, professor_id, departmentsList) {
    switch (field) {
      case 'quarter':
        this.setState({localQuartersList: []}, () => client.get('/quarters', quarters => {
          quarters.map(quarter => quarter.label = quarter.name + ' ' + quarter.year);
          this.setState({localQuartersList: quarters});
        }, {quarter_id, course_id, professor_id}));
        break;
      case 'course':
        this.setState({localCoursesList: []}, () => client.get('/courses', courses => {
          courses.map(course => course.label = departmentsList[course.department_id].abbr + ' ' + course.number + ': ' + course.title);
          this.setState({localCoursesList: courses});
        }, {quarter_id, course_id, professor_id}));
        break;
      case 'professor':
        this.setState({localProfessorsList: []}, () => client.get('/professors', professors => {
          professors.map(professor => professor.full_name = professor.last_name + ', ' + professor.first_name);
          this.setState({localProfessorsList: professors});
        }, {quarter_id, course_id, professor_id}));
        break;
    }
  }

  render() {
    const { handleSubmit, quartersList, coursesList, professorsList, setQuartersList, quarter } = this.props;
    const { localQuartersList, localCoursesList, localProfessorsList } = this.state;
    return (
      <form ref={node => this.postSearchForm = node} className='content' onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          name='quarter' //responsible for object's key name for values
          component={this.renderQuarters}
          localQuartersList={localQuartersList}
          populateFields={newValue => this.populateFields('quarter', 'course', 'professor', newValue)}
        />

        <Field
          name='course' //responsible for object's key name for values
          component={this.renderCourses}
          localCoursesList={localCoursesList}
          populateFields={newValue => this.populateFields('course', 'quarter', 'professor', newValue)}
        />

        <Field
          name='professor' //responsible for object's key name for values
          component={this.renderProfessors}
          localProfessorsList={localProfessorsList}
          populateFields={newValue => this.populateFields('professor', 'quarter', 'course', newValue)}
          postSearchForm={this.postSearchForm}
        />

        <button type="submit" className="btn">Continue</button>
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

PostSearch = reduxForm({
  validate,
  form: 'postSearch'
})(PostSearch);

const mapStateToProps = state => {
  const selector = formValueSelector('postSearch'); // <-- same as form name
  const { quarter, course, professor } = selector(state, 'quarter', 'course', 'professor');
   return {
      quarter,
      course,
      professor,
      quartersList: state.quartersList,
      departmentsList: state.departmentsList,
      coursesList: state.coursesList,
      professorsList: state.professorsList
  }
}

export default connect(mapStateToProps, null)(PostSearch);
