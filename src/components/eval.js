import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga';
import Truncate from 'react-truncate';

import API from '../services/api';
import '../styles/eval.scss';

class Eval extends Component {

  static propTypes = {
    openDeleteModal: PropTypes.func.isRequired,
    openFlagModal: PropTypes.func.isRequired,
    evaluation: PropTypes.object.isRequired,
    updateScore: PropTypes.func,
    userString: PropTypes.string,
    quarter: PropTypes.string,
    department: PropTypes.string,
    lines: PropTypes.number.isRequired,
    more: PropTypes.string.isRequired,
    less: PropTypes.string.isRequired,
    vote_access: PropTypes.bool
  }

  static defaultProps = {
    lines: 3, //keep at 3 unless also changing pixel heights in collapseComment and expandComment
    more: 'Show more',
    less: 'Show less'
  }

  constructor(props) {
    super(props);
    this.state = {
      user_vote: this.props.evaluation.user_vote,
      user_flagged: this.props.evaluation.user_flagged,
      expanded: false,
      truncated: false
    };
    this.handleTruncate = this.handleTruncate.bind(this);
  }

  handleTruncate(truncated) {
    if (this.state.truncated !== truncated) this.setState({ truncated });
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
        <svg className='score'>
          <circle style={style} cx="18" cy="18" r="16" className={`score${value < 1.75 ? '1' : value < 2.5 ? '2' : value < 3.25 ? '3' : '4'}`}/>
          <text x='50%' y='50%'>
            {value}
          </text>
        </svg>
      </div>
    );
  }

  collapseComment(element) {
    //set height to get ready for transition
    element.style.height = element.getBoundingClientRect().height + 'px';
    requestAnimationFrame(function() {
      element.style.height = '72px';
    });
    //no need to add event listener to remove height after transition, won't affect anything to have height still in-line
    this.setState({ expanded: false});
  }

  expandComment(element) {
    // height will change to inner content
    element.style.height = '';
    // get height of inner content
    requestAnimationFrame(function() {
      let height = element.scrollHeight;
        element.style.height = '72px';
          requestAnimationFrame(function() {
            element.style.height = height + 'px';
          });
    });
    const resetHeight = () => {
      //after firing once, remove it to prevent duplicate event listeners
      element.removeEventListener('transitionend', resetHeight);
      //return height to initial value (allows flexible heights when readjusting browser)
      element.style.height = null;
    };
    element.addEventListener('transitionend', resetHeight);
    this.setState({ expanded: true });
  }

  render() {
    const { vote_access, evaluation, openDeleteModal, openFlagModal, quarter, department, updateScore, userString, more, less, lines } = this.props;
    const { user_vote, user_flagged, expanded, truncated } = this.state;
    const { votes_score } = evaluation;
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
    const votesFontSize = votes_score > 999 ? //make score smaller to prevent overflow
      votes_score > 9999 ?
        votes_score > 99999 ?
          9
        : 11
      : 15
    : 18;
    let showBtnStyle = !truncated && !expanded ? {display: 'none'} : {};
    return (
      <div styleName='eval'>
        <div styleName='vote'>
          {vote_access && evaluation.author && !evaluation.author.self && (
              <i tabIndex='0'
              styleName={user_vote === 'u' ? 'active' : ''}
              className='fa fa-thumbs-up'
              onClick={user_vote === 'u' ?
                () => {
                  const client = new API();
                  client.delete(`/evaluations/${evaluation.id}/vote`, () => ReactGA.event({category: 'Vote', action: 'Deleted'}));
                  updateScore(votes_score - 1);
                  this.setState({
                     user_vote: null
                   });
                }
                : () => { //user_vote 'd' or not voted
                  const client = new API();
                  client.put(`/evaluations/${evaluation.id}/vote`, 'u',  () => ReactGA.event({category: 'Vote', action: 'Added'}));
                  if (user_vote == 'd') {
                    updateScore(votes_score + 2);
                    this.setState({
                       user_vote: 'u'
                    });
                  }
                  else {
                    updateScore(votes_score + 1);
                    this.setState({
                      user_vote: 'u'
                    });
                  }
                }}
                onKeyPress={event => {
                  if (event.key === 'Enter') event.target.click();
                }}

            />
          )}
          <span style={{fontSize: votesFontSize + 'px'}} styleName='voteScore'>{votes_score}</span>
          {vote_access && evaluation.author && !evaluation.author.self ?
            <i tabIndex='0'
              styleName={user_vote === 'd' ? 'active' : ''}
               className='fa fa-thumbs-down'
               onClick={user_vote === 'd' ?
                 () => {
                   const client = new API();
                   client.delete(`/evaluations/${evaluation.id}/vote`, () => ReactGA.event({category: 'Vote', action: 'Deleted'}));
                   updateScore(votes_score + 1);
                   this.setState({
                     user_vote: null
                   });
                 }
                 : () => { //user_vote 1 or null
                   const client = new API();
                   client.put(`/evaluations/${evaluation.id}/vote`, 'd', () =>  ReactGA.event({category: 'Vote', action: 'Added'}));
                   if (user_vote === 'u') {
                     updateScore(votes_score - 2);
                     this.setState({
                       user_vote: 'd'
                     });
                    }
                    else {
                      updateScore(votes_score - 1);
                      this.setState({ ///user_vote null
                        user_vote: 'd'
                      });
                    }
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
                {quarter}
              </div>
              <div styleName='col-sm-custom' className='col-12 col-md-5'>
                <Link to={`/professors/${evaluation.professor.id}`}>{evaluation.professor.last_name + ', ' + evaluation.professor.first_name}</Link>
              </div>
              <div styleName='col-sm-custom' className='col-12 col-md-5'>
                {department ?
                  <Link to={`/courses/${evaluation.course.id}`}>{department}</Link>
                : ''}
              </div>
            </div>
            :
            <div styleName='evalInfo' className='row'>
              <div className='col-12 col-sm-6'>
                {quarter}
              </div>
              <div className='col-12 col-sm-6'>
                {evaluation.course ?
                  department ?
                  <Link to={`/courses/${evaluation.course.id}`}>{department}</Link>
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
              <div styleName='truncate' ref={node => this.truncate = node}>
                <Truncate
                    lines={!expanded && lines}
                    onTruncate={this.handleTruncate}
                    ellipsis={'...'}
                >
                    {evaluation.data.comment}
                </Truncate>
              </div>
              {truncated && (<hr styleName='fadeBar' />)}
              {/* button has display none style if not expandable (not conditionally rendered because if so, then new node created each re-render and unfocuses the button each new render) */}
                <button
                   style={showBtnStyle}
                   styleName='showBtn'
                   onClick={() => {
                     if (!expanded) this.expandComment(this.truncate);
                     else this.collapseComment(this.truncate);
                   }}
                >{truncated ? more : expanded ? less : ''}</button>
            </div>
            <div className='row'>
              <div className='col-xs-12 col-sm-10' styleName='posterInfo'>
                {userString}
              </div>
              <div className='col-xs-12 col-sm-2' styleName='triggerModal'>
                {!evaluation.author || evaluation.author.self ?
                  <i className='fa fa-trash'
                    tabIndex='0'
                    onClick={() => openDeleteModal(evaluation.quarter_id, evaluation.professor ? evaluation.professor.id : evaluation.course.id, evaluation.id)}
                    onKeyPress={event => {
                      if (event.key === 'Enter') openDeleteModal(evaluation.quarter_id, evaluation.professor ? evaluation.professor.id : evaluation.course.id, evaluation.id);
                    }}
                  />
                  :
                  <i className='fa fa-flag'
                    styleName={user_flagged ? 'flagged' : ''}
                    tabIndex='0'
                    onClick={() => openFlagModal(evaluation.data.comment, evaluation.id, user_flagged, () => this.setState({user_flagged: true}))}
                    onKeyPress={event => {
                      if (event.key === 'Enter') openFlagModal(evaluation.data.comment, null, evaluation.id);
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
