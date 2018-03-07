import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import FlagModal from '../components/flagModal';
import DeleteModal from '../components/deleteModal';
import { Manager, Target, Popper, Arrow } from 'react-popper';
import ReactGA from 'react-ga';

import TextOptions from '../components/textOptions';
import Eval from '../components/eval';
import API from '../services/api';
import '../styles/viewEvals.scss';
import { WRITE_EVALUATIONS, VOTE_EVALUATIONS } from '../index';
import RelatedInfo from '../components/relatedInfo';

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
    match: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      info: null,
      flagModal: { open: false, comment: undefined, id: undefined },
      deleteModal: { open: false, quarter_id: undefined, course_id: undefined, professor_id: undefined, eval_id: undefined },
      sortValue: null
    };
  }

  componentWillMount() {
    const client = new API();
    client.get('/' + this.props.type + '/' + this.props.match.params.id, info => {
      info.evaluations.sort((a, b) =>
        a.quarter_id > b.quarter_id ? -1 : a.quarter_id < b.quarter_id ? 1  //bigger number quarter ids assumed to be always most recent
        : a.post_time > b.post_time ? -1 : 1
      );
      this.setState({info});
    }, {embed: (this.props.type === 'courses' ? 'professors' : 'courses')});
  }

  componentWillUpdate(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.setState({info: null}, () => {
        const client = new API();
        client.get('/' + this.props.type + '/' + this.props.match.params.id, info => {
          info.evaluations.sort((a, b) =>
            a.quarter_id > b.quarter_id ? -1 : a.quarter_id < b.quarter_id ? 1
            : a.post_time > b.post_time ? -1 : 1
          );
          this.setState({info});
        });
      });
    }
  }

  calculatePath(n) { //n in range 1-4
    //circumference r=25, 25*2*pi = 157.080
    return  157.08 - (n / 4 * 157.08);
  }

  renderAverage(name, value) {
    let avgClass = value < 1.75 ? 'score1' : value < 2.5 ? 'score2' : value < 3.25 ? 'score3' : 'score4';
    if (value) {
      return (
        <div styleName='avgScore'>
          <div styleName='scoreTitle'>
            {name}
          </div>
          <svg className={avgClass}>
            <circle cx="27" cy="27" r="25" style={{strokeDashoffset: this.calculatePath(value)}} />
            <text x='50%' y='50%'>
              {value}
            </text>
          </svg>
          {name ==='Recommend?' ?
            this.renderInfoTooltip(TextOptions['recommended'].info)
            : name === 'Average' ?
             ''
            : name === 'Grading Speed' ?
              this.renderInfoTooltip(TextOptions['grading_speed'].info)
            : this.renderInfoTooltip(TextOptions[name.toLowerCase()].info)}
        </div>
      );
    }
  }

  renderInfoTooltip(info) {
    return (
      <Manager className='popper-manager'>
        <Target tabIndex='0' className='popper-target'>
        <i className='fa fa-question'/>
        </Target>
        <Popper placement="top" className="popper tooltip-popper">
          {info}
          <Arrow className="popper__arrow" />
        </Popper>
      </Manager>
    );
  }

  render() { //1-1.74 score1, 1.75-2.49 score2, 2.50-3.24 score3, 3.25-4 score4
    const { info, flagModal, deleteModal, sortValue } = this.state;
    const { majorsList, quartersList, coursesList, professorsList, departmentsList, userInfo , type, match } = this.props;
    const write_access = userInfo.permissions.includes(WRITE_EVALUATIONS);
    let average, attitude, availability, clarity, easiness, grading_speed, recommended, resourcefulness, workload;
    if (info && info.evaluations.length > 0) {
      average = attitude = availability = clarity = easiness = grading_speed = recommended = resourcefulness = workload = 0;
      const avgDivideNum = Object.values(info.evaluations[0].data).length - 1; //comment not part of average
      const divideNum = info.evaluations.length;
      info.evaluations.map(evaluation => {
        const { data } = evaluation;
        attitude += data.attitude;
        availability += data.availability;
        clarity += data.clarity;
        easiness += data.easiness;
        grading_speed += data.grading_speed;
        recommended += data.recommended;
        resourcefulness += data.resourcefulness;
        workload += data.workload;
        average += (data.attitude + data.availability + data.clarity + data.easiness + data.grading_speed + data.recommended + data.resourcefulness + data.workload) / avgDivideNum;
      });
      average = Number((average / divideNum * 10) / 10).toFixed(1);
      attitude = Number((attitude / divideNum * 10) / 10).toFixed(1);
      availability = Number((availability / divideNum * 10) / 10).toFixed(1);
      clarity = Number((clarity / divideNum * 10) / 10).toFixed(1);
      easiness = Number((easiness / divideNum * 10) / 10).toFixed(1);
      grading_speed = Number((grading_speed / divideNum * 10) / 10).toFixed(1);
      recommended = Number((recommended / divideNum * 10) / 10).toFixed(1);
      resourcefulness = Number((resourcefulness / divideNum * 10) / 10).toFixed(1);
      workload = Number((workload / divideNum * 10) / 10).toFixed(1);
    }

    let sortOptions = [
      {value: 'quarter', label: 'Sort by Quarter'},
      {value: type === 'professors' ? 'course' : 'professor', label: `Sort by ${type === 'professors' ? 'Course' : 'Professor'}`},
      {value: 'score', label: 'Sort by Score'},
      {value: 'major', label: 'Sort By Major'},
      {value: 'grad_year', label: 'Sort By Graduation Year'}
    ];
    return (
      <div className="content" styleName='viewEvals'>
        <FlagModal
          flagModalOpen={flagModal.open}
          closeFlagModal={() => this.setState({flagModal: {open: false }})}
        />
        <DeleteModal
          deleteModalOpen={deleteModal.open}
          closeDeleteModal={() => this.setState({deleteModal: {open: false}})}
          quarter={quartersList && deleteModal.quarter_id ? quartersList.object[deleteModal.quarter_id].label : null}
          course={coursesList && coursesList.departmentsListLoaded && deleteModal.course_id ? coursesList.object[deleteModal.course_id].label : null }
          professor={professorsList && deleteModal.professor_id ? professorsList.object[deleteModal.professor_id].label : null}
          deletePost={() => {
            const client = new API();
            client.delete(`/evaluations/${deleteModal.eval_id}`, () => ReactGA.event({category: 'Evaluation', action: 'Deleted'}));
            info.evaluations.map((obj, key) => {
              if (obj.id === deleteModal.eval_id) {
                let newList = Object.assign({}, info); //multiple shallow copies best way to handle nested state change while respecting immutable state
                let evals = info.evaluations.slice();
                evals.splice(key, 1);
                newList.evaluations = evals;
                this.setState({info: newList});
              }
             })
          }}
        />
        <h2>
          {info ?
            type === 'professors' ?
              info.first_name + ' ' + info.last_name
              : departmentsList ?
                departmentsList[info.department_id].abbr + ' ' + info.number + ': ' + info.title
              : 'Loading...'
            : 'Loading...'
          }
        </h2>
        {info && (info.courses || info.professors) && departmentsList && (
          <div>
            <button styleName='relatedInfoBtn' className='btn' type='button' data-toggle='collapse' data-target='#relatedInfo' aria-expanded='false' aria-controls='relatedInfo'>
              {info.courses ? 'Past courses' : 'Past professors'} <i className="fa fa-chevron-down" />
            </button>
            <div id='relatedInfo' className='collapse'>
              <RelatedInfo
                departmentsList={departmentsList}
                type={type}
                match={match}
                info={type === 'professors' ? info.courses : info.professors}
                desc={type === 'professors' ? info.first_name + ' ' + info.last_name : departmentsList[info.department_id].abbr + ' ' + info.number}
             />
           </div>
         </div>
       )}
        {info && info.evaluations.length > 0 ?
          <div className='row' styleName='scores'>
            {this.renderAverage('Average', average)}
            {this.renderAverage('Recommend?', recommended)}
            {this.renderAverage('Easiness', easiness)}
            {this.renderAverage('Workload', workload)}
            {this.renderAverage('Grading Speed', grading_speed)}
            {this.renderAverage('Clarity', clarity)}
            {this.renderAverage('Resourcefulness', resourcefulness)}
            {this.renderAverage('Attitude', attitude)}
            {this.renderAverage('Availability', availability)}
          </div>
          : ''
        }
        {write_access && (
          <Link styleName='quickPost' className='btn' to={type === 'professors' ?
            `/professors/${match.params.id}/post`
            :`/courses/${match.params.id}/post`}>
            Post Evaluation
          </Link>
        )}
        {info && info.evaluations.length > 0 ?
          <div>
            <Select
              isLoading={type === 'courses' ? !professorsList && !majorsList && !departmentsList : !coursesList && !majorsList && !departmentsList}
              value={sortValue}
              className='sort'
              simpleValue
              options={sortOptions}
              placeholder="Sort"
              onChange={sortValue => {
                let newInfo = Object.assign({}, info); //multiple shallow copies best way to handle nested state change while respecting immutable state
                let evals = info.evaluations.slice();
                newInfo.evaluations = evals;
                switch (sortValue) {
                  case 'course':
                    newInfo.evaluations.sort((a, b) => {
                      if (a.department_id === b.department_id) {
                        //nums can have letters in them too (ex. 12L), so parse integers and compare
                        let parsedANum = parseInt(a.number, 10);
                        let parsedBNum = parseInt(b.number, 10);
                        //if integers same, check for letters to decide
                        if (parsedANum === parsedBNum) return a.course.number > b.course.number ? 1
                        : a.course.number < b.course.number ? -1
                        : a.post_time > b.post_time ? -1 : 1;
                        else return parsedANum > parsedBNum ? 1 : -1;
                      }
                      else return departmentsList[a.course.department_id].abbr > departmentsList[b.course.department_id].abbr ? 1 : -1;
                    });
                    break;
                  case 'professor':
                    newInfo.evaluations.sort((a, b) =>
                      professorsList.object[a.professor.id].label > professorsList.object[b.professor.id].label ? 1
                      : professorsList.object[a.professor.id].label < professorsList.object[b.professor.id].label ? -1
                      : 0
                    );
                    break;
                  case 'score':
                    newInfo.evaluations.sort((a, b) =>
                      a.votes_score > b.votes_score ? -1
                      : a.votes_score < b.votes_score ? 1
                      : a.post_time > b.post_time ? -1 : 1
                    );
                    break;
                  case 'major':
                    newInfo.evaluations.sort((a, b) => {
                      if (!a.author.majors && !b.author.majors) return a.post_time > b.post_time ? -1 : 1;
                      else if (!a.author.majors) return 1;
                      else if (!b.author.majors) return -1;
                      else {
                        let aMajors = a.author.majors.slice();
                        let bMajors = b.author.majors.slice();
                        aMajors.sort((a, b) => {
                          return majorsList.object[a].name > majorsList.object[b].name ? 1 : -1; //alphabetically sort majors if multiple
                        });
                        bMajors.sort((a, b) => {
                          return majorsList.object[a].name > majorsList.object[b].name ? 1 : -1; //alphabetically sort majors if multiple
                        });
                        for (let i = 0; i < Math.max(aMajors.length, bMajors.length); i++) {
                          if (!aMajors[i] && !bMajors[i]) return a.post_time > b.post_time ? -1 : 1;
                          else if (!aMajors[i]) return -1;
                          else if (!bMajors[i]) return 1;
                          else if (aMajors[i] !== bMajors[i]) {
                             return majorsList.object[aMajors[i]].name > majorsList.object[bMajors[i]].name ? 1 : -1;
                          }
                        }
                      }
                    });
                    break;
                  case 'grad_year':
                    newInfo.evaluations.sort((a, b) => {
                      if (!a.author.graduation_year && !b.author.graduation_year) return a.post_time > b.post_time ? -1 : 1;
                      else if (!a.author.graduation_year) return 1;
                      else if (!b.author.graduation_year) return -1;
                      else return a.author.graduation_year > b.author.graduation_year ? -1
                      : a.author.graduation_year < b.author.graduation_year ? 1
                      : a.post_time > b.post_time ? -1 : 1;
                    });
                    break;
                  default: //will capture 'quarter' case too since sorts by quarter by default in viewEvals
                    newInfo.evaluations.sort((a, b) => {
                      return a.quarter_id > b.quarter_id ? -1 : a.quarter_id < b.quarter_id ? 1  //bigger number quarter ids assumed to be always most recent
                      : a.post_time > b.post_time ? -1 : 1;
                    });
                }
                this.setState({info: newInfo, sortValue});
                this.sortArrows.className='fa fa-sort';
              }}
            />
            <i
              ref={obj => this.sortArrows = obj}
              tabIndex='0'
              className='fa fa-sort'
              onClick={e => {
                let newInfo = Object.assign({}, info); //multiple shallow copies best way to handle nested state change while respecting immutable state
                let evals = info.evaluations.slice();
                newInfo.evaluations = evals.reverse();
                this.setState({info: newInfo});
                if (e.target.className === 'fa fa-sort' || e.target.className === 'fa fa-sort-asc')
                  e.target.className = 'fa fa-sort-desc';
                else e.target.className = 'fa fa-sort-asc';
              }}
              onKeyPress={event => {
                if (event.key === 'Enter') event.target.click();
              }}

             />
           </div>
        : ''}
        {info ?
          info.evaluations.length === 0 ?
            <h5>No evaluations posted yet.</h5>
          : info.evaluations.map((evaluation, index) => {
            let userString = '';
            if (evaluation.author && evaluation.author.majors && majorsList) {
              let authorMajors = evaluation.author.majors.slice();
              //alphabetically sort majors if multiple
              authorMajors.sort((a, b) => majorsList.object[a].name > majorsList.object[b].name ? 1 : -1);
              for (let i of authorMajors) userString += majorsList.object[i].name + ', ';
            }
            if (userString && !evaluation.author.graduation_year) userString = userString.substring(0, userString.length - 2); //cut off last comma and space
            else if (evaluation.author && evaluation.author.graduation_year) userString += 'Class of ' + evaluation.author.graduation_year;
              return (
                <Eval
                  key={evaluation.id}
                  quarter={quartersList ? quartersList.object[evaluation.quarter_id].name + ' ' + quartersList.object[evaluation.quarter_id].year : null}
                  vote_access={userInfo.permissions.includes(VOTE_EVALUATIONS)}
                  department={departmentsList && evaluation.course ? departmentsList[evaluation.course.department_id].abbr + ' ' + evaluation.course.number + ': ' + evaluation.course.title : null}
                  evaluation={evaluation}
                  userString={userString}
                  updateScore={newScore => { //score must be updated in info array so sorting works with new values (or else could just update in local state inside Eval)
                    let newInfo = Object.assign({}, info); //multiple shallow copies best way to handle nested state change while respecting immutable state
                    let evals = info.evaluations.slice();
                    newInfo.evaluations = evals;
                    newInfo.evaluations[index].votes_score = newScore;
                    this.setState({info: newInfo});
                  }}
                  openModal={(type, x, secondId, eval_id) => {
                    switch (type) {
                      case 'flag': //x = comment
                        this.setState({flagModal: {open: true, comment: x}});
                        break;
                      case 'delete': //x = quarter_id
                        switch (type) {
                          case 'courses':
                            this.setState({deleteModal: {open: true, quarter_id: x, course_id: info.id, professor_id: secondId, eval_id}})
                            break;
                          case 'professors':
                            this.setState({deleteModal: {open: true, quarter_id: x, course_id: secondId, professor_id: info.id, eval_id}});
                            break;
                        }
                        break;
                    }
                  }}
                />
              );
            })
        : ''}
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
    professorsList: state.professorsList
  };
}

export default connect(mapStateToProps, null)(ViewEvals);
