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
    setProfessorsList: PropTypes.func.isRequired

  }

  constructor(props) {
    super(props);
    const { course, professor, departmentsList, quartersList, coursesList, professorsList, initialValues, userInfo, setDepartmentsList, setQuartersList, setCoursesList, setProfessorsList } = props;
    this.state = {
      localQuartersList: quartersList ? quartersList.array : undefined,
      localCoursesList: coursesList && coursesList.departmentsListLoaded ? coursesList.array : undefined,
      localProfessorsList: professorsList ? professorsList.array : undefined,
      selectionOrder: initialValues && initialValues.course ? ['course'] : initialValues && initialValues.professor ? ['professor'] : [] //keep track of order of selected fields to behave appropriately (clear/repopulate proper fields)
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
        client.get('/courses', courses => setCoursesList(courses, departmentsList)); //departmentsList needed to lookup ids. May not be loaded yet, but that's handled below
      }
      if (!professorsList) {
        const client = new API();
        client.get('/professors', professors => setProfessorsList(professors));
      }
    }
  }

  componentDidMount() { //need to make sure component mounted before calling setState
    const { initialValues, departmentsList } = this.props;
    const { id } = this.props.match.params;
    if (initialValues && initialValues.course) {
      const client = new API();
      this.getField('quarter', client, null, id, null);
      this.getField('professor', client, null, id, null);
    }
    else if (initialValues && initialValues.professor && departmentsList) {
      const client = new API();
      this.getField('quarter', client, null, null, id);
      this.getField('course', client, null, null, id, departmentsList);
    }
  }

  componentDidUpdate() {
    const { quartersList, coursesList, professorsList, initialValues, departmentsList } = this.props;
    const { localQuartersList, localCoursesList, localProfessorsList } = this.state;
    const { id } = this.props.match.params;
    if (!initialValues) {
      //if undefined but NOT null (treated differently in this component)
      if (localQuartersList === undefined && quartersList) this.setState({localQuartersList: quartersList.array});
      if (localCoursesList === undefined && coursesList && coursesList.departmentsListLoaded) this.setState({localCoursesList: coursesList.array});
      if (localProfessorsList === undefined && professorsList) this.setState({localProfessorsList: professorsList.array});
    }
    else if (initialValues.professor && localCoursesList === undefined && professorsList && departmentsList) {
      const client = new API();
      this.setState({selectionOrder: ['professor']});
      this.getField('quarter', client, null, null, id);
      this.getField('course', client, null, null, id, departmentsList);
      this.setState({localProfessorsList: professorsList.array});
    }

    if (this.props.coursesList && !this.props.coursesList.departmentsListLoaded && this.props.departmentsList)
      this.props.setCoursesList(this.props.coursesList.array.slice(), this.props.departmentsList); //make deep copy of current, state immutable
  }

  onSubmit(values) {
    this.props.history.push({
      pathname: '/post/' + values.quarter + '/' + values.course + '/' + values.professor,
      state: {
        quarter_id: values.quarter,
        course_id: values.course,
        professor_id: values.professor
      }
    });
  }

  renderQuarters(field) {
    const { input, localQuartersList, populateFields } = field;
    const { meta: {submitFailed, error} } = field;
    return (
      <div>
        <h4>{!localQuartersList ? 'Loading quarters...' : 'Choose quarter'}</h4>
        <Select
          disabled={!localQuartersList}
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'error' : ''}
          simpleValue
          options={localQuartersList}
          isLoading={!localQuartersList}
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
        <h4>{!localCoursesList ? 'Loading courses...' : 'Choose course'}</h4>
        <Select
          disabled={!localCoursesList}
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'error' : ''}
          simpleValue
          options={localCoursesList}
          isLoading={!localCoursesList}
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
        <h4>{!localProfessorsList ? 'Loading professors...' : 'Choose professor'}</h4>
        <Select
          disabled={!localProfessorsList}
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'error' : ''}
          simpleValue
          options={localProfessorsList}
          isLoading={!localProfessorsList}
          onChange={newProfessor => {
            input.onChange(newProfessor);
            if (newProfessor != input.value) populateFields(newProfessor);
          }}
          placeholder="Select your professor"
          onOpen={() => {
            if (window.innerHeight < postSearchForm.clientHeight + 240) postSearchForm.style.marginBottom = '115px';
          }}
          onClose={() => postSearchForm.style.marginBottom=''}
        />
      </div>
    );
  }

  populateFields(currentField, field1, field2, newValue) {
    const { quartersList, coursesList, professorsList, departmentsList, quarter, course, professor } = this.props;
    const { selectionOrder } = this.state;
    let quarter_id, course_id, professor_id; //= currently selected values
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
      for (let i = selectionOrder.length - 1; i > 0; i--) { //clear values ahead of currentField. If at index 0, do nothing, so only loop while i > 0
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
        this.setState({selectionOrder: []});
        return;
      }
      if (!quarter_id && currentField !== 'quarter' && (course_id || professor_id)) this.getField('quarter', client, quarter_id, course_id, professor_id);
      if (!course_id && currentField !== 'course' && (quarter_id || professor_id)) this.getField('course', client, quarter_id, course_id, professor_id, departmentsList);
      if (!professor_id && currentField !== 'professor' && (quarter_id || course_id)) this.getField('professor', client, quarter_id, course_id, professor_id);
    }
    else {
      selectionOrder.push(currentField);
      //in large arrays, multiple includes is inefficient, but for clean code and since array will only ever be max size 3, keeping it for simplicity
      if (!selectionOrder.includes(field1)) this.getField(field1, client, quarter_id, course_id, professor_id, departmentsList);
      if (!selectionOrder.includes(field2)) this.getField(field2, client, quarter_id, course_id, professor_id, departmentsList);
    }
  }

  getField(field, client, quarter_id, course_id, professor_id, departmentsList) {
    switch (field) {
      case 'quarter':
        this.setState({localQuartersList: null}, () => client.get('/quarters', quarters => {
          if (this.postSearchForm) {
            quarters.sort((a, b) => { //convert object with ids as keys into array of objects, then sort
              return a.year > b.year ? -1 : a.year < b.year ? 1 : a.name == 'Winter' ? 1 : a.name == 'Fall' ? -1 : b.name == 'Fall' ? 1 : -1;
            })
            .map(quarter => quarter.label = quarter.name + ' ' + quarter.year);
            this.setState({localQuartersList: quarters});
          }
        }, {quarter_id, course_id, professor_id}));
        break;
      case 'course':
        this.setState({localCoursesList: null}, () => client.get('/courses', courses => {
            if (this.postSearchForm) {
              courses.sort((a, b) => {
                if (a.department_id == b.department_id) {
                  //nums can have letters in them too (ex. 12L), so parse integers and compare
                  let parsedANum = parseInt(a.number, 10);
                  let parsedBNum = parseInt(b.number, 10);
                  //if integers same, check for letters to decide
                  if (parsedANum == parsedBNum) return a.number > b.number ? 1 : a.number < b.number ? -1 : 0;
                  return parsedANum > parsedBNum ? 1 : parsedANum < parsedBNum ? -1 : 0;
                }
                else return departmentsList[a.department_id].abbr > departmentsList[b.department_id].abbr ? 1 : departmentsList[a.department_id].abbr < departmentsList[b.department_id].abbr ? -1 : 0;
              }).map(course => course.label = departmentsList[course.department_id].abbr + ' ' + course.number + ': ' + course.title);

            this.setState({localCoursesList: courses});
          };
        }, {quarter_id, course_id, professor_id}));
        break;
      case 'professor':
        this.setState({localProfessorsList: null}, () => client.get('/professors', professors => {
          if (this.postSearchForm) {
            professors.map(professor => professor.label = professor.last_name + ', ' + professor.first_name);
            professors.sort((a, b) => { //must type professors.sort, not just .sort (else sorting doesn't work since label won't be recognized yet)
              return a.label > b.label ? 1 : a.label < b.label ? -1 : 0;
            });
            this.setState({localProfessorsList: professors});
          }
        }, {quarter_id, course_id, professor_id}));
        break;
    }
  }

  render() {
    const { handleSubmit, userInfo } = this.props;
    const { localQuartersList, localCoursesList, localProfessorsList } = this.state;
    const read_access = userInfo.permissions.includes(READ_EVALUATIONS);
    return (
      <form ref={node => this.postSearchForm = node} className='content' onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        {!read_access && (
        <div className='noWriteDiv'>
          <Link className='homeBtn' to={'/'}>
            <i className="fa fa-home" />
          </Link>
        </div>
        )}
        <small style={{marginTop: '5px'}}>{`In any order, select the correct combination and select "Continue" to start filling your evaluation.`}</small>
        <hr />
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

let PostSearchWithReduxForm = reduxForm({
  validate,
  form: 'postSearch'
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
        {professor: parseInt(ownProps.match.params.id)}
      : ownProps.type === 'courses' ?
        {course: parseInt(ownProps.match.params.id)}
      : null
  }
}

export default connect(mapStateToProps, { setDepartmentsList, setQuartersList, setCoursesList, setProfessorsList })(PostSearchWithReduxForm);
