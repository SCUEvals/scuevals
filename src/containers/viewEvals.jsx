import React, { Component, Fragment } from 'react';

import { connect } from 'react-redux';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga';
import PropTypes from 'prop-types';

import FlagModal from '../components/flagModal';
import DeleteModal from '../components/deleteModal';
import Eval from '../components/eval';
import API from '../services/api';
import '../styles/viewEvals.scss';
import { WRITE_EVALUATIONS, VOTE_EVALUATIONS } from '../index';
import RelatedInfo from '../components/relatedInfo';
import CustomSort from '../utils/customSort';
import {
  userInfoPT,
  majorsListPT,
  quartersListPT,
  coursesListPT,
  departmentsListPT,
  professorsListPT,
  locationPT,
  matchPT,
} from '../utils/propTypes';
import Averages from '../components/averages';

class ViewEvals extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    userInfo: userInfoPT,
    majorsList: majorsListPT,
    quartersList:  quartersListPT,
    coursesList: coursesListPT,
    departmentsList: departmentsListPT,
    professorsList: professorsListPT,
    location: locationPT,
    match: matchPT,
  }

  constructor(props) {
    super(props);
    this.state = {
      info: null,
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
        course_id: undefined,
        professor_id: undefined,
        evalID: undefined,
      },
      sortValue: null,
    };
  }

  componentWillMount() {
    this.getInfo();
  }

  componentWillUpdate(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.getInfo();
    }
  }

  getInfo() {
    this.setState({ info: null }, () => {
      const client = new API();
      client.get(`/${this.props.type}/${this.props.match.params.id}`, (info) => {
        CustomSort('quarter', info.evaluations);
        this.setState({ info });
      }, { embed: (this.props.type === 'courses' ? 'professors' : 'courses') });
    });
  }

  render() { // 1-1.74 score1, 1.75-2.49 score2, 2.50-3.24 score3, 3.25-4 score4
    const {
      info, flagModal, deleteModal, sortValue,
    } = this.state;
    const {
      majorsList, quartersList, coursesList, professorsList, departmentsList, userInfo, type, match,
    } = this.props;
    const writeAccess = userInfo.permissions.includes(WRITE_EVALUATIONS);


    const sortOptions = [
      { value: 'quarter', label: 'Sort by Quarter' },
      { value: type === 'professors' ? 'course' : 'professor',
        label: `Sort by ${type === 'professors' ? 'Course' : 'Professor'}`
      },
      { value: 'votes_score', label: 'Sort by Votes Score' },
      { value: 'major', label: 'Sort By Major' },
      { value: 'grad_year', label: 'Sort By Graduation Year' },
    ];

    return (
      <div className="content" styleName="viewEvals">
        <FlagModal
          flagModalOpen={flagModal.open}
          comment={flagModal.comment}
          closeFlagModal={() => this.setState({ flagModal: { open: false } })}
          evalId={flagModal.evalID}
          userFlagged={flagModal.userFlagged}
          setUserFlagged={flagModal.setUserFlagged}

        />
        <DeleteModal
          deleteModalOpen={deleteModal.open}
          closeDeleteModal={() => this.setState({ deleteModal: { open: false } })}
          quarter={quartersList && deleteModal.quarterID ?
            quartersList.object[deleteModal.quarterID].label : null
          }
          course={coursesList
            && coursesList.departmentsListLoaded
            && deleteModal.course_id ?
            coursesList.object[deleteModal.course_id].label : null
          }
          professor={professorsList && deleteModal.professor_id ?
            professorsList.object[deleteModal.professor_id].label : null
          }
          deletePost={() => {
            const client = new API();
            client.delete(`/evaluations/${deleteModal.evalID}`, () => ReactGA.event({ category: 'Evaluation', action: 'Deleted' }));
            for (let i = 0; i < info.evaluations.length; i++) {
              if (info.evaluations[i].id === deleteModal.evalID) {
                /* multiple shallow copies best way to handle nested state change while respecting
                  immutable state */
                const newList = Object.assign({}, info);
                const evals = info.evaluations.slice();
                evals.splice(i, 1);
                newList.evaluations = evals;
                this.setState({ info: newList });
                break;
              }
            }
          }}
        />
        <h2>
          {info ?
            type === 'professors' ?
              `${info.first_name} ${info.last_name}`
              : departmentsList ?
                `${departmentsList.object[info.department_id].abbr} ${info.number}: ${info.title}`
                : 'Loading...'
            : 'Loading...'
          }
        </h2>
        <Averages evaluations={info && info.evaluations} />
        <div styleName="buttonGroup">
          {(writeAccess && info) && (
            <Link
              className="btn"
              to={type === 'professors' ?
                `/professors/${match.params.id}/post`
                : `/courses/${match.params.id}/post`}
            >
            Post Evaluation
            </Link>
          )}
          {info && (info.courses || info.professors) && departmentsList && (
            <Fragment>
              <button className="btn" type="button" data-toggle="collapse" data-target="#relatedInfo" aria-expanded="false" aria-controls="relatedInfo">
                {info.courses ? 'Past Courses' : 'Past Professors'} <i className="fa fa-chevron-down" /><i className="fa fa-chevron-up" />
              </button>
              <div id="relatedInfo" className="collapse">
                <RelatedInfo
                  departmentsList={departmentsList}
                  type={type}
                  match={match}
                  info={type === 'professors' ? info.courses : info.professors}
                  desc={type === 'professors' ? `${info.first_name} ${info.last_name}`
                    : `${departmentsList.object[info.department_id].abbr} ${info.number}`}
                />
              </div>
            </Fragment>
          )}
        </div>
        {info && info.evaluations.length > 0 && (
          <div className="sort-wrapper">
            <Select
              isLoading={type === 'professors' ? !departmentsList || !majorsList
                : !professorsList || !majorsList
              }
              disabled={type === 'professors' ? !departmentsList || !majorsList
                : !professorsList || !majorsList
              }
              value={sortValue}
              simpleValue
              options={sortOptions}
              placeholder="Sort"
              onChange={(newSortValue) => {
                /* multiple shallow copies best way to handle nested state change while respecting
                   immutable state */
                const newInfo = Object.assign({}, info);
                const evals = info.evaluations.slice();
                newInfo.evaluations = evals;
                CustomSort(newSortValue, newInfo.evaluations, 'quarter');
                this.setState({ info: newInfo, sortValue: newSortValue });
                this.sortArrows.className = 'fa fa-sort';
              }}
            />
            <i
              ref={obj => (this.sortArrows = obj)}
              role="button"
              tabIndex="0"
              className="fa fa-sort"
              onClick={(e) => {
                /* multiple shallow copies best way to handle nested state change while respecting
                  immutable state */
                const newInfo = Object.assign({}, info);
                const evals = info.evaluations.slice();
                newInfo.evaluations = evals.reverse();
                this.setState({ info: newInfo });
                if (e.target.className === 'fa fa-sort'
                || e.target.className === 'fa fa-sort-asc') {
                  e.target.className = 'fa fa-sort-desc';
                } else e.target.className = 'fa fa-sort-asc';
              }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') event.target.click();
              }}

            />
          </div>
        )}
        {info && (
          info.evaluations.length === 0 ?
            <h5>No evaluations posted yet.</h5>
            : info.evaluations.map((evaluation, index) => {
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
                  quarter={quartersList ? `${quartersList.object[evaluation.quarter_id].name} ${quartersList.object[evaluation.quarter_id].year}` : null}
                  vote_access={userInfo.permissions.includes(VOTE_EVALUATIONS)}
                  department={departmentsList && evaluation.course ? `${departmentsList.object[evaluation.course.department_id].abbr} ${evaluation.course.number}: ${evaluation.course.title}` : null}
                  evaluation={evaluation}
                  userString={userString}
                  /* score must be updated in info array so sorting works with new values (or else
                     could just update in local state inside Eval) */
                  updateScore={(newScore) => {
                    /* multiple shallow copies best way to handle nested state change while
                      respecting immutable state */
                    const newInfo = Object.assign({}, info);
                    const evals = info.evaluations.slice();
                    newInfo.evaluations = evals;
                    newInfo.evaluations[index].votes_score = newScore;
                    this.setState({ info: newInfo });
                  }}
                  openDeleteModal={(quarterID, secondId, evalID) => {
                    switch (type) {
                    case 'courses':
                      this.setState({
                        deleteModal: {
                          open: true,
                          quarterID,
                          course_id: info.id,
                          professor_id: secondId,
                          evalID,
                        },
                      });
                      break;
                    case 'professors':
                      this.setState({
                        deleteModal: {
                          open: true,
                          quarterID,
                          course_id: secondId,
                          professor_id: info.id,
                          evalID,
                        },
                      });
                      break;
                    default:
                      break;
                    }
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
                />
              );
            })
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  departmentsList: state.departmentsList,
  majorsList: state.majorsList,
  quartersList: state.quartersList,
  coursesList: state.coursesList,
  professorsList: state.professorsList,
});

export default connect(mapStateToProps, null)(ViewEvals);
