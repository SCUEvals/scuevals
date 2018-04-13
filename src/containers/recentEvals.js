import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import API from '../services/api';
import '../styles/recentEvals.scss';

class RecentEvals extends Component {

  constructor(props) {
    super(props);
    this.state = {
      evals: undefined
    }
  }

  static propTypes = {
    quartersList: PropTypes.object,
    coursesList: PropTypes.object,
    departmentsList: PropTypes.object,
    professorsList: PropTypes.object,
    count: PropTypes.number.isRequired
  }

  componentDidMount() {
    const client = new API();
    client.get('/evaluations/recent', evals => {if (this.recentEvals) this.setState({evals})}, {count: this.props.count});
  }


  calculatePath(n) { //circumference = 100.53
    return  100.53 - (n / 4 * 100.53);
  }

  render() {
    const { evals } = this.state;
    const { quartersList, coursesList, professorsList, departmentsList, count } = this.props;
    if (evals && quartersList && coursesList && coursesList.departmentsListLoaded && professorsList) return (
      <div styleName='recentEvals'>
        <h5>{count} Most Recent Evaluations</h5>
        <div className='widgetWrapper'>
          <div className='widget'>
            <small className='offset-10'>Scale is 1-4</small>
            <ul className='list-group'>
              {evals.map(evaluation => {
                const {attitude, availability, clarity, easiness, grading_speed, recommended, resourcefulness, workload } = evaluation.data;
                const totalScore =  (((attitude + availability + clarity + grading_speed + resourcefulness) / 5 + (easiness + workload) / 2) / 2 * 0.8 + recommended * .2).toFixed(1);
                let totalScoreStyle={strokeDashoffset: this.calculatePath(totalScore)};
                  return (
                    <li key={evaluation.id} className='list-group-item d-flex justify-content-between align-items-center'>
                      <div  className='flex col-2'>
                        {quartersList.object[evaluation.quarter_id].label}
                      </div>
                      <div className='flex col-4'>
                        <Link to={`/courses/${evaluation.course.id}`} >{departmentsList[coursesList.object[evaluation.course.id].department_id].abbr + ' ' + coursesList.object[evaluation.course.id].number}</Link>
                      </div>
                      <div className='flex col-4'>
                        <Link to={`/professors/${evaluation.professor.id}`} >{professorsList.object[evaluation.professor.id].label}</Link>
                      </div>
                      <div className='flex col-2'>
                        <svg className='score'>
                          <circle style={totalScoreStyle} cx='18' cy='18' r='16' className={`score${totalScore < 1.75 ? '1' : totalScore < 2.5 ? '2' : totalScore < 3.25 ? '3' : '4'}`}/>
                          <text x='50%' y='50%'>
                            {totalScore}
                          </text>
                        </svg>
                      </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
    else return (
      <h5 ref={node => this.recentEvals = node} styleName='recentEvals'>Loading Most Recent Evaluations...</h5>
    );
  }
}


function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    quartersList: state.quartersList,
    coursesList: state.coursesList,
    professorsList: state.professorsList,
    departmentsList: state.departmentsList
  };
}

export default connect(mapStateToProps, null)(RecentEvals);
