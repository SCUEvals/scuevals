import React from 'react';
import Slider from 'react-slick';
import '../styles/eval.scss';

const Eval = ({info}) => {
console.log(info);

  const settings = {
    dots: true,
    arrows: false,
    infinite: false,
    slidesToShow: 6,
    slidesToScroll: 6,
    responsive: [
      { breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      },
      { breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3
        }
      },
      { breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4
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
            <div styleName='score1'>
              1
            </div>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Attitude</div>
              <div styleName='score2'>
                2
              </div>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Availability</div>
              <div styleName='score3'>
                3
              </div>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Clarity</div>
              <div styleName='score4'>
                4
              </div>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Grading Timeliness</div>
              <div styleName='score4'>
                4
              </div>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Resourcefulness</div>
              <div styleName='score4'>
                4
              </div>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Workload</div>
              <div styleName='score4'>
                4
              </div>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Difficulty</div>
              <div styleName='score4'>
                4
              </div>
          </div>
          <div styleName='scoreBlock'>
            <div styleName='scoreTitle'>Recommend?</div>
              <div styleName='score4'>
                4
              </div>
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

export default Eval;
