import React, { Component } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import API from '../services/api';
import '../styles/eval.scss';

class Eval extends Component {

  static defaultProps = {
    evaluation: PropTypes.obj
  }

  constructor(props) {
    super(props);
    this.state = {
      votes_score: this.props.evaluation.votes_score,
      user_vote: this.props.evaluation.user_vote
    };
  }

  calculatePath(n) { //circumference = 100.53
    return  100.53 - (n / 4 * 100.53);
  }

  renderScore(name, value) {
    let style;
    if (name === 'Average') style = {strokeDashoffset: this.calculatePath(value)};
    return (
      <div styleName='scoreBlock'>
        <div styleName='scoreTitle'>{name}</div>
        <svg>
          <circle style={style} cx="18" cy="18" r="16" styleName={`score${value < 1.75 ? '1' : value < 2.5 ? '2' : value < 3.25 ? '3' : '4'}`}/>
          <text x='50%' y='50%'>
            {value}
          </text>
        </svg>
      </div>
    );
  }

  render() {
    const { evaluation, openModal, majorsList, quartersList, departmentsList } = this.props;
    const { votes_score, user_vote } = this.state;
    const { attitude, availability, clarity, easiness, grading_speed, recommended, resourcefulness, workload } = evaluation.data;
    const average =  Number((attitude + availability + clarity + easiness + grading_speed + recommended + resourcefulness + workload) / (Object.values(evaluation.data).length - 1)).toFixed(1); //-1 for comments
    const settings = { //set speed = slidesToShow * 75
      dots: false,
      arrows: false,
      responsive: [
        { breakpoint: 576,
          settings: {
            dots: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            speed: 75
          }
        },
        { breakpoint: 768,
          settings: {
            dots: true,
            slidesToShow: 3,
            slidesToScroll: 3,
            speed: 225
          }
        },
        { breakpoint: 992,
          settings: {
            dots: true,
            slidesToShow: 5,
            slidesToScroll: 5,
            speed: 375
          }
        },
        { breakpoint: 1200,
          settings: {
            dots: true,
            slidesToShow: 7,
            slidesToScroll: 7,
            speed: 525
          }
        },
        { breakpoint: 999999999, //anything bigger than 1200 (no way to set default behavior for unslick)
          settings: 'unslick'
        }
      ]
    };
    let votesFontSize = votes_score > 999 ? //make score smaller to prevent overflow
      votes_score > 9999 ?
        votes_score > 99999 ?
          9
        : 11
      : 15
    : 18;
    let userString = '';
    if (evaluation.author && evaluation.author.majors && majorsList) {
       for (let i of evaluation.author.majors) userString += majorsList.object[i].name + ', ';
       if (userString && !evaluation.author.graduation_year) userString = userString.substring(0, userString.length - 2); //cut off last comma and space
       else userString += 'Class of ' + evaluation.author.graduation_year;
    }
    else if (evaluation.author && evaluation.author.graduation_year) userString = 'Class of ' + evaluation.author.graduation_year;
    return (
      <div styleName='eval'>
        <div styleName='vote'>
          {evaluation.author && !evaluation.author.self ?
              <i tabIndex='0'
              styleName={user_vote == 1 ? 'active' : ''}
              className='fa fa-thumbs-up'
              onClick={user_vote == 1 ?
                e => {
                  let client = new API();
                  client.delete(`/evaluations/${evaluation.id}/vote`, ReactGA.event({category: 'Vote', action: 'Deleted'}));
                  this.setState({
                    votes_score: votes_score - 1,
                    user_vote: null
                  });
                }
                : e => {
                  let client = new API();
                  client.put(`/evaluations/${evaluation.id}/vote`, 'u',  ReactGA.event({category: 'Vote', action: 'Added'}));
                  user_vote == -1 ?
                  this.setState({
                    votes_score: votes_score + 2,
                    user_vote: 1
                  })
                   : this.setState({
                     votes_score: votes_score + 1,
                     user_vote: 1
                   })
                }}
                onKeyPress={event => {
                  if (event.key === 'Enter') event.target.click();
                }}

            />
          : ''}
          <span style={{fontSize: votesFontSize + 'px'}} styleName='voteScore'>{votes_score}</span>
          {evaluation.author && !evaluation.author.self ?
            <i tabIndex='0'
              styleName={user_vote == -1 ? 'active' : ''}
               className='fa fa-thumbs-down'
               onClick={user_vote == -1 ?
                 e => {
                   let client = new API();
                   client.delete(`/evaluations/${evaluation.id}/vote`,  ReactGA.event({category: 'Vote', action: 'Deleted'}));
                   this.setState({
                     votes_score: votes_score + 1,
                     user_vote: null
                   });
                 }
                 : e => { //user_vote 1 or null
                   let client = new API();
                   client.put(`/evaluations/${evaluation.id}/vote`, 'd',  ReactGA.event({category: 'Vote', action: 'Added'}));
                   user_vote == 1 ?
                    this.setState({
                      votes_score: votes_score - 2,
                      user_vote: -1
                    })
                    : this.setState({ ///user_vote null
                      votes_score: votes_score - 1,
                      user_vote: -1
                    })
                 }}
                 onKeyPress={event => {
                   if (event.key === 'Enter') event.target.click();
                 }}
            />
          : ''}
        </div>
        <div styleName='evalContent'>
          {evaluation.course && evaluation.professor ? //for viewing own evals on viewMyEvals, both sent
            <div styleName='evalInfo' className='row'>
              <div styleName='col-sm-custom' className='col-12 col-md-2'>
                {quartersList ? quartersList.object[evaluation.quarter_id].name + ' ' + quartersList.object[evaluation.quarter_id].year : ''}
              </div>
              <div styleName='col-sm-custom' className='col-12 col-md-5'>
                <Link to={`/professors/${evaluation.professor.id}`}>{evaluation.professor.last_name + ', ' + evaluation.professor.first_name}</Link>
              </div>
              <div styleName='col-sm-custom' className='col-12 col-md-5'>
                {departmentsList ?
                  <Link to={`/courses/${evaluation.course.id}`}>{departmentsList[evaluation.course.department_id].abbr + ' ' + evaluation.course.number + ': ' + evaluation.course.title}</Link>
                : ''}
              </div>
            </div>
            :
            <div styleName='evalInfo' className='row'>
              <div className='col-12 col-sm-6'>
                {quartersList ? quartersList.object[evaluation.quarter_id].name + ' ' + quartersList.object[evaluation.quarter_id].year : ''}
              </div>
              <div className='col-12 col-sm-6'>
                {evaluation.course ?
                  departmentsList ?
                  <Link to={`/courses/${evaluation.course.id}`}>{departmentsList[evaluation.course.department_id].abbr + ' ' + evaluation.course.number + ': ' + evaluation.course.title}</Link>
                  : ''
                : <Link to={`/professors/${evaluation.professor.id}`}>{evaluation.professor.last_name + ', ' + evaluation.professor.first_name}</Link>}
              </div>
          </div>
          }
          <Slider {...settings}>
            {this.renderScore('Average', average)}
            {this.renderScore('Recommend?', recommended)}
            {this.renderScore('Easiness', easiness)}
            {this.renderScore('Workload', workload)}
            {this.renderScore('Grading Speed', grading_speed)}
            {this.renderScore('Clarity', clarity)}
            {this.renderScore('Resourcefulness', resourcefulness)}
            {this.renderScore('Attitude', attitude)}
            {this.renderScore('Availability', availability)}
          </Slider>
          <div styleName='comment'>
            <div styleName='commentQuote'>
              {evaluation.data.comment}
            </div>
            <div className='row'>
              <div className='col-xs-12 col-sm-11' styleName='posterInfo'>
                {userString}
              </div>
              <div className='col-xs-12 col-sm-1' styleName='triggerModal'>
                {!evaluation.author || evaluation.author.self ?
                  <i className='fa fa-trash'
                    tabIndex='0'
                    onClick={() => openModal('delete', evaluation.quarter_id, evaluation.professor ? evaluation.professor.id : evaluation.course.id, evaluation.id)}
                    onKeyPress={event => {
                      if (event.key === 'Enter') openModal('delete', evaluation.quarter_id, evaluation.professor ? evaluation.professor.id : evaluation.course.id, evaluation.id);
                    }}
                  />
                  :
                  <i className='fa fa-flag'
                    tabIndex='0'
                    onClick={() => openModal('flag', evaluation.data.comment, evaluation.id)}
                    onKeyPress={event => {
                      if (event.key === 'Enter') openModal('flag', evaluation.data.comment, evaluation.id);
                    }}
                   />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Eval;
