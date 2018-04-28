import React, { Component } from 'react';
import { Manager, Target, Popper, Arrow } from 'react-popper';

import TextOptions from '../components/textOptions';
import '../styles/averages.scss';

class Averages extends Component {

  renderAverage(name, value, tooltipName) {
    const avgClass = this.calculateAverageColor(value);
    return (
      <div styleName="avgScore">
        <div styleName="scoreTitle">
          {name}
        </div>
        <svg className={`score ${avgClass}`}>
          <circle cx="18" cy="18" r="16" style={{ strokeDashoffset: this.calculatePath(value)}} />
          <text x="50%" y="50%">
            {value}
          </text>
        </svg>
        {tooltipName && this.renderInfoTooltip(TextOptions[tooltipName].info)}
      </div>
    );
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

  calculatePath(n) { // circumference = 100.53
    return 100.53 - (n / 4 * 100.53);
  }

  calculateAverageColor(value) { // returns classNames that define colors of svg circles
    return value < 1.75 ? 'score1'
      : value < 2.5 ? 'score2'
      : value < 3.25 ? 'score3'
      : 'score4';
  }

  render() {
    const { evaluations } = this.props;
    if (evaluations && evaluations.length > 0) {
      let average = 0,
        courseAverage = 0,
        professorAverage = 0,
        attitude = 0,
        availability = 0,
        clarity = 0,
        easiness = 0,
        grading_speed = 0,
        recommended = 0,
        resourcefulness = 0,
        workload = 0;
        const divideNum = evaluations.length;
        evaluations.map((evaluation) => {
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

      return (
        <section styleName="averages">
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
      );
    }
    else return null;
  }
}

export default Averages;
