import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { postEval } from '../actions';
import TextareaAutoSize from 'react-textarea-autosize';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Handle = Slider.Handle;

const textOptions = {
  availability: {
    one: 'Always tardy',
    two: 'Often late',
    three: 'Mostly punctual',
    four: 'Always on time',
    info: 'How often was this teacher late to class?'
  },
  placehold: {
    one: 'blah',
    two: 'blah',
    three: 'blah',
    four: 'blah',
    info: 'blah'
  }
}

const infoTooltip = (info) => {
  return (
    <Tooltip
      mouseLeaveDelay={0}
      overlayClassName='infoTooltip'
      placement='top'
      trigger={['click', 'hover']}
      overlay={
        <span>{info}</span>
      }
    >
      <i className='fa fa-question-circle'/>
    </Tooltip>
  );
}

const handle = (props, textProps) => {
  const { value, dragging, ...restProps } = props;
  return (
    <Tooltip
      mouseLeaveDelay={0}
      overlay={<table className="table table-sm">
        <thead>
          <tr>
            <th>Score</th>
            <th>Criteria</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className='track1' scope="row">1</th>
            <td>{textProps.one}</td>
          </tr>
          <tr>
            <th className='track2' scope="row">2</th>
            <td>{textProps.two}</td>
          </tr>
          <tr>
            <th className='track3' scope="row">3</th>
            <td colSpan="2">{textProps.three}</td>
          </tr>
          <tr>
            <th className='track4' scope="row">4</th>
            <td colSpan="2">{textProps.four}</td>
          </tr>
        </tbody>
      </table>}
      trigger={['focus']}
      placement="top"
    >
      <Handle value={value} {...restProps} ><div className='handleNum'>{value !== 0 ? value : ''}</div></Handle>
    </Tooltip>
  );
};

class PostEval extends Component {

  componentWillMount() {
    console.log('params:', this.props.match.params);
  }

  constructor(props) {
    super(props);

    this.state = { term: '' };
  }

  onSubmit(values) {
    //values is object with searchBar: <input>
    console.log(values);
    this.props.postEval(values, () => {
      this.props.history.push('/');
    });
  }

  renderTextArea(field) {
    return (
      <TextareaAutoSize minRows={3} {...field.input} placeholder="Write your constructive review here"/>
    )
  }

  renderSlider(props) {
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    var track = $('.' + props.input.name + ' .rc-slider-track');

    if (track.length === 1) {
      track = track[0];
      if (props.input.value === 1) track.className = 'rc-slider-track track1';
      else if (props.input.value === 2) track.className = 'rc-slider-track track2';
      else if (props.input.value === 3) track.className = 'rc-slider-track track3';
      else if (props.input.value === 4) track.className = 'rc-slider-track track4';
    }
    return (
        <Slider
          id='test'
          onBeforeChange={() => $('.' + props.input.name + ' div[role="slider"]').focus()}
          className={props.input.name} //used to change track colors on changes
          name={props.input.name}
          {...props.input}
          dots
          handle={passedProps => handle(passedProps, props.textProps)}
          max={4}
          defaultValue={0}
          trackStyle={{ height: 15 }}
          handleStyle={{
             borderColor: 'black',
             height: 33,
             width: 33,
             marginLeft: -14,
             marginTop: -9.5,
             backgroundColor: 'white',
          }}
          />
    );
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))} className="content" >
        <div className='row postGuidelines'>
          <div className='col-12 col-md-6'>
            <div className='card'>
              <div className='card-header'>GUIDELINES TO FOLLOW</div>
                <div className='card-body'>
                  <ul >
                    <li>Refer to the rating chart for each question</li>
                    <li>Remove unfair bias from your review</li>
                    <li>Proofread your comments before submission</li>
                    <li>Make respectful comments</li>
                    <li>Give useful feedback that you would have liked to know before taking the class</li>
                  </ul>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-6'>
            <div className='card'>
              <div className='card-header'>THINGS TO AVOID</div>
              <div className='card-body'>
                <ul >
                  <li>Using profanity or hate speech</li>
                  <li>Speaking on behalf of others</li>
                  <li>Using personally identfiable information of yourself or other students or faculty</li>
                  <li>Share links</li>
                  <li>Share names other than the professor being rated</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <h6>Handwriting {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='handwriting' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Clarity {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='clarity' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Timeliness {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='timeliness' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Availability {infoTooltip(textOptions.availability.info)}</h6>
        <Field name='availability' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.availability} component={this.renderSlider} />
        <h6>Online Accessibility {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='online_accessibility' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Would you take this professor again? {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='retakeability' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Comments {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name="comments" onChange={e => this.setState({term: e.target.value})} component={this.renderTextArea} />
        <p>Max characters: {this.state.term.length} / 750</p>
        <br />
        <button type="submit" className="btn">Submit</button>
      </form>
    );
  }
}


export default reduxForm({
  form: 'postEval'
})(
  connect(null,{ postEval })(PostEval)
);
