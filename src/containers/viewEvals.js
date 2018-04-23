import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { Manager, Target, Popper, Arrow } from 'react-popper';
import ReactGA from 'react-ga';

import FlagModal from '../components/flagModal';
import DeleteModal from '../components/deleteModal';
import TextOptions from '../components/textOptions';
import Eval from '../components/eval';
import API from '../services/api';
import '../styles/viewEvals.scss';
import { WRITE_EVALUATIONS, VOTE_EVALUATIONS } from '../index';
import RelatedInfo from '../components/relatedInfo';
import CustomSort from '../utils/customSort';

class ViewEvals extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    userInfo: PropTypes.object,
    majorsList: PropTypes.object,
    quartersList: PropTypes.object,
    coursesList: PropTypes.object,
    departmentsList: PropTypes.object,
    professorsList: PropTypes.object,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      info: null,
      flagModal: {
        open: false, comment: undefined, eval_id: undefined, user_flagged: undefined, set_user_flagged: undefined,
      },
      deleteModal: {
        open: false, quarter_id: undefined, course_id: undefined, professor_id: undefined, eval_id: undefined,
      },
      sortValue: null,
    };
  }

  componentWillMount() {
    const client = new API();
    client.get(`/${this.props.type}/${this.props.match.params.id}`, (info) => {
      CustomSort('quarter', info.evaluations);
      this.setState({ info });
    }, { embed: (this.props.type === 'courses' ? 'professors' : 'courses') });
  }

  componentWillUpdate(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.setState({ info: null }, () => {
        const client = new API();
        client.get(`/${this.props.type}/${this.props.match.params.id}`, (info) => {
          CustomSort('quarter', info.evaluations);
          this.setState({ info });
        }, { embed: (this.props.type === 'courses' ? 'professors' : 'courses') });
      });
    }
  }

  calculatePath(n) { // n in range 1-4
    // circumference r=25, 25*2*pi = 157.080
    return 157.08 - (n / 4 * 157.08);
  }

  calculateAverageColor(value) { // returns classNames that define colors of svg circles
    return value < 1.75 ? 'score1' : value < 2.5 ? 'score2' : value < 3.25 ? 'score3' : 'score4';
  }

  renderAverage(name, value, tooltipName) {
    const avgClass = this.calculateAverageColor(value);
    if (value) {
      return (
        <div styleName="avgScore">
          <div styleName="scoreTitle">
            {name}
          </div>
          <svg className={avgClass}>
            <circle cx="27" cy="27" r="25" style={{ strokeDashoffset: this.calculatePath(value) }} />
            <text x="50%" y="50%">
              {value}
            </text>
          </svg>
          {tooltipName && this.renderInfoTooltip(TextOptions[tooltipName].info)}
        </div>
      );
    }
  }

  renderInfoTooltip(info) {
    return (
      <Manager className="popper-manager">
        <Target tabIndex="0" className="popper-target">
          <i className="fa fa-question" />
        </Target>
        <Popper placement="top" className="popper tooltip-popper">
          {info}
          <Arrow className="popper__arrow" />
        </Popper>
      </Manager>
    );
  }

  render() { // 1-1.74 score1, 1.75-2.49 score2, 2.50-3.24 score3, 3.25-4 score4
    const {
      info, flagModal, deleteModal, sortValue,
    } = this.state;
    const {
      majorsList, quartersList, coursesList, professorsList, departmentsList, userInfo, type, match,
    } = this.props;
    const write_access = userInfo.permissions.includes(WRITE_EVALUATIONS);
    let average,
      courseAverage,
      professorAverage,
      attitude,
      availability,
      clarity,
      easiness,
      grading_speed,
      recommended,
      resourcefulness,
      workload;
    if (info && info.evaluations.length > 0) {
      average = professorAverage = courseAverage = attitude = availability = clarity = easiness = grading_speed = recommended = resourcefulness = workload = 0;
      const divideNum = info.evaluations.length;
      info.evaluations.map((evaluation) => {
        const { data } = evaluation;
        attitude += data.attitude;
        availability += data.availability;
        clarity += data.clarity;
        easiness += data.easiness;
        grading_speed += data.grading_speed;
        recommended += data.recommended;
        resourcefulness += data.resourcefulness;
        workload += data.workload;
        courseAverage += (data.easiness + data.workload) / 2;
        professorAverage += (data.attitude + data.availability + data.clarity + data.grading_speed + data.resourcefulness) / 5;
      });
      attitude = (attitude / divideNum).toFixed(1);
      availability = (availability / divideNum).toFixed(1);
      clarity = (clarity / divideNum).toFixed(1);
      easiness = (easiness / divideNum).toFixed(1);
      grading_speed = (grading_speed / divideNum).toFixed(1);
      recommended /= divideNum;
      resourcefulness = (resourcefulness / divideNum).toFixed(1);
      workload = (workload / divideNum).toFixed(1);
      courseAverage /= divideNum;
      professorAverage /= divideNum;
      average = (((courseAverage + professorAverage) / 2) * 0.8 + recommended * 0.2).toFixed(1);
      recommended = recommended.toFixed(1);
      courseAverage = courseAverage.toFixed(1);
      professorAverage = professorAverage.toFixed(1);
    }

    const sortOptions = [
      { value: 'quarter', label: 'Sort by Quarter' },
      { value: type === 'professors' ? 'course' : 'professor', label: `Sort by ${type === 'professors' ? 'Course' : 'Professor'}` },
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
              if (myEvalsList[i].id === deleteModal.eval_id) {
                const newList = Object.assign({}, info); // multiple shallow copies best way to handle nested state change while respecting immutable state
                const evals = info.evaluations.slice();
                evals.splice(key, 1);
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
        {info && info.evaluations.length > 0 && (
          <section styleName="scores">
            <div styleName="scoresWrapper scoresWrapperTop">
              {this.renderAverage('Course', courseAverage)}
              {this.renderAverage('Score', average)}
              {this.renderAverage('Professor', professorAverage)}
            </div>
            <div>
              <div styleName="scoresWrapper">
                <div styleName="scoreHeader">General</div>
                <div styleName="scoresGroup">
                  {this.renderAverage('Recommend?', recommended, 'recommended')}
                </div>
              </div>
              <div styleName="scoresWrapper">
                <div styleName="scoreHeader">Course</div>
                <div styleName="scoresGroup">
                  {this.renderAverage('Easiness', easiness, 'easiness')}
                  {this.renderAverage('Workload', workload, 'workload')}
                </div>
              </div>
              <div styleName="scoresWrapper">
                <div styleName="scoreHeader">Professor</div>
                <div styleName="scoresGroup">
                  {this.renderAverage('Attitude', attitude, 'attitude')}
                  {this.renderAverage('Availability', availability, 'availability')}
                  {this.renderAverage('Clarity', clarity, 'clarity')}
                  {this.renderAverage('Grading Speed', grading_speed, 'grading_speed')}
                  {this.renderAverage('Resourcefulness', resourcefulness, 'resourcefulness')}
                </div>
              </div>
            </div>
          </section>
        )}
        <div styleName="buttonGroup">
          {(write_access && info) && (
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
              isLoading={type === 'courses' ? !professorsList && !majorsList && !departmentsList : !coursesList && !majorsList && !departmentsList}
              value={sortValue}
              simpleValue
              options={sortOptions}
              placeholder="Sort"
              onChange={(newSortValue) => {
                const newInfo = Object.assign({}, info); // multiple shallow copies best way to handle nested state change while respecting immutable state
                const evals = info.evaluations.slice();
                newInfo.evaluations = evals;
                CustomSort(newSortValue, newInfo.evaluations, 'quarter');
                this.setState({ info: newInfo, sortValue: newSortValue });
                this.sortArrows.className = 'fa fa-sort';
              }}
            />
            <i
              ref={obj => this.sortArrows = obj}
              tabIndex="0"
              className="fa fa-sort"
              onClick={(e) => {
                const newInfo = Object.assign({}, info); // multiple shallow copies best way to handle nested state change while respecting immutable state
                const evals = info.evaluations.slice();
                newInfo.evaluations = evals.reverse();
                this.setState({ info: newInfo });
                if (e.target.className === 'fa fa-sort' || e.target.className === 'fa fa-sort-asc') { e.target.className = 'fa fa-sort-desc'; } else e.target.className = 'fa fa-sort-asc';
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
                authorMajors.sort((a, b) => (majorsList.object[a].name > majorsList.object[b].name ? 1 : -1));
                for (const i of authorMajors) userString += `${majorsList.object[i].name}, `;
              }
              if (userString && !evaluation.author.graduation_year) userString = userString.substring(0, userString.length - 2); // cut off last comma and space
              else if (evaluation.author && evaluation.author.graduation_year) userString += `Class of ${evaluation.author.graduation_year}`;
              return (
                <Eval
                  key={evaluation.id}
                  quarter={quartersList ? `${quartersList.object[evaluation.quarter_id].name} ${quartersList.object[evaluation.quarter_id].year}` : null}
                  vote_access={userInfo.permissions.includes(VOTE_EVALUATIONS)}
                  department={departmentsList && evaluation.course ? `${departmentsList.object[evaluation.course.department_id].abbr} ${evaluation.course.number}: ${evaluation.course.title}`
                    : null}
                  evaluation={evaluation}
                  userString={userString}
                  updateScore={(newScore) => { // score must be updated in info array so sorting works with new values (or else could just update in local state inside Eval)
                    const newInfo = Object.assign({}, info); // multiple shallow copies best way to handle nested state change while respecting immutable state
                    const evals = info.evaluations.slice();
                    newInfo.evaluations = evals;
                    newInfo.evaluations[index].votes_score = newScore;
                    this.setState({ info: newInfo });
                  }}
                  openDeleteModal={(quarter_id, secondId, eval_id) => {
                    switch (type) {
                    case 'courses':
                      this.setState({
                        deleteModal: {
                          open: true,
                          quarter_id,
                          course_id: info.id,
                          professor_id: secondId,
                          eval_id,
                        },
                      });
                      break;
                    case 'professors':
                      this.setState({
                        deleteModal: {
                          open: true,
                          quarter_id,
                          course_id: secondId,
                          professor_id: info.id,
                          eval_id,
                        },
                      });
                      break;
                    }
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
                />
              );
            })
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    departmentsList: state.departmentsList,
    majorsList: state.majorsList,
    quartersList: state.quartersList,
    coursesList: state.coursesList,
    professorsList: state.professorsList,
  };
}

export default connect(mapStateToProps, null)(ViewEvals);
