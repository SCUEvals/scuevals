import React, { Component } from 'react';
import { Field, reduxForm, change, formValueSelector } from 'redux-form';
import Select from 'react-select';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { setQuartersList } from '../actions';
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
      coursesList: null,
      professorsList: null
    };
  }

  componentWillMount() {
    if (!this.props.quartersList) {
      let client = new API();
      client.get('/quarters', responseData => {
        responseData.map(quarter => {
          quarter.label = quarter.name + ' ' + quarter.year;
          //optionally can delete unusued parts of obj, but not necessary
        });
        responseData.sort((a, b) => { //responseData currently comes in order, but sort just in case in future it won't
          return a.year > b.year ? 1 : a.year < b.year ? -1 : a.name == 'Winter' ? -1 : a.name == 'Fall' ? 1 : b.name == 'Fall' ? -1 : 1;
        })
        let quartersListCopy = JSON.parse(JSON.stringify(this.props.quartersList)); //makes deep copy, shouldn't alter current state
        quartersListCopy = responseData;
        this.props.setQuartersList(quartersListCopy);
      });
    }
  };

  onSubmit(values) {
    this.props.history.push('/post/' + values.quarter + '/' + values.course + '/' + values.professor);
  }

  renderQuarters(field) {
    const { input, quartersList, setCoursesList, checkIfCoursesListExists } = field;
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

              //check if instance of coursesList already exists, if not then GET
              if (newQuarter && !checkIfCoursesListExists(newQuarter)) {
                let client = new API();
                client.get('/courses', coursesList => {
                  coursesList.map(course => {
                    course.label = course.department + ' ' + course.number + ': ' + course.title;
                    //optionally can delete unusued parts of obj, but not necessary
                  });
                  coursesList.sort((a, b) => {
                    return a.label > b.label ? 1 : a.label < b.label ? -1 : 0;
                  });
                  setCoursesList(coursesList, newQuarter);
                }, {quarter_id: newQuarter});
              }
            }
          }}
          placeholder="Select your quarter"
        />
      </div>
    );
  }

  renderCourses(field) {
    const { input, coursesList, quarterSelected, setProfessorsList, professorsList, checkIfProfessorsListExists } = field;
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
            input.onChange(newCourse);
            if (newCourse != input.value) {
              storeWithMiddleware.dispatch(change('postSearch', 'professor', ''));

              //Check if instance of professorsList already exists, if not then GET
              if (newCourse && !checkIfProfessorsListExists(newCourse)) {
                let client = new API();
                client.get('/professors', newProfessorsList => {
                  newProfessorsList.map(professor => {
                    professor.label = professor.last_name + ', ' + professor.first_name;
                    //optionally can delete unusued parts of obj, but not necessary
                  });
                  newProfessorsList.sort((a, b) => {
                    return a.label > b.label ? 1 : a.label <   b.label ? -1 : 0;
                  })
                  setProfessorsList(newProfessorsList, newCourse);
                }, {course_id: newCourse});
              }
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
          onChange={newClass => input.onChange(newClass)}
          placeholder="Select your professor"
        />
      </div>
    );
  }

  checkIfProfessorsListExists(newCourse) {
    const { setQuartersList, quartersList, quarter } = this.props;
    const { coursesList, professorsList } = this.state;
    let quarterIndex, courseIndex;
    if (quarter && newCourse) {
      quarterIndex = quartersList.findIndex(x => x.id === quarter);
      if (quarterIndex !== -1) {
          courseIndex = coursesList.findIndex(x => x.id === newCourse);
          if (courseIndex !== -1) {
            this.setState({professorsList: quartersList[quarterIndex].courses[courseIndex].professors});
            if (quartersList[quarterIndex].courses[courseIndex].professors)
              return true;
            return false;
          }
        } else {
          this.setState({professorsList: null});
          return false;
        }
      } else {
        this.setState({professorsList: null});
        return false;
      };
  }

  checkIfCoursesListExists(newQuarter) {
    const { setQuartersList, quartersList } = this.props;
    const { coursesList } = this.state;
    let quarterIndex;
    if (newQuarter) {
      quarterIndex = quartersList.findIndex(x => x.id === newQuarter);
      if (quarterIndex !== -1) {
          this.setState({coursesList: quartersList[quarterIndex].courses});
          if (quartersList[quarterIndex].courses)
            return true;
          return false;
      } else {
        this.setState({coursesList: null});
        return false;
      }
    } else {
      this.setState({coursesList: null});
      return false;
    }
  }

  render() {
    const { handleSubmit, quartersList, setQuartersList, quarter } = this.props;
    const { coursesList, professorsList } = this.state;
    return (
      <form className='content' onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          name="quarter" //responsible for object's key name for values
          component={this.renderQuarters}
          checkIfCoursesListExists={newQuarter => this.checkIfCoursesListExists(newQuarter)}
          quartersList={quartersList}
          setCoursesList={(newCoursesList, newQuarter) => {
            let quartersListCopy = JSON.parse(JSON.stringify(quartersList));
            let quarterIndex = quartersListCopy.findIndex(x => x.id === newQuarter);
            if (quarterIndex !== -1) {
              quartersListCopy[quarterIndex].courses = newCoursesList; //*******
              setQuartersList(quartersListCopy);
              this.setState({coursesList: newCoursesList});
            }
          }}
        />

        <Field
          name="course" //responsible for object's key name for values
          component={this.renderCourses}
          checkIfProfessorsListExists={newCourse => this.checkIfProfessorsListExists(newCourse)}
          coursesList={coursesList}
          quarterSelected={this.props.quarter ? true : false}
          professorsList={professorsList}
          setProfessorsList={(professorsList, newCourse) => {
            let quartersListCopy = JSON.parse(JSON.stringify(quartersList));
            let quarterIndex = quartersListCopy.findIndex(x => x.id === quarter);
            if (quarterIndex !== -1) {
              let courseIndex = quartersListCopy[quarterIndex].courses.findIndex(x => x.id === newCourse);
              if (courseIndex !== -1) {
                quartersListCopy[quarterIndex].courses[courseIndex].professors = professorsList;
                setQuartersList(quartersListCopy);
                this.setState({professorsList});
              }
            }
          }}
        />

        <Field
          name="professor" //responsible for object's key name for values
          component={this.renderProfessors}
          professorsList={professorsList}
          courseSelected={this.props.course ? true : false}
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
      quartersList: state.quartersList
   }
}

export default connect(mapStateToProps, { setQuartersList })(PostSearch);
