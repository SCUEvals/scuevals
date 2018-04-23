import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';
import DeleteModal from '../components/deleteModal';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';

import Eval from '../components/eval';
import API from '../services/api';
import '../styles/viewEvals.scss';
import { READ_EVALUATIONS } from '../index';
import { setDepartmentsList, setProfessorsList, setQuartersList, setCoursesList } from '../actions';
import CustomSort from '../utils/customSort';


class ViewMyEvals extends Component {
  static propTypes = {
    userInfo: PropTypes.object.isRequired,
    quartersList: PropTypes.object,
    coursesList: PropTypes.object,
    departmentsList: PropTypes.object,
    professorsList: PropTypes.object,
    setDepartmentsList: PropTypes.func.isRequired,
    setQuartersList: PropTypes.func.isRequired,
    setCoursesList: PropTypes.func.isRequired,
    setProfessorsList: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      deleteModal: {
        open: false, quarter_id: undefined, course_id: undefined, professor_id: undefined, eval_id: undefined,
      },
      myEvalsList: null,
      sortValue: null,
    };
  }

  componentDidMount() {
    const {
      userInfo, departmentsList, quartersList, coursesList, professorsList, setDepartmentsList, setProfessorsList, setQuartersList, setCoursesList,
    } = this.props;
    const client = new API();
    // parameters directly in URL instead of passed in params as {embed: ['professor, 'course']} because axios converts params differently than API expects (contains []'s, back end doesn't process it)
    client.get(`/students/${userInfo.id}/evaluations?embed=course&embed=professor`, (myEvalsList) => {
      CustomSort('recent', myEvalsList);
      this.setState({ myEvalsList });
    });
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

  componentDidUpdate() { // if coursesList fetched before departmentsList, then need to retroactively search for department name from id and sort
    if (this.props.coursesList && !this.props.coursesList.departmentsListLoaded && this.props.departmentsList) {
      this.props.setCoursesList(this.props.coursesList.array.slice(), this.props.departmentsList);
    } // make deep copy of current, state immutable
  }

  render() {
    const { deleteModal, myEvalsList, sortValue } = this.state;
    const {
      userInfo, quartersList, coursesList, departmentsList, professorsList,
    } = this.props;
    const read_access = userInfo && userInfo.permissions.includes(READ_EVALUATIONS);
    const sortOptions = [
      { value: 'recent', label: 'Sort by Most Recent' },
      { value: 'quarter', label: 'Sort by Quarter' },
      { value: 'course', label: 'Sort by Course' },
      { value: 'professor', label: 'Sort by Professor' },
      { value: 'votes_score', label: 'Sort by Votes Score' },
    ];
    return (
      <div className="content">
        {!read_access && (
          <div className="noWriteDiv">
            <Link className="homeBtn noWriteHomeBtn" to="/">
              <i className="fa fa-home" />
            </Link>
          </div>
        )}
        <DeleteModal
          deleteModalOpen={deleteModal.open}
          closeDeleteModal={() => this.setState({ deleteModal: { open: false } })}
          quarter={quartersList && deleteModal.quarter_id ?
            quartersList.object[deleteModal.quarter_id].label : null}
          course={coursesList && coursesList.departmentsListLoaded && deleteModal.course_id ? coursesList.object[deleteModal.course_id].label : null}
          professor={professorsList && deleteModal.professor_id ? professorsList.object[deleteModal.professor_id].label : null}
          eval_id={deleteModal.eval_id}
          deletePost={() => {
            const client = new API();
            client.delete(`/evaluations/${deleteModal.eval_id}`, () => ReactGA.event({ category: 'Evaluation', action: 'Deleted' }));
            for (let i = 0; i < myEvalsList.length; i++) {
              if (myEvalsList[i].id === deleteModal.eval_id) {
                const newList = myEvalsList.slice();
                newList.splice(i, 1);
                this.setState({ myEvalsList: newList });
                break;
              }
            }
          }}
        />
        <h4 className="banner">{userInfo.first_name}{'\'s'} Evals</h4>
        {myEvalsList ?
          myEvalsList.length === 0 ?
            <h5>You haven&#8217;t posted anything yet.</h5>
            :
            <Fragment>
              <div className="sort-wrapper">
                <Select
                  isLoading={!coursesList && !departmentsList && !professorsList}
                  value={sortValue}
                  simpleValue
                  options={sortOptions}
                  placeholder="Sort"
                  onChange={(newSortValue) => {
                    const myEvalsListCopy = myEvalsList.slice();
                    CustomSort(newSortValue, myEvalsListCopy, 'recent');
                    this.setState({ myEvalsList: myEvalsListCopy, sortValue: newSortValue });
                    this.sortArrows.className = 'fa fa-sort';
                  }}
                />
                <i
                  ref={(obj) => { this.sortArrows = obj; }}
                  tabIndex="0"
                  className="fa fa-sort"
                  onClick={(e) => {
                    const myEvalsListCopy = myEvalsList.slice();
                    myEvalsListCopy.reverse();
                    this.setState({ myEvalsList: myEvalsListCopy });
                    if (e.target.className === 'fa fa-sort' || e.target.className === 'fa fa-sort-asc') e.target.className = 'fa fa-sort-desc';
                    else e.target.className = 'fa fa-sort-asc';
                  }}
                  onKeyPress={(event) => {
                    if (event.key === 'Enter') event.target.click();
                  }}
                />
              </div>
              {myEvalsList.map(evaluation => (<Eval
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
              />))}
            </Fragment>
          : <h5>Loading...</h5>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    departmentsList: state.departmentsList,
    quartersList: state.quartersList,
    coursesList: state.coursesList,
    professorsList: state.professorsList,
  };
}

export default connect(mapStateToProps, {
  setDepartmentsList, setQuartersList, setCoursesList, setProfessorsList,
})(ViewMyEvals);
