import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga';
import Truncate from 'react-truncate';

import API from '../services/api';
import '../styles/eval.scss';
import calcTotalScore from '../utils/calcTotalScore';
import { evaluationPT } from '../utils/propTypes';


class Eval extends Component {
  static propTypes = {
    openDeleteModal: PropTypes.func.isRequired,
    openFlagModal: PropTypes.func,
    evaluation: evaluationPT.isRequired,
    updateScore: PropTypes.func,
    userString: PropTypes.string,
    quarter: PropTypes.string,
    department: PropTypes.string,
    lines: PropTypes.number,
    more: PropTypes.string,
    less: PropTypes.string,
    voteAccess: PropTypes.bool,
  }

  static defaultProps = {
    lines: 3, // keep at 3 unless also changing pixel heights in collapseComment and expandComment
    more: 'Show more',
    less: 'Show less',
  }

  static calculatePath(n) { // circumference = 100.53
    return 100.53 - ((n / 4) * 100.53);
  }

  static calculateAverageColor(value) { // returns classNames that define colors of svg circles
    return value < 1.75 ? 'score1'
      : value < 2.5 ? 'score2'
      : value < 3.25 ? 'score3'
      : 'score4';
  }

  static renderScore(name, value) {
    const avgClass = Eval.calculateAverageColor(value);
    let style;
    if (name === 'Score') style = { strokeDashoffset: Eval.calculatePath(value) };
    return (
      <div styleName="scoreWrapper">
        <span key="scoreTitle" styleName="scoreTitle">{name}</span>
        <svg key="score" className="score">
          <circle
            style={style}
            cx="18"
            cy="18"
            r="16"
            className={avgClass}
          />
          <text x="50%" y="50%">
            {value}
          </text>
        </svg>
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      userVote: this.props.evaluation.userVote,
      userFlagged: this.props.evaluation.userFlagged,
      expanded: false,
      truncated: false,
    };
    this.handleTruncate = this.handleTruncate.bind(this);
  }

  handleTruncate(truncated) {
    if (this.state.truncated !== truncated) this.setState({ truncated });
  }

  collapseComment(element) {
    // set height to get ready for transition
    element.style.height = `${element.getBoundingClientRect().height}px`;
    requestAnimationFrame(() => {
      element.style.height = '72px';
    });
    /* no need to add event listener to remove height after transition, won't affect anything to
       have height still in-line */
    this.setState({ expanded: false });
  }

  expandComment(element) {
    // height will change to inner content
    element.style.height = '';
    // get height of inner content
    requestAnimationFrame(() => {
      const height = element.scrollHeight;
      element.style.height = '72px';
      requestAnimationFrame(() => {
        element.style.height = `${height}px`;
      });
    });
    const resetHeight = () => {
      // after firing once, remove it to prevent duplicate event listeners
      element.removeEventListener('transitionend', resetHeight);
      // return height to initial value (allows flexible heights when readjusting browser)
      element.style.height = null;
    };
    element.addEventListener('transitionend', resetHeight);
    this.setState({ expanded: true });
  }

