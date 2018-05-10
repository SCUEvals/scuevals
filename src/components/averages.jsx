import React, { Component } from 'react';
import { Manager, Target, Popper, Arrow } from 'react-popper';
import PropTypes from 'prop-types';

import TextOptions from '../components/textOptions';
import '../styles/averages.scss';
import { evaluationPT } from '../utils/propTypes';

class Averages extends Component {
  static propTypes = {
    evaluations: PropTypes.arrayOf(evaluationPT),
  }

  static renderInfoTooltip(info) {
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

  static calculatePath(n) { // circumference = 100.53
    return 100.53 - ((n / 4) * 100.53);
  }

  static calculateAverageColor(value) { // returns classNames that define colors of svg circles
    return value < 1.75 ? 'score1'
      : value < 2.5 ? 'score2'
      : value < 3.25 ? 'score3'
      : 'score4';
  }

  static renderAverage(name, value, tooltipName) {
    const avgClass = Averages.calculateAverageColor(value);
    return (
      <div styleName="avgScore">
        <div styleName="scoreTitle">
          {name}
        </div>
        <svg className={`score ${avgClass}`}>
          <circle
            cx="18"
            cy="18"
            r="16"
            style={{ strokeDashoffset: Averages.calculatePath(value) }}
          />
          <text x="50%" y="50%">
            {value}
          </text>
        </svg>
        {tooltipName && Averages.renderInfoTooltip(TextOptions[tooltipName].info)}
      </div>
    );
  }

  render() {
    const { evaluations } = this.props;
    if (evaluations && evaluations.length > 0) {
      /* eslint-disable camelcase */ // grading_speed
      let average = 0;
      let courseAverage = 0;
      let professorAverage = 0;
      let attitude = 0;
      let availability = 0;
      let clarity = 0;
      let easiness = 0;
      let grading_speed = 0;
      let recommended = 0;
      let resourcefulness = 0;
      let workload = 0;
      const divideNum = evaluations.length;
      evaluations.forEach((evaluation) => {
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
        professorAverage += (
          data.attitude
          + data.availability
          + data.clarity
          + data.grading_speed
          + data.resourcefulness
        ) / 5;
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
      average = ((((courseAverage + professorAverage) / 2) * 0.8) + (recommended * 0.2)).toFixed(1);
      recommended = recommended.toFixed(1);
      courseAverage = courseAverage.toFixed(1);
      professorAverage = professorAverage.toFixed(1);

      return (
        <section styleName="averages">
          <div styleName="scoresWrapper scoresWrapperTop">
            {Averages.renderAverage('Course', courseAverage)}
            {Averages.renderAverage('Score', average)}
            {Averages.renderAverage('Professor', professorAverage)}
          </div>
          <div>
            <div styleName="scoresWrapper">
              <div styleName="scoreHeader">General</div>
              <div styleName="scoresGroup">
                {Averages.renderAverage('Recommend?', recommended, 'recommended')}
              </div>
            </div>
            <div styleName="scoresWrapper">
              <div styleName="scoreHeader">Course</div>
              <div styleName="scoresGroup">
                {Averages.renderAverage('Easiness', easiness, 'easiness')}
                {Averages.renderAverage('Workload', workload, 'workload')}
              </div>
            </div>
            <div styleName="scoresWrapper">
              <div styleName="scoreHeader">Professor</div>
              <div styleName="scoresGroup">
                {Averages.renderAverage('Attitude', attitude, 'attitude')}
                {Averages.renderAverage('Availability', availability, 'availability')}
                {Averages.renderAverage('Clarity', clarity, 'clarity')}
                {Averages.renderAverage('Grading Speed', grading_speed, 'grading_speed')}
                {Averages.renderAverage('Resourcefulness', resourcefulness, 'resourcefulness')}
              </div>
            </div>
          </div>
        </section>
      );
      /* eslint-enable camelcase */
    }
    return null;
  }
}

export default Averages;
