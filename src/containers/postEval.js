import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import TextareaAutoSize from 'react-textarea-autosize';
import Slider from 'rc-slider';
import { Manager, Target, Popper, Arrow } from 'react-popper';
import PropTypes from 'prop-types';

import API from '../services/api_service';

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
    <Manager className='tooltip-manager'>
      <Target className='tooltip-target'>
      <i className='fa fa-question-circle'/>
      </Target>
      <Popper placement="top" className="tooltip">
        {info}
        <Arrow className="popper__arrow"/>
      </Popper>
    </Manager>
  );
}

const handle = (props, textProps) => {
  const { value, dragging, ...restProps } = props;
  let managerStyle = {};
  managerStyle.left = props.offset + '%'; //to fix transitions with popper
  managerStyle.position = 'absolute';

  let popperStyle = {};
  if (value === 0) {
    popperStyle.opacity = '0';
  }

  return (
    <Manager style={managerStyle} className='popper-manager'>
      <Target>
        {({ targetProps }) => (
          <Handle value={value} {...restProps}>
            <div {...targetProps} className='handleNum'>
              {value !== 0 ? value : ''}
            </div>
          </Handle>
        )}
      </Target>
      <Popper style={popperStyle} placement="top" className="popper">
        {value === 0 || value === 1 ? textProps.one : value === 2 ? textProps.two : value === 3 ? textProps.three : value === 4 ? textProps.four : ''}
        <Arrow className="popper__arrow"/>
      </Popper>
    </Manager>
  );
};

class PostEval extends Component {

  static defaultProps = {
    userInfo: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = { term: '' };
  }

  onSubmit(values) {
    this.props.match.params.evaluation = values; //typically don't want to alter params, but submission redirects after post so OK. No need to make deep copy to preserve params
    let client = new API();
    client.post('/evaluations', this.props.match.params, () => this.props.history.push('/'));
  };


  renderTextArea(field) {
    return (
      <TextareaAutoSize minRows={3} {...field.input} placeholder="Write your constructive review here"/>
    )
  }

  renderSlider(props) {
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
             marginLeft: -18,
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
        <h6>Attitude {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='attitude' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Availability {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='availability' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Clarity {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='clarity' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Handwriting {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='handwriting' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.availability} component={this.renderSlider} />
        <h6>Timeliness {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='timeliness' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Workload {infoTooltip(textOptions.availability.info)}</h6>
        <Field name='workload' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Would you recommend this course with this professor? {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name='recommended' format={(value, name) => value === '' ? 0 : value} textProps={textOptions.placehold} component={this.renderSlider} />
        <h6>Comments {infoTooltip(textOptions.placehold.info)}</h6>
        <Field name="comment" onChange={e => this.setState({term: e.target.value})} component={this.renderTextArea} />
        <p>Max characters: {this.state.term.length} / 750</p>
        <br />
        <button type="submit" className="btn">Submit</button>
      </form>
    );
  }
}


export default reduxForm({
  form: 'postEval'
})
(PostEval);