  render() {
    const {
      voteAccess,
      evaluation,
      openDeleteModal,
      openFlagModal,
      quarter,
      department,
      updateScore,
      userString,
      more,
      less,
      lines,
    } = this.props;
    const {
      userVote, userFlagged, expanded, truncated,
    } = this.state;
    const { votesScore } = evaluation;
    const {
      attitude,
      availability,
      clarity,
      easiness,
      grading_speed, // eslint-disable-line camelcase
      recommended,
      resourcefulness,
      workload,
    } = evaluation.data;
    const totalScore = calcTotalScore(evaluation.data);
    const settings = { // set speed = slidesToShow * 75
      dots: false,
      arrows: false,
      responsive: [
        {
          breakpoint: 576,
          settings: {
            dots: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            speed: 75,
          },
        },
        {
          breakpoint: 768,
          settings: {
            dots: true,
            slidesToShow: 2,
            slidesToScroll: 2,
            speed: 225,
          },
        },
        {
          breakpoint: 992,
          settings: {
            dots: true,
            slidesToShow: 4,
            slidesToScroll: 4,
            speed: 375,
          },
        },
        {
          breakpoint: 1200,
          settings: {
            dots: true,
            slidesToShow: 5,
            slidesToScroll: 5,
            speed: 525,
          },
        },
        {
          // anything bigger than 1200 (no way to set default behavior for unslick)
          breakpoint: 999999999,
          settings: 'unslick',
        },
      ],
    };
    const votesFontSize = votesScore > 999 ? // make score smaller to prevent overflow
      votesScore > 9999 ?
        votesScore > 99999 ?
          9
          : 11
        : 15
      : 18;
    const showBtnStyle = !truncated && !expanded ? { display: 'none' } : {};
    return (
      <div styleName="eval">
        <div styleName="vote">
          {voteAccess && evaluation.author && !evaluation.author.self && (
            <i
              role="button"
              tabIndex="0"
              styleName={userVote === 'u' ? 'active' : ''}
              className="fa fa-thumbs-up"
              onClick={userVote === 'u' ?
                () => {
                  const client = new API();
                  client.delete(
                    `/evaluations/${evaluation.id}/vote`,
                    () => ReactGA.event({ category: 'Vote', action: 'Deleted' }),
                  );
                  updateScore(votesScore - 1);
                  this.setState({
                    userVote: null,
                  });
                }
                : () => { // userVote 'd' or not voted
                  const client = new API();
                  client.put(
                    `/evaluations/${evaluation.id}/vote`, 'u',
                    () => ReactGA.event({ category: 'Vote', action: 'Added' }),
                  );
                  if (userVote === 'd') {
                    updateScore(votesScore + 2);
                    this.setState({
                      userVote: 'u',
                    });
                  } else {
                    updateScore(votesScore + 1);
                    this.setState({
                      userVote: 'u',
                    });
                  }
                }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') event.target.click();
              }}

            />
          )}
          <span style={{ fontSize: `${votesFontSize}px` }} styleName="voteScore">{votesScore}</span>
          {voteAccess && evaluation.author && !evaluation.author.self ?
            <i
              role="button"
              tabIndex="0"
              styleName={userVote === 'd' ? 'active' : ''}
              className="fa fa-thumbs-down"
              onClick={userVote === 'd' ?
                () => {
                  const client = new API();
                  client.delete(
                    `/evaluations/${evaluation.id}/vote`,
                    () => ReactGA.event({ category: 'Vote', action: 'Deleted' }),
                  );
                  updateScore(votesScore + 1);
                  this.setState({
                    userVote: null,
                  });
                }
                : () => { // userVote 1 or null
                  const client = new API();
                  client.put(
                    `/evaluations/${evaluation.id}/vote`, 'd',
                    () => ReactGA.event({ category: 'Vote', action: 'Added' }),
                  );
                  if (userVote === 'u') {
                    updateScore(votesScore - 2);
                    this.setState({
                      userVote: 'd',
                    });
                  } else {
                    updateScore(votesScore - 1);
                    this.setState({ // /userVote null
                      userVote: 'd',
                    });
                  }
                }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') event.target.click();
              }}
            />
            : ''}
        </div>
        <div styleName="evalContent">
          {evaluation.course && evaluation.professor ? // for viewing own evals on viewMyEvals
            <div styleName="evalInfo" className="row">
              <div styleName="col-sm-custom" className="col-12 col-md-2">
                {quarter}
              </div>
              <div styleName="col-sm-custom" className="col-12 col-md-5">
                <Link to={`/professors/${evaluation.professor.id}`}>{`${evaluation.professor.last_name}, ${evaluation.professor.first_name}`}</Link>
              </div>
              <div styleName="col-sm-custom" className="col-12 col-md-5">
                {department ?
                  <Link to={`/courses/${evaluation.course.id}`}>{department}</Link>
                  : ''}
              </div>
            </div>
            :
            <div styleName="evalInfo" className="row">
              <div className="col-12 col-sm-6">
                {quarter}
              </div>
              <div className="col-12 col-sm-6">
                {evaluation.course ?
                  department ?
                    <Link to={`/courses/${evaluation.course.id}`}>{department}</Link>
                    : ''
                  : <Link to={`/professors/${evaluation.professor.id}`}>{`${evaluation.professor.last_name}, ${evaluation.professor.first_name}`}</Link>}
              </div>
            </div>
          }
          <Slider {...settings}>
            <div styleName="scoreBlock totalScore">
              {Eval.renderScore('Score', totalScore)}
            </div>
            <div styleName="scoreBlock">
              {Eval.renderScore('Recommend?', recommended)}
              {Eval.renderScore('Easiness', easiness)}
            </div>
            <div styleName="scoreBlock">
              {Eval.renderScore('Workload', workload)}
              {Eval.renderScore('Attitude', attitude)}
            </div>
            <div styleName="scoreBlock">
              {Eval.renderScore('Availability', availability)}
              {Eval.renderScore('Grading Speed', grading_speed)}
            </div>
            <div styleName="scoreBlock">
              {Eval.renderScore('Clarity', clarity)}
              {Eval.renderScore('Resourcefulness', resourcefulness)}
            </div>
          </Slider>
          <div styleName="comment">
            <div styleName="commentQuote">
              <div styleName="truncate" ref={node => (this.truncate = node)}>
                <Truncate
                  lines={!expanded && lines}
                  onTruncate={this.handleTruncate}
                  ellipsis="..."
                >
                  {evaluation.data.comment}
                </Truncate>
              </div>
              {truncated && (<hr styleName="fadeBar" />)}
              {/* button has display none style if not expandable (not conditionally rendered
                  because if so, then new node created each re-render and unfocuses the button each
                  new render) */}
              <button
                style={showBtnStyle}
                styleName="showBtn"
                onClick={() => {
                  if (!expanded) this.expandComment(this.truncate);
                  else this.collapseComment(this.truncate);
                }}
              >{truncated ? more : expanded ? less : ''}
              </button>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-10" styleName="posterInfo">
                {userString}
              </div>
              <div className="col-xs-12 col-sm-2" styleName="triggerModal">
                {!evaluation.author || evaluation.author.self ?
                  <i
                    role="button"
                    className="fa fa-trash"
                    tabIndex="0"
                    onClick={() => openDeleteModal(
                      evaluation.quarter_id,
                      evaluation.professor ?
                        evaluation.professor.id
                        : evaluation.course.id,
                      evaluation.id,
                    )}
                    onKeyPress={(event) => {
                      if (event.key === 'Enter') {
                        openDeleteModal(
                          evaluation.quarter_id,
                          evaluation.professor ?
                            evaluation.professor.id
                            : evaluation.course.id,
                          evaluation.id,
                        );
                      }
                    }}
                  />
                  :
                  <i
                    role="button"
                    className="fa fa-flag"
                    styleName={userFlagged ? 'flagged' : ''}
                    tabIndex="0"
                    onClick={() => openFlagModal(
                      evaluation.data.comment,
                      evaluation.id,
                      userFlagged,
                      () => this.setState({ userFlagged: true }),
                    )}
                    onKeyPress={(event) => {
                      if (event.key === 'Enter') {
                        openFlagModal(evaluation.data.comment, null, evaluation.id);
                      }
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
