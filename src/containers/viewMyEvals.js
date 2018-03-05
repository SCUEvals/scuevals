import React, { Component } from 'react';
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
    setProfessorsList: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      deleteModal: { open: false, quarter_id: undefined, course_id: undefined, professor_id: undefined, eval_id: undefined },
      myEvalsList: null,
      sortValue: null
    };
  }

  componentDidMount() {
    const { userInfo, departmentsList, quartersList, coursesList, professorsList, setDepartmentsList, setProfessorsList, setQuartersList, setCoursesList } = this.props;
    let client = new API();
    client.get('/evaluations', myEvalsList => {
      myEvalsList.sort((a, b) => a.post_time > b.post_time ? -1 : 1); //sort by most recent by default when viewing own evals
      this.setState({myEvalsList});
    });
    if (!userInfo.permissions.includes(READ_EVALUATIONS)) {
      if (!departmentsList) {
        let client = new API();
        client.get('/departments', departments => setDepartmentsList(departments));
      }
      if (!quartersList) {
        let client = new API();
        client.get('/quarters', quarters => setQuartersList(quarters));
      }
      if (!coursesList) {
        let client = new API();
        client.get('/courses', courses => setCoursesList(courses, departmentsList)); //departmentsList needed to lookup ids. May not be loaded yet, but that's handled below
      }
      if (!professorsList) {
        let client = new API();
        client.get('/professors', professors => setProfessorsList(professors));
      }
    }
  }

  componentDidUpdate() { //if coursesList fetched before departmentsList, then need to retroactively search for department name from id and sort
    if (this.props.coursesList && !this.props.coursesList.departmentsListLoaded && this.props.departmentsList)
      this.props.setCoursesList(this.props.coursesList.array.slice(), this.props.departmentsList); //make deep copy of current, state immutable
  }

  render() {
    const { deleteModal, myEvalsList, sortValue } = this.state;
    const { userInfo, quartersList, coursesList, departmentsList, professorsList } = this.props;
    const read_access = userInfo && userInfo.permissions.includes(READ_EVALUATIONS);
    const sortOptions = [
      {value: 'recent', label: 'Sort by Most Recent'},
      {value: 'quarter', label: 'Sort by Quarter'},
      {value: 'course', label: 'Sort by Course'},
      {value: 'professor', label: 'Sort by Professor'},
      {value: 'score', label: 'Sort by Score'}
    ];
    return (
      <div className="content">
        {!read_access && (
          <div className='noWriteDiv'>
            <Link className='homeBtn noWriteHomeBtn' to={'/'}>
              <i className="fa fa-home" />
            </Link>
          </div>
        )}
        <DeleteModal
          deleteModalOpen={deleteModal.open}
          closeDeleteModal={() => this.setState({deleteModal: {open: false}})}
          quarter={quartersList && deleteModal.quarter_id ? quartersList.object[deleteModal.quarter_id].label : null}
          course={coursesList && coursesList.departmentsListLoaded && deleteModal.course_id ? coursesList.object[deleteModal.course_id].label : null }
          professor={professorsList && deleteModal.professor_id ? professorsList.object[deleteModal.professor_id].label : null}
          eval_id={deleteModal.eval_id}
          deletePost={() => {
            let client = new API();
            client.delete(`/evaluations/${deleteModal.eval_id}`, () => ReactGA.event({category: 'Evaluation', action: 'Deleted'}));
            myEvalsList.map((obj, key) => {
              if (obj.id === deleteModal.eval_id) {
                let newList = myEvalsList.slice();
                newList.splice(key, 1);
                this.setState({ myEvalsList: newList });
              }
            })
          }}
        />
        <h4 className='banner'>{userInfo.first_name}&#8217;s Evals</h4>
        {myEvalsList ?
           myEvalsList.length === 0 ?
            <h5>You haven&#8217;t posted anything yet.</h5>
            : <div>
              <Select
                isLoading={!coursesList && !departmentsList && !professorsList}
                value={sortValue}
                className='sort'
                simpleValue
                options={sortOptions}
                placeholder="Sort"
                onChange={sortValue => {
                  let myEvalsListCopy = myEvalsList.slice();
                  switch (sortValue) {
                    case 'course':
                      myEvalsListCopy.sort((a, b) => {
                        if (a.course.department_id === b.course.department_id) {
                          //nums can have letters in them too (ex. 12L), so parse integers and compare
                          let parsedANum = parseInt(a.course.number, 10);
                          let parsedBNum = parseInt(b.course.number, 10);
                          //if integers same, check for letters to decide
                          if (parsedANum === parsedBNum) return a.number > b.number ? 1
                          : a.course.number < b.course.number ? -1
                          : a.post_time > b.post_time ? -1 : 1;
                          else return parsedANum > parsedBNum ? 1 : -1;
                        }
                        else return departmentsList[a.course.department_id].abbr > departmentsList[b.course.department_id].abbr ? 1 : -1;
                      });
                      break;
                    case 'professor':
                      myEvalsListCopy.sort((a, b) =>
                        professorsList.object[a.professor.id].label > professorsList.object[b.professor.id].label ? 1
                        : professorsList.object[a.professor.id].label < professorsList.object[b.professor.id].label ? -1
                        : 0
                      );
                      break;
                    case 'quarter':
                      myEvalsListCopy.sort((a, b) => //assumption made that newest quarter will always be greatest number (currently always true)
                        a.quarter_id > b.quarter_id ? -1 : a.quarter_id < b.quarter_id ? 1 : a.post_time > b.post_time ? -1 : 1
                      );
                      break;
                    case 'score':
                      myEvalsListCopy.sort((a, b) =>
                        a.votes_score > b.votes_score ? -1
                        : a.votes_score < b.votes_score ? 1
                        : a.post_time > b.post_time ? -1 : 1
                      );
                      break;
                    default: //will capture 'recent' case too since default is sort by most recent in viewMyEvals
                      myEvalsListCopy.sort((a, b) => a.post_time > b.post_time ? -1 : 1); //sort by most recent by default when viewing own evals
                  }
                  this.setState({myEvalsList: myEvalsListCopy, sortValue});
                  this.sortArrows.className='fa fa-sort';
                }}
              />
              <i
                ref={obj => this.sortArrows = obj}
                tabIndex='0'
                className='fa fa-sort'
                onClick={e => {
                  let myEvalsListCopy = myEvalsList.slice();
                  myEvalsListCopy.reverse();
                  this.setState({myEvalsList: myEvalsListCopy});
                  if (e.target.className === 'fa fa-sort' || e.target.className === 'fa fa-sort-asc')
                    e.target.className = 'fa fa-sort-desc';
                  else e.target.className = 'fa fa-sort-asc';
                }}
                onKeyPress={event => {
                  if (event.key === 'Enter') event.target.click();
                }}

               />
                {myEvalsList.map(evaluation => {
                  return <Eval
                    key={evaluation.id}
                    evaluation={evaluation}
                    department={departmentsList && evaluation.course ? departmentsList[evaluation.course.department_id].abbr + ' ' + evaluation.course.number + ': ' + evaluation.course.title : null}
                    quarter={quartersList ? quartersList.object[evaluation.quarter_id].name + ' ' + quartersList.object[evaluation.quarter_id].year : null}
                    openModal={() => { //type, quarter_id, secondId, eval_id passed in, but not needed in viewMyEvals
                      this.setState({deleteModal: {open: true, quarter_id: evaluation.quarter_id, course_id: evaluation.course.id, professor_id: evaluation.professor.id, eval_id: evaluation.id}});
                    }}
                  />
                })}
            </div>
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
    professorsList: state.professorsList
  };
}

export default connect(mapStateToProps, { setDepartmentsList, setQuartersList, setCoursesList, setProfessorsList })(ViewMyEvals);
