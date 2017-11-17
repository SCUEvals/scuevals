import React, { Component } from 'react';
import { Field, reduxForm, change } from 'redux-form';
import { connect } from 'react-redux';
import Select from 'react-select';

import { storeWithMiddleware } from '../index';
import API from '../../public/scripts/api_service';


class PrePostEval extends Component {

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
        this.setState({quartersList: responseData});
      })
    };
    getQuarters();
  }

  onSubmit(values) {
    console.log('values:', values);
  }

  renderQuarters(field) {
    const { input, quartersList, setCoursesList, setQuarterSelected, setCourseSelected } = field;
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
            let client = new API();
            setQuarterSelected(newQuarter ? true : false);
            if (!newQuarter) {
              storeWithMiddleware.dispatch(change('postSearch', 'course', ''));
              storeWithMiddleware.dispatch(change('postSearch', 'professor', ''));
              setCourseSelected(false);
            }

            setCoursesList(null);
            client.get('/courses', coursesList => {
              coursesList.map(course => {
                course.label = course.department + ' ' + course.number + ': ' + course.title;
                //optionally can delete unusued parts of obj, but not necessary
              });
              setCoursesList(coursesList);
            }, {quarter_id: newQuarter});
          }}
          placeholder="Select your quarter"
          onBlur={() => input.onBlur(input.value)}
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
            setCourseSelected(newCourse ? true : false);
            if (!newCourse) storeWithMiddleware.dispatch(change('postSearch', 'professor', ''));
            setProfessorsList(null);
            input.onChange(newCourse);
            let client = new API();
            client.get('/professors', professorsList => {
              professorsList.map(professor => {
                professor.label = professor.first_name + ' ' + professor.last_name;
                //optionally can delete unusued parts of obj, but not necessary
              });
              setProfessorsList(professorsList);
            }, {course_id: newCourse});
          }}
          placeholder="Select your course"
          onBlur={() => input.onBlur(input.value)}
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
          onBlur={() => {
            input.onBlur(input.value)}
          }
        />
      </div>
    );
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          name="quarter" //responsible for object's key name for values
          component={this.renderQuarters}
          quartersList={this.state.quartersList}
          setCoursesList={coursesList => this.setState({coursesList})}
          setQuarterSelected={state => this.setState({quarterSelected: state})}
          setCourseSelected={state => this.setState({courseSelected: state})}
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


export default reduxForm({
  form: 'postSearch'
})(
  connect(null, null )(PrePostEval)
);
