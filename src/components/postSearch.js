import React, { Component } from 'react';
import { Field, reduxForm, change } from 'redux-form';
import Select from 'react-select';

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
      quartersList: null,
      quarterSelected: false,
      coursesList: null,
      courseSelected: false,
      professorsList: null
    };
  }

  componentWillMount() {
    const getQuarters = () => {
      let client = new API();
      client.get('/quarters', responseData => {
        responseData.map(quarter => {
          quarter.label = quarter.name + ' ' + quarter.year;
          //optionally can delete unusued parts of obj, but not necessary
        });
        responseData.sort((a, b) => { //responseData currently comes in order, but sort just in case in future it won't
          return a.year > b.year ? 1 : a.year < b.year ? -1 : a.name == 'Winter' ? -1 : a.name == 'Fall' ? 1 : b.name == 'Fall' ? -1 : 1;
        })
        this.setState({quartersList: responseData});
      })
    };
    getQuarters();
  }

  onSubmit(values) {
    this.props.history.push('/post/' + values.quarter + '/' + values.course + '/' + values.professor);
  }

  renderQuarters(field) {
    const { input, quartersList, setCoursesList, setQuarterSelected, setCourseSelected, setProfessorsList } = field;
    const { meta: {submitFailed, error} } = field;
    return (
      <div>
        <h4>{quartersList ? 'Choose quarter' : 'Loading quarters...'}</h4>
        <Select
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'error' : ''}
          simpleValue
          options={quartersList}
          isLoading={quartersList ? false : true}
          onChange={newQuarter => {
            input.onChange(newQuarter);
            if (newQuarter != input.value) {
              storeWithMiddleware.dispatch(change('postSearch', 'course', ''));
              storeWithMiddleware.dispatch(change('postSearch', 'professor', ''));
              setQuarterSelected(newQuarter ? true : false);
              setCourseSelected(false);
              setCoursesList(null);
              setProfessorsList(null);

              let client = new API();
              client.get('/courses', coursesList => {
                coursesList.map(course => {
                  course.label = course.department + ' ' + course.number + ': ' + course.title;
                  //optionally can delete unusued parts of obj, but not necessary
                });
                coursesList.sort((a, b) => {
                  return a.label > b.label ? 1 : a.label < b.label ? -1 : 0;
                })
                setCoursesList(coursesList);
              }, {quarter_id: newQuarter});
            }
          }}
          placeholder="Select your quarter"
        />
      </div>
    );
  }

  renderCourses(field) {
    const { input, coursesList, quarterSelected, setProfessorsList, setCourseSelected } = field;
    const { meta: {submitFailed, error} } = field;
    return (
      <div>
        <h4>{quarterSelected && !coursesList ? 'Loading courses...' : 'Choose course'}</h4>
        <Select
          disabled={!quarterSelected || !coursesList}
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'error' : ''}
          simpleValue
          options={coursesList}
          isLoading={coursesList || !quarterSelected ? false : true}
          onChange={newCourse => {
            if (newCourse != input.value) {
              storeWithMiddleware.dispatch(change('postSearch', 'professor', ''));
              setCourseSelected(newCourse ? true : false);
              setProfessorsList(null);
              input.onChange(newCourse);

              let client = new API();
              client.get('/professors', professorsList => {
                professorsList.map(professor => {
                  professor.label = professor.first_name + ' ' + professor.last_name;
                  //optionally can delete unusued parts of obj, but not necessary
                });
                professorsList.sort((a, b) => {
                  return a.label > b.label ? 1 : a.label <   b.label ? -1 : 0;
                })
                setProfessorsList(professorsList);
              }, {course_id: newCourse});
            }
          }}
          placeholder="Select your course"
        />
      </div>
    );
  }

  renderProfessors(field) {
    const { input, professorsList, courseSelected } = field;
    const { meta: {submitFailed, error} } = field;
    return (
      <div>
        <h4>{courseSelected && !professorsList ? 'Loading professors...' : 'Choose professor'}</h4>
        <Select
          disabled={!courseSelected || !professorsList}
          value={input.value}
          valueKey={'id'}
          className={error && submitFailed ? 'error' : ''}
          simpleValue
          options={professorsList}
          isLoading={professorsList || !courseSelected ? false : true}
          onChange={newClass => {
            input.onChange(newClass);
          }}
          placeholder="Select your professor"
        />
      </div>
    );
  }

  render() {
    const { handleSubmit } = this.props;
    return (
      <form className='content' onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          name="quarter" //responsible for object's key name for values
          component={this.renderQuarters}
          quartersList={this.state.quartersList}
          setCoursesList={coursesList => this.setState({coursesList})}
          setQuarterSelected={state => this.setState({quarterSelected: state})}
          setCourseSelected={state => this.setState({courseSelected: state})}
          setProfessorsList={professorsList => this.setState({professorsList})}
        />
        <Field
          name="course" //responsible for object's key name for values
          component={this.renderCourses}
          coursesList={this.state.coursesList}
          quarterSelected={this.state.quarterSelected}
          setProfessorsList={professorsList => this.setState({professorsList})}
          setCourseSelected={state => this.setState({courseSelected: state})}
        />
        <Field
          name="professor" //responsible for object's key name for values
          component={this.renderProfessors}
          professorsList={this.state.professorsList}
          courseSelected={this.state.courseSelected}
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
  if (!values.professor) errors.professor = 'No course professor.';
  return errors;
}

export default reduxForm({
  validate,
  form: 'postSearch'
})
(PostSearch);
