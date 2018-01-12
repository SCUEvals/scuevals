import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class About extends Component {

  static defaultProps = {
    userInfo: PropTypes.object
  }

  render() {
    return (
      <div className="content">
        <h3>
          {this.props.userInfo && !this.props.userInfo.roles.includes(0) ? '' :
            <Link className='homeBtn' to={'/'}>
              <i className="fa fa-home" />
            </Link>
          }
          About Us
        </h3>
        <p>
          While registering for classes at Santa Clara University, we often wonder
          what types of courses we're actually enrolling in. Sure, there are
          course evaluations to rummage through, but many of these questions
          didn't address what we as students want answered. That's where we come
          in. We are dedicated to serving a platform that helps SCU students make
          informed decisions about registering for classes.
        </p>
        <h6>
          We want a place where you can read and write relevant evaluations that are
          helpful for your education.
        </h6>
        <hr />
        <div className="row">
          <div className="col-sm-6">
            <button className="btn" type="button" data-toggle="collapse" data-target="#webAppDesc" aria-expanded="false" aria-controls="webAppDesc">
              Web App Info <i className="fa fa-chevron-down"></i>
              <br />
            </button>
            <div className="collapse" id="webAppDesc">
              <div className="card card-body">
                <p>
                  The web app is built from
                  Facebook's <a href="https://facebook.github.io/react/">React</a> combined
                  with <a href="http://redux.js.org">Redux</a> and Redux middleware (<a
                  href="http://redux-form.com">Redux Form</a>, <a
                  href="https://github.com/acdlite/redux-promise" >Redux Promise</a> with <a
                  href="https://github.com/mzabriskie/axios">Axios</a>). For URL navigation of the single
                  page web app, <a href="https://github.com/ReactTraining/react-router"> React
                  Router</a> is used. Because it is written with Javascript's new release ES6,
                  the web app uses <a href="https://babeljs.io">Babel</a> to translate ES6 code into
                  ES5 code for better compatibility between browsers, uses <a
                  href="https://webpack.js.org">Webpack</a> to do things like compiling SCSS and running the code through Babel
                  for transformation, and uses <a href="https://expressjs.com">Express</a> to
                  configure the server. For managing packages, <a
                  href="https://www.npmjs.com/">npm</a> is used. For design purposes and browser
                  flexibility, the web app uses a CDN for Twitter's <a
                  href="https://getbootstrap.com/">Bootstrap</a> framework. <a
                  href="http://sass-lang.com/">SCSS</a> is implemented for consistent,
                  compressed, and programmatic creation of CSS.
                </p>
                <h6>Check it out at the <a href="https://github.com/SCUEvals/scuevals"> GitHub repository.</a></h6>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <button className="btn" type="button" data-toggle="collapse" data-target="#databaseDesc" aria-expanded="false" aria-controls="databaseDesc">
              Database Info <i className="fa fa-chevron-down"></i>
              <br />
            </button>
            <div className="collapse" id="databaseDesc">
              <div className="card card-body">
                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.
              </div>
            </div>
          </div>
        </div>
        <hr />
        <h6>Like what you see? Have ideas for change?<br />
        Email us at  <a href="mailto:scuevalsteam@gmail.com">scuevalsteam@gmail.com</a> or
        check out our official <a href="https://github.com/scuevals">GitHub</a>!
        </h6>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo
  };
}

export default connect(mapStateToProps, null)(About);
