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

  render() {
    const { evaluation, openModal, majorsList, quartersList, departmentsList } = this.props;
    const { votes_score, user_vote } = this.state;
    const { attitude, availability, clarity, difficulty, grading_speed, recommended, resourcefulness, workload } = evaluation.data;
    const average = (attitude + availability + clarity + difficulty + grading_speed + recommended + resourcefulness + workload) / (Object.values(evaluation.data).length - 1); //-1 for comments
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
    let majorsString = '';
    if (evaluation.author && evaluation.author.majors && majorsList) {
       for (let i of evaluation.author.majors) majorsString += majorsList.object[i].name + ', ';
       if (majorsString) majorsString = majorsString.substring(0, majorsString.length - 2); //cut off last comma and space
    };
    return (
      <div styleName='eval'>
        <div styleName='vote'>
          {evaluation.author && !evaluation.author.self ?
              <i tabIndex='0'
              ref={node => this.upVote = node}
              styleName={user_vote == 1 ? 'active' : ''}
              className='fa fa-caret-up'
              onClick={user_vote == 1 ?
                e => {
                  let client = new API();
                  client.delete(`/evaluations/${evaluation.id}/vote`);
                  this.setState({
                    votes_score: votes_score - 1,
                    user_vote: null
                  });
                }
                : e => {
                  let client = new API();
                  client.put(`/evaluations/${evaluation.id}/vote`, 'u');
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
                  if (event.key === 'Enter') upVote.click();
                }}
            />
          : ''}
          <span style={{fontSize: votesFontSize + 'px'}} styleName='voteScore'>{votes_score}</span>
          {evaluation.author && !evaluation.author.self ?
            <i tabIndex='0'
              ref={node => this.downVote = node}
              styleName={user_vote == -1 ? 'active' : ''}
               className='fa fa-caret-down'
               onClick={user_vote == -1 ?
                 e => {
                   let client = new API();
                   client.delete(`/evaluations/${evaluation.id}/vote`);
                   this.setState({
                     votes_score: votes_score + 1,
                     user_vote: null
                   });
                 }
                 : e => { //user_vote 1 or null
                   let client = new API();
                   client.put(`/evaluations/${evaluation.id}/vote`, 'd');
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
                   if (event.key === 'Enter') downVote.click();
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
            <div styleName='scoreBlock'>
              <div styleName='scoreTitle'>Average</div>
              <svg>
                <circle cx="18" cy="18" r="16" />
                <text x='50%' y='50%'>
                  {average}
                </text>
              </svg>
            </div>
            <div styleName='scoreBlock'>
              <div styleName='scoreTitle'>Recommend?</div>
              <svg>
                <circle cx="18" cy="18" r="16" styleName={`score${evaluation.data.recommended}`}/>
                <text x='50%' y='50%'>
                  {evaluation.data.recommended}
                </text>
              </svg>
            </div>
            <div styleName='scoreBlock'>
              <div styleName='scoreTitle'>Difficulty</div>
              <svg>
                <circle cx="18" cy="18" r="16" styleName={`score${evaluation.data.difficulty}`}/>
                <text x='50%' y='50%'>
                  {evaluation.data.difficulty}
                </text>
              </svg>
            </div>
            <div styleName='scoreBlock'>
              <div styleName='scoreTitle'>Workload</div>
              <svg>
                <circle cx="18" cy="18" r="16" styleName={`score${evaluation.data.workload}`}/>
                <text x='50%' y='50%'>
                  {evaluation.data.workload}
                </text>
              </svg>
            </div>
            <div styleName='scoreBlock'>
              <div styleName='scoreTitle'>Grading Speed</div>
              <svg>
                <circle cx="18" cy="18" r="16" styleName={`score${evaluation.data.grading_speed}`}/>
                <text x='50%' y='50%'>
                  {evaluation.data.grading_speed}
                </text>
              </svg>
            </div>
            <div styleName='scoreBlock'>
              <div styleName='scoreTitle'>Clarity</div>
              <svg>
                <circle cx="18" cy="18" r="16" styleName={`score${evaluation.data.clarity}`}/>
                <text x='50%' y='50%'>
                  {evaluation.data.clarity}
                </text>
              </svg>
            </div>
            <div styleName='scoreBlock'>
              <div styleName='scoreTitle'>Resourcefulness</div>
              <svg>
                <circle cx="18" cy="18" r="16" styleName={`score${evaluation.data.resourcefulness}`}/>
                <text x='50%' y='50%'>
                  {evaluation.data.resourcefulness}
                </text>
              </svg>
            </div>
            <div styleName='scoreBlock'>
              <div styleName='scoreTitle'>Attitude</div>
              <svg>
                <circle cx="18" cy="18" r="16" styleName={`score${evaluation.data.attitude}`}/>
                <text x='50%' y='50%'>
                  {evaluation.data.attitude}
                </text>
              </svg>
            </div>
            <div styleName='scoreBlock'>
              <div styleName='scoreTitle'>Availability</div>
              <svg>
                <circle cx="18" cy="18" r="16" styleName={`score${evaluation.data.availability}`}/>
                <text x='50%' y='50%'>
                  {evaluation.data.availability}
                </text>
              </svg>
            </div>
          </Slider>
          <div styleName='comment'>
            <div styleName='commentQuote'>
              "{evaluation.data.comment}"
            </div>
            <div className='row'>
              <div className='col-xs-12 col-sm-11' styleName='commentInfo'>
                {evaluation.author && evaluation.author.majors && majorsList ?
                  <div>
                    {evaluation.author && evaluation.author.majors.length > 1 ?
                       'Majors: ' + majorsString
                       : 'Major: ' + majorsString
                     }
                  </div>
                  : ''
                }
                {evaluation.author && evaluation.author.graduation_year ?
                  <div>
                    Graduation year: {evaluation.author.graduation_year}
                  </div>
                : ''
                }
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
