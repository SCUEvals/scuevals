import React, { Component, Fragment } from 'react';
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
import Averages from '../components/averages';
import Eval from '../components/eval';
import FlagModal from '../components/flagModal';
import DeleteModal from '../components/deleteModal';
import { VOTE_EVALUATIONS } from '../index';
import '../styles/filterViewEvals.scss';

class FilterViewEvals extends Component {
  static propTypes = {
    quartersList: PropTypes.object,
    coursesList: PropTypes.object,
    departmentsList: PropTypes.object,
    professorsList: PropTypes.object,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
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
      localQuartersList: quartersList ? quartersList.array : undefined,
      localCoursesList: coursesList && coursesList.departmentsListLoaded ? coursesList.array : undefined,
      localProfessorsList: professorsList ? professorsList.array : undefined,
      selectionOrder: initialValues && initialValues.course ? ['course'] : initialValues && initialValues.professor ? ['professor'] : [], // keep track of order of selected fields to behave appropriately (clear/repopulate proper fields)
      evaluations: null,
      flagModal: {
        open: false, comment: undefined, eval_id: undefined, user_flagged: undefined, set_user_flagged: undefined,
      },
      deleteModal: {
        open: false, quarter_id: undefined, course_id: undefined, professor_id: undefined, eval_id: undefined,
      },
      sortValue: null,
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

  renderQuarters(field) {
    const { input, localQuartersList, populateFields, filterViewEvals } = field;
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
            if (newQuarter != input.value) {
              this.getEvals('quarter', newQuarter);
              populateFields(newQuarter);
            }
          }}
          onOpen={() => {
            if (!filterViewEvals) return;
            if (window.innerWidth >= 768 && filterViewEvals.clientHeight <= 193) filterViewEvals.style.marginBottom = '175px';
          }}
          onClose={() => {
            if (!filterViewEvals) return;
            if (document.getElementsByClassName('is-open').length === 0) filterViewEvals.style.marginBottom = '';
          }}
          placeholder="Select your quarter"
        />
      </div>
    );
  }

  renderCourses(field) {
    const { input, localCoursesList, populateFields, filterViewEvals } = field;
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
            if (newCourse != input.value) {
              this.getEvals('course', newCourse);
              populateFields(newCourse);
            }
          }}
          onOpen={() => {
            if (!filterViewEvals) return;
            if (window.innerWidth >= 768 && filterViewEvals.clientHeight <= 193) filterViewEvals.style.marginBottom = '175px';
          }}
          onClose={() => {
            if (!filterViewEvals) return;
            if (document.getElementsByClassName('is-open').length === 0) filterViewEvals.style.marginBottom = '';
          }}
          placeholder="Select your course"
        />
      </div>
    );
  }

  renderProfessors(field) {
    const {
      input, localProfessorsList, populateFields, filterViewEvals,
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
            if (newProfessor != input.value) {
              this.getEvals('professor', newProfessor);
              populateFields(newProfessor);
            }
          }}
          placeholder="Select your professor"
          onOpen={() => {
            if (!filterViewEvals) return;
            if (filterViewEvals.clientHeight <= 193 || window.innerHeight < 768) filterViewEvals.style.marginBottom = '175px';
          }}
          onClose={() => {
            if (!filterViewEvals) return;
            if (document.getElementsByClassName('is-open').length === 0) filterViewEvals.style.marginBottom = '';
          }}
        />
      </div>
    );
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
        storeWithMiddleware.dispatch(change('filterViewEvals', selectionOrder[i], ''));
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
      if (selectionOrder.length !== 3) {
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
          if (this.filterViewEvals) {
            CustomSort('quarter', quarters);
            quarters.map(quarter => quarter.label = `${quarter.name} ${quarter.year}`);
            this.setState({ localQuartersList: quarters });
          }
        }, { quarter_id, course_id, professor_id }));
        break;
      case 'course':
        this.setState({ localCoursesList: null }, () => client.get('/courses', (courses) => {
          if (this.filterViewEvals) {
            CustomSort('course', courses);
            courses.map(course => course.label = `${departmentsList.object[course.department_id].abbr} ${course.number}: ${course.title}`);

            this.setState({ localCoursesList: courses });
          }
        }, { quarter_id, course_id, professor_id }));
        break;
      case 'professor':
        this.setState({ localProfessorsList: null }, () => client.get('/professors', (professors) => {
          if (this.filterViewEvals) {
            professors.map(professor => professor.label = `${professor.last_name}, ${professor.first_name}`);
            CustomSort('professor', professors);
            this.setState({ localProfessorsList: professors });
          }
        }, { quarter_id, course_id, professor_id }));
        break;
    }
  }

  getEvals(type, newVal) {
      this.setState({ evaluations: undefined }, () => {
        const client = new API();
        const { quarter, course, professor } = this.props;
        let params;
        switch (type) {
        case 'quarter':
          if (!newVal && !course && !professor) return;
          params = { quarter_id: newVal, course_id: course, professor_id: professor };
          break;

        case 'course':
          if (!quarter && !newVal && !professor) return;
          params = { quarter_id: quarter, course_id: newVal, professor_id: professor };
          break;

        case 'professor':
          if (!quarter && !course && !newVal) return;
          params = { quarter_id: quarter, course_id: course, professor_id: newVal };
          break;
        }
        // parameters directly in URL instead of passed in params as {embed: ['professor, 'course']} because axios converts params differently than API expects (contains []'s, back end doesn't process it)
        client.get('/evaluations?embed=course&embed=professor', (evaluations) => {
          CustomSort('quarter', evaluations);
          if (this.filterViewEvals) this.setState({ evaluations });
        }, params);
    });
  }

  render() {
    const sortOptions = [
      { value: 'quarter', label: 'Sort by Quarter' },
      { value: 'course', label: 'Sort by Course' },
      { value: 'professor', label: 'Sort by Professor'},
      { value: 'votes_score', label: 'Sort by Votes Score' },
      { value: 'major', label: 'Sort By Major' },
      { value: 'grad_year', label: 'Sort By Graduation Year' },
    ];
    const { userInfo, departmentsList, quartersList, coursesList, professorsList, majorsList, quarter, course, professor } = this.props;
    const {
      localQuartersList, localCoursesList, localProfessorsList, evaluations, flagModal, deleteModal, sortValue,
    } = this.state;
    return (
      <div ref={node => this.filterViewEvals = node} styleName="filterViewEvals" className="content">
        <FlagModal
          flagModalOpen={flagModal.open}
          comment={flagModal.comment}
          closeFlagModal={() => this.setState({ flagModal: { open: false } })}
          evalId={flagModal.eval_id}
          user_flagged={flagModal.user_flagged}
          set_user_flagged={flagModal.set_user_flagged}

        />
        <DeleteModal
          deleteModalOpen={deleteModal.open}
          closeDeleteModal={() => this.setState({ deleteModal: { open: false } })}
          quarter={quartersList && deleteModal.quarter_id ? quartersList.object[deleteModal.quarter_id].label : null}
          course={coursesList && coursesList.departmentsListLoaded && deleteModal.course_id ? coursesList.object[deleteModal.course_id].label : null}
          professor={professorsList && deleteModal.professor_id ? professorsList.object[deleteModal.professor_id].label : null}
          deletePost={() => {
            const client = new API();
            client.delete(`/evaluations/${deleteModal.eval_id}`, () => ReactGA.event({ category: 'Evaluation', action: 'Deleted' }));
            for (let i = 0; i < myEvalsList.length; i++) {
              if (evaluations[i].id === deleteModal.eval_id) {
                const evals = evaluations.slice();
                evals.splice(key, 1);
                this.setState({ evaluations: evals });
                break;
              }
            }
          }}
        />
        <form>
          <h4 className="banner">Browse Evaluations</h4>
          <div className='row'>
            <div className='col-md-4'>
              <Field
                name="quarter" // responsible for object's key name for values
                component={this.renderQuarters.bind(this)}
                localQuartersList={localQuartersList}
                populateFields={newValue => this.populateFields('quarter', 'course', 'professor', newValue)}
                filterViewEvals={this.filterViewEvals}
              />
            </div>
            <div className='col-md-4'>
              <Field
                name="course" // responsible for object's key name for values
                component={this.renderCourses.bind(this)}
                localCoursesList={localCoursesList}
                populateFields={newValue => this.populateFields('course', 'quarter', 'professor', newValue)}
                filterViewEvals={this.filterViewEvals}
              />
            </div>
            <div className='col-md-4'>
              <Field
                name="professor" // responsible for object's key name for values
                component={this.renderProfessors.bind(this)}
                localProfessorsList={localProfessorsList}
                populateFields={newValue => this.populateFields('professor', 'quarter', 'course', newValue)}
                filterViewEvals={this.filterViewEvals}
              />
            </div>
          </div>
        </form>

        {evaluations ?
          evaluations.length === 0 ?
          <h5>No evaluations posted yet.</h5>
          :
          <Fragment>
            <Averages evaluations={evaluations} />
            {evaluations && evaluations.length < 0 && (<hr />)}
            <div className="sort-wrapper">
              <Select
                value={sortValue}
                isLoading={!departmentsList || !professorsList || !majorsList}
                disabled={!departmentsList || !professorsList || !majorsList}
                simpleValue
                options={sortOptions}
                placeholder="Sort"
                onChange={(newSortValue) => {
                  const evals = evaluations.slice();
                  CustomSort(newSortValue, evals, 'quarter');
                  this.setState({ evaluations: evals, sortValue: newSortValue });
                  this.sortArrows.className = 'fa fa-sort';
                }}
              />
              <i
                ref={obj => this.sortArrows = obj}
                tabIndex="0"
                className="fa fa-sort"
                onClick={(e) => {
                  const evals = evaluations.slice().reverse();
                  this.setState({ evaluations: evals });
                  if (e.target.className === 'fa fa-sort' || e.target.className === 'fa fa-sort-asc') { e.target.className = 'fa fa-sort-desc'; } else e.target.className = 'fa fa-sort-asc';
                }}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') event.target.click();
                }}

              />
            </div>
            {evaluations.map((evaluation, index) => {
            let userString = '';
            if (evaluation.author && evaluation.author.majors && majorsList) {
              const authorMajors = evaluation.author.majors.slice();
              // alphabetically sort majors if multiple
              authorMajors.sort((a, b) => (majorsList.object[a].name > majorsList.object[b].name ? 1 : -1));
              for (const i of authorMajors) userString += `${majorsList.object[i].name}, `;
            }
            if (userString && !evaluation.author.graduation_year) userString = userString.substring(0, userString.length - 2); // cut off last comma and space
            else if (evaluation.author && evaluation.author.graduation_year) userString += `Class of ${evaluation.author.graduation_year}`;
            return (
              <Eval
                key={evaluation.id}
                evaluation={evaluation}
                department={departmentsList && evaluation.course ?
                  `${departmentsList.object[evaluation.course.department_id].abbr} ${evaluation.course.number}: ${evaluation.course.title}`
                  : null}
                quarter={quartersList ?
                  `${quartersList.object[evaluation.quarter_id].name} ${quartersList.object[evaluation.quarter_id].year}`
                  : null}
                openDeleteModal={() => {
                  this.setState({
                    deleteModal: {
                      open: true,
                      quarter_id: evaluation.quarter_id,
                      course_id: evaluation.course.id,
                      professor_id: evaluation.professor.id,
                      eval_id: evaluation.id,
                    },
                  });
                }}
                openFlagModal={(comment, eval_id, user_flagged, set_user_flagged) => this.setState({
                  flagModal: {
                    open: true,
                    comment,
                    eval_id,
                    user_flagged,
                    set_user_flagged,
                  },
                })}
                vote_access={userInfo.permissions.includes(VOTE_EVALUATIONS)}
                quarter={quartersList ? `${quartersList.object[evaluation.quarter_id].name} ${quartersList.object[evaluation.quarter_id].year}` : null}
                userString={userString}
                updateScore={(newScore) => { // score must be updated in evaluations array so sorting works with new values (or else could just update in local state inside Eval)
                  const evals = evaluations.slice();
                  evals[index].votes_score = newScore;
                  this.setState({ evaluations: evals });
                }}
              />
            );
          })}
          </Fragment>
        : evaluations === undefined && (quarter || course || professor) && (
          <div styleName="loadingWrapper">
            <i className="fa fa-spinner fa-spin fa-3x fa-fw" />
          </div>
        )}
      </div>
    );
  }
}

const FilterViewEvalsWithReduxForm = reduxForm({
  form: 'filterViewEvals',
})(FilterViewEvals);

const mapStateToProps = (state, ownProps) => {
  const selector = formValueSelector('filterViewEvals'); // <-- same as form name
  const { quarter, course, professor } = selector(state, 'quarter', 'course', 'professor');
  return {
    quarter,
    course,
    professor,
    userInfo: state.userInfo,
    quartersList: state.quartersList,
    departmentsList: state.departmentsList,
    coursesList: state.coursesList,
    majorsList: state.majorsList,
    professorsList: state.professorsList,
  };
};

export default connect(mapStateToProps, {
  setDepartmentsList, setQuartersList, setCoursesList, setProfessorsList,
})(FilterViewEvalsWithReduxForm);
