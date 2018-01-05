import React from 'react';
import Slider from 'react-slick';
import PropTypes from 'prop-types';

import '../styles/eval.scss';

const Eval = ({ info }) => {
console.log('info:', info);
  const settings = { //set speed = slidesToShow * 75
    dots: true,
    arrows: false,
    slidesToShow: 6,
    slidesToScroll: 6,
    touchThreshold: 10, //more sensitive to move with click or touch
    speed: 450,
    responsive: [
      { breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          speed: 75
        }
      },
      { breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          speed: 225
        }
      },
      { breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          speed: 300
        }
      },
    ]
  };

  return (
    <div styleName='eval'>
      <div styleName='vote'>
        <i styleName='active' tabIndex='0' className='fa fa-caret-up' />
        <i tabIndex='0' className='fa fa-caret-down' />
      </div>
      <div styleName='evalContent'>
        <div styleName='evalInfo' className='row'>
          <div className='col-12 col-sm-6'>
            Fall 2017
          </div>
          <div className='col-12 col-sm-6'>
            {info ?
              info.first_name ?
                info.first_name + ' ' + info.last_name
              : info.department.abbreviation + ' ' + info.name + ': ' + info.title
            : ''}
          </div>
        </div>
        <Slider {...settings}>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Average</div>
            <svg styleName='score1'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                1
              </text>
            </svg>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Attitude</div>
            <svg styleName='score2'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                2
              </text>
            </svg>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Availability</div>
            <svg styleName='score3'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                3
              </text>
            </svg>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Clarity</div>
            <svg styleName='score4'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                4
              </text>
            </svg>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Grading Timeliness</div>
            <svg styleName='score4'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                4
              </text>
            </svg>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Resourcefulness</div>
            <svg styleName='score4'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                4
              </text>
            </svg>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Workload</div>
            <svg styleName='score4'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                4
              </text>
            </svg>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Difficulty</div>
            <svg styleName='score4'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                4
              </text>
            </svg>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Recommend?</div>
            <svg styleName='score4'>
              <circle cx="18" cy="18" r="16" />
              <text x='50%' y='50%'>
                4
              </text>
            </svg>
          </div>
        </Slider>
        <div styleName='comment'>
          <div styleName='commentQuote'>
            "Great teacher"
          </div>
          <div>
            Major:
            Gender:
            Year:
          </div>
          <div styleName='commentReport'>
            Report post
          </div>
        </div>
      </div>
    </div>
  );
}

Eval.propTypes = {
  info: PropTypes.obj
}

export default Eval;
