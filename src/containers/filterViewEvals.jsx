import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, change, formValueSelector } from 'redux-form';
import Select from 'react-select';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';

import { storeWithMiddleware, READ_EVALUATIONS, VOTE_EVALUATIONS } from '../index';
import API from '../services/api';
import {
  setDepartmentsListAction,
  setQuartersListAction,
  setCoursesListAction,
  setProfessorsListAction,
} from '../actions';
import CustomSort from '../utils/customSort';
import Averages from '../components/averages';
import Eval from '../components/eval';
import FlagModal from '../components/flagModal';
import DeleteModal from '../components/deleteModal';
import '../styles/filterViewEvals.scss';
import {
  quartersListPT,
  coursesListPT,
  departmentsListPT,
  professorsListPT,
  majorsListPT,
  matchPT,
  userInfoPT,
} from '../utils/propTypes';

class FilterViewEvals extends Component {
  static propTypes = {
    quartersList: quartersListPT,
    coursesList: coursesListPT,
    departmentsList: departmentsListPT,
    professorsList: professorsListPT,
    majorsList: majorsListPT,
    match: matchPT,
    userInfo: userInfoPT.isRequired,
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
    const {
      input, localQuartersList, populateFields, filterViewEvals, getEvals,
    } = field;
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
            if (newQuarter !== input.value) {
              getEvals('quarter', newQuarter);
              populateFields(newQuarter);
            }
          }}
          onOpen={() => {
            if (!filterViewEvals) return;
            if (window.innerWidth >= 768 && filterViewEvals.clientHeight <= 193) {
              filterViewEvals.style.marginBottom = '175px';
            }
          }}
          onClose={() => {
            if (!filterViewEvals) return;
            if (document.getElementsByClassName('is-open').length === 0) {
              filterViewEvals.style.marginBottom = '';
            }
          }}
          placeholder="Select your quarter"
        />
      </div>
    );
  }

  static renderCourses(field) {
    const {
      input, localCoursesList, populateFields, filterViewEvals, getEvals,
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
            if (newCourse !== input.value) {
              getEvals('course', newCourse);
              populateFields(newCourse);
            }
          }}
          onOpen={() => {
            if (!filterViewEvals) return;
            if (window.innerWidth >= 768 && filterViewEvals.clientHeight <= 193) {
              filterViewEvals.style.marginBottom = '175px';
            }
          }}
          onClose={() => {
            if (!filterViewEvals) return;
            if (document.getElementsByClassName('is-open').length === 0) {
              filterViewEvals.style.marginBottom = '';
            }
          }}
          placeholder="Select your course"
        />
      </div>
    );
  }

  static renderProfessors(field) {
    const {
      input, localProfessorsList, populateFields, filterViewEvals, getEvals,
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
            if (newProfessor !== input.value) {
              getEvals('professor', newProfessor);
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
      localQuartersList: quartersList ? quartersList.array : undefined,
      localCoursesList: coursesList && coursesList.departmentsListLoaded ?
        coursesList.array
        : undefined,
      localProfessorsList: professorsList ? professorsList.array : undefined,
      /* keep track of order of selected fields to behave appropriately (clear/repopulate proper
         fields) */
      selectionOrder: initialValues && initialValues.course ?
        ['course']
        : initialValues && initialValues.professor ?
          ['professor']
          : [],
      evaluations: null,
      flagModal: {
        open: false,
        comment: undefined,
        evalID: undefined,
        userFlagged: undefined,
        setUserFlagged: undefined,
      },
      deleteModal: {
        open: false,
        quarterID: undefined,
        courseID: undefined,
        professorID: undefined,
        evalID: undefined,
      },
      sortValue: null,
    };

    this.getEvals = this.getEvals.bind(this);

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
        // departmentsList needed to lookup ids. May not be loaded yet, but that's handled below
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
      if (
        localQuartersList === undefined
        && quartersList
      ) this.setState({ localQuartersList: quartersList.array });
      if (
        localCoursesList === undefined
        && coursesList && coursesList.departmentsListLoaded
      ) this.setState({ localCoursesList: coursesList.array });
      if (
        localProfessorsList === undefined
        && professorsList
      ) this.setState({ localProfessorsList: professorsList.array });
    } else if (
      initialValues.professor
      && localCoursesList === undefined
      && professorsList
      && departmentsList
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
      // make deep copy of current, state immutable
    ) this.props.setCoursesList(this.props.coursesList.array.slice(), this.props.departmentsList);
  }

  // eslint-disable-next-line camelcase
  getField(field, client, quarter_id, course_id, professor_id, departmentsList) {
    switch (field) {
    case 'quarter':
      this.setState({ localQuartersList: null }, () => client.get('/quarters', (quarters) => {
        if (this.filterViewEvals) {
          CustomSort('quarter', quarters);
          // eslint-disable-next-line no-param-reassign
          quarters.map(quarter => (quarter.label = `${quarter.name} ${quarter.year}`));
          this.setState({ localQuartersList: quarters });
        }
      }, { quarter_id, course_id, professor_id }));
      break;
    case 'course':
      this.setState({ localCoursesList: null }, () => client.get('/courses', (courses) => {
        if (this.filterViewEvals) {
          CustomSort('course', courses);
          // eslint-disable-next-line no-param-reassign
          courses.map(course => (course.label = `${departmentsList.object[course.department_id].abbr} ${course.number}: ${course.title}`));

          this.setState({ localCoursesList: courses });
        }
      }, { quarter_id, course_id, professor_id }));
      break;
    case 'professor':
      this.setState({ localProfessorsList: null }, () => client.get('/professors', (professors) => {
        if (this.filterViewEvals) {
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
      default:
        break;
      }
      /* parameters directly in URL instead of passed in params as {embed: ['professor, 'course']}
         because axios converts params differently than API expects (contains []'s, back end doesn't
         process it) */
      client.get('/evaluations?embed=course&embed=professor', (evaluations) => {
        CustomSort('quarter', evaluations);
        if (this.filterViewEvals) this.setState({ evaluations });
      }, params);
    });
  }

  populateFields(currentField, field1, field2, newValue) {
    const {
      quartersList, coursesList, professorsList, departmentsList, quarter, course, professor,
    } = this.props;
    const { selectionOrder } = this.state;
    // = currently selected values
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
        storeWithMiddleware.dispatch(change('filterViewEvals', selectionOrder[i], ''));
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
      if (
        !quarterID
        && currentField !== 'quarter' &&
        (courseID || professorID)
      ) this.getField('quarter', client, quarterID, courseID, professorID);
      if (
        !courseID &&
        currentField !== 'course'
        && (quarterID || professorID)
      ) this.getField('course', client, quarterID, courseID, professorID, departmentsList);
      if (
        !professorID
        && currentField !== 'professor'
        && (quarterID || courseID)
      ) this.getField('professor', client, quarterID, courseID, professorID);
    } else {
      selectionOrder.push(currentField);
      if (selectionOrder.length !== 3) {
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

  render() {
    const sortOptions = [
      { value: 'quarter', label: 'Sort by Quarter' },
      { value: 'course', label: 'Sort by Course' },
      { value: 'professor', label: 'Sort by Professor' },
      { value: 'votes_score', label: 'Sort by Votes Score' },
      { value: 'major', label: 'Sort By Major' },
      { value: 'grad_year', label: 'Sort By Graduation Year' },
    ];
    const {
      userInfo,
      departmentsList,
      quartersList,
      coursesList,
      professorsList,
      majorsList,
      quarter,
      course,
      professor,
    } = this.props;
    const {
      localQuartersList,
      localCoursesList,
      localProfessorsList,
      evaluations,
      flagModal,
      deleteModal,
      sortValue,
    } = this.state;
    return (
      <div ref={node => (this.filterViewEvals = node)} styleName="filterViewEvals" className="content">
        <FlagModal
          flagModalOpen={flagModal.open}
          comment={flagModal.comment}
          closeFlagModal={() => this.setState({ flagModal: { open: false } })}
          evalID={flagModal.evalID}
          userFlagged={flagModal.userFlagged}
          setUserFlagged={flagModal.setUserFlagged}

        />
        <DeleteModal
          deleteModalOpen={deleteModal.open}
          closeDeleteModal={() => this.setState({ deleteModal: { open: false } })}
          quarter={quartersList && deleteModal.quarterID ?
            quartersList.object[deleteModal.quarterID].label
            : null
          }
          course={coursesList && coursesList.departmentsListLoaded && deleteModal.courseID ?
            coursesList.object[deleteModal.courseID].label
            : null
          }
          professor={professorsList && deleteModal.professorID ?
            professorsList.object[deleteModal.professorID].label
            : null
          }
          deletePost={() => {
            const client = new API();
            client.delete(`/evaluations/${deleteModal.evalID}`, () => ReactGA.event({ category: 'Evaluation', action: 'Deleted' }));
            for (let i = 0; i < evaluations.length; i++) {
              if (evaluations[i].id === deleteModal.evalID) {
                const evals = evaluations.slice();
                evals.splice(i, 1);
                this.setState({ evaluations: evals });
                break;
              }
            }
          }}
        />
        <form>
          <h4 className="banner">Browse Evaluations</h4>
          <div className="row">
            <div className="col-md-4">
              <Field
                name="quarter" // responsible for object's key name for values
                component={FilterViewEvals.renderQuarters}
                localQuartersList={localQuartersList}
                populateFields={newValue => this.populateFields('quarter', 'course', 'professor', newValue)}
                filterViewEvals={this.filterViewEvals}
                getEvals={this.getEvals}
              />
            </div>
            <div className="col-md-4">
              <Field
                name="course" // responsible for object's key name for values
                component={FilterViewEvals.renderCourses}
                localCoursesList={localCoursesList}
                populateFields={newValue => this.populateFields('course', 'quarter', 'professor', newValue)}
                filterViewEvals={this.filterViewEvals}
                getEvals={this.getEvals}
              />
            </div>
            <div className="col-md-4">
              <Field
                name="professor" // responsible for object's key name for values
                component={FilterViewEvals.renderProfessors}
                localProfessorsList={localProfessorsList}
                populateFields={newValue => this.populateFields('professor', 'quarter', 'course', newValue)}
                filterViewEvals={this.filterViewEvals}
                getEvals={this.getEvals}
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
                  ref={obj => (this.sortArrows = obj)}
                  tabIndex="0"
                  role="button"
                  className="fa fa-sort"
                  onClick={(e) => {
                    const evals = evaluations.slice().reverse();
                    this.setState({ evaluations: evals });
                    if (e.target.className === 'fa fa-sort'
                      || e.target.className === 'fa fa-sort-asc'
                    ) e.target.className = 'fa fa-sort-desc';
                    else e.target.className = 'fa fa-sort-asc';
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
                  authorMajors.sort((a, b) =>
                    (majorsList.object[a].name > majorsList.object[b].name ? 1 : -1));
                  authorMajors.map(i => (userString += `${majorsList.object[i].name}, `));
                }
                if (userString && !evaluation.author.graduation_year) {
                  // cut off last comma and space
                  userString = userString.substring(0, userString.length - 2);
                } else if (evaluation.author && evaluation.author.graduation_year) {
                  userString += `Class of ${evaluation.author.graduation_year}`;
                }
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
                          quarterID: evaluation.quarterID,
                          courseID: evaluation.course.id,
                          professorID: evaluation.professor.id,
                          evalID: evaluation.id,
                        },
                      });
                    }}
                    openFlagModal={(comment, evalID, userFlagged, setUserFlagged) => this.setState({
                      flagModal: {
                        open: true,
                        comment,
                        evalID,
                        userFlagged,
                        setUserFlagged,
                      },
                    })}
                    vote_access={userInfo.permissions.includes(VOTE_EVALUATIONS)}
                    userString={userString}
                    // score must be updated in evaluations array so sorting works with new values
                    updateScore={(newScore) => {
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

const mapStateToProps = (state) => {
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

const mapDispatchToProps = {
  setDepartmentsList: setDepartmentsListAction,
  setQuartersList: setQuartersListAction,
  setCoursesList: setCoursesListAction,
  setProfessorsList: setProfessorsListAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(FilterViewEvalsWithReduxForm);
