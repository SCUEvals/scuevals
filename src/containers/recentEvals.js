import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

import API from '../services/api';
import '../styles/recentEvals.scss';

class RecentEvals extends Component {

  constructor(props) {
    super(props);
    this.state = {
      evals: undefined
    }
  }

  componentDidMount() {
    let client = new API();
    client.get('/evaluations/recent', evals => this.setState({evals}), {count: 5});
  }

  calculatePath(n) { //circumference = 100.53
    return  100.53 - (n / 4 * 100.53);
  }

  render() {
    const { evals } = this.state;
    const { quartersList, coursesList, professorsList, departmentsList } = this.props;
    if (evals && quartersList && coursesList && coursesList.departmentsListLoaded && professorsList) return (
      <div styleName='recentEvals'>
      <h5>Most Recent Evaluations</h5>
      <div style={{overflow: 'auto'}}>
        <div styleName='widthStyle'>
          <small className='offset-10'>Scale is 1-4</small>
        </div>
        <ul styleName='widthStyle' className="list-group">
          {evals.map(evaluation => {
            const {attitude, availability, clarity, easiness, grading_speed, recommended, resourcefulness, workload } = evaluation.data;
            const average =  Number((attitude + availability + clarity + easiness + grading_speed + recommended + resourcefulness + workload) / (Object.values(evaluation.data).length - 1)).toFixed(1); //-1 for comments
            let avgStyle={strokeDashoffset: this.calculatePath(average)};
              return (
                <li key={evaluation.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div  className='flex col-2'>
                    {quartersList.object[evaluation.quarter_id].label }
                  </div>
                  <div className='flex col-4'>
                    <Link to={`/courses/${evaluation.course.id}`} >{departmentsList[coursesList.object[evaluation.course.id].department_id].abbr + ' ' + coursesList.object[evaluation.course.id].number}</Link>
                  </div>
                  <div className='flex col-4'>
                    <Link to={`/professors/${evaluation.professor.id}`} >{professorsList.object[evaluation.professor.id].label}</Link>
                  </div>
                  <div className='flex col-2'>
                    <svg className='score'>
                      <circle style={avgStyle} cx="18" cy="18" r="16" className={`score${average < 1.75 ? '1' : average < 2.5 ? '2' : average < 3.25 ? '3' : '4'}`}/>
                      <text x='50%' y='50%'>
                        {average}
                      </text>
                    </svg>
                  </div>
              </li>
            );
            })}
        </ul>
    </div>
  </div>
    );
    else return (
      <h5 styleName='recentEvals'>Loading Most Recent Evaluations...</h5>
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
