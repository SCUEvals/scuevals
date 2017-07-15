import React from 'react';
import { Link } from 'react-router-dom';
const About = () => {

  return (
    <div className="container">
      <div className="content">
        <div className="card">
          <h3 className="card-header">
            About Us
            <Link to={'/'}><i className="fa fa-window-close btn closeBtn"></i></Link>
          </h3>
          <div className="card-block">
            <p>
              While attending Santa Clara University, we noticed that class evaluations just
              weren't very helpful. That's where we come in. We are dedicated to serving a
              platform that helps SCU students make informed decisions about registering for
              classes.
            </p>
            <h6>We want a place where you can read and write relevant evaluations that are helpful for your education.</h6>
            <hr />
            <div className="row">
              <div className="col-sm-6">
                  <button className="btn" type="button" data-toggle="collapse" data-target="#clientSideDesc" aria-expanded="false" aria-controls="clientSideDesc">
                    Web App Info <i className="fa fa-chevron-down"></i><br />
                    <small>Joseph Théberge</small>
                  </button>
                <div className="collapse" id="clientSideDesc">
                  <div className="card card-block">
                    <p>
                      Developed by Joseph Théberge, SCU's class of 2018, the web app is built from
                      Facebook's <a href="https://facebook.github.io/react/">React</a>, combined
                      with <a href="http://redux.js.org">Redux</a> and Redux middleware (<a
                      href="http://redux-form.com">Redux Form</a>, <a
                      href="https://github.com/acdlite/redux-promise" >Redux Promise</a> with <a
                      href="https://github.com/mzabriskie/axios">Axios</a>). For URL navigation of the single
                      page web app, <a href="https://github.com/ReactTraining/react-router"> React
                      Router</a> is used. Because it is written with Javascript's new release ES6,
                      the web app uses <a href="https://babeljs.io">Babel</a> to translate ES6 into
                      ES5 for better compatibility between browsers, uses <a
                      href="https://webpack.js.org">Webpack&nbsp;2</a> to run the code through Babel
                      for transformation, and uses <a href="https://expressjs.com">Express</a> to
                      configure the server. For managing packages, <a
                      href="https://www.npmjs.com/">npm</a> is used. For design purposes and browser
                      flexibility, the web app uses a CDN for Twitter's <a
                      href="https://v4-alpha.getbootstrap.com/">Bootstrap&nbsp;4 </a> framework. <a
                      href="http://sass-lang.com/">Sass </a> is implemented for consistent,
                      compressed, and programmatic creation of CSS.
                    </p>
                    <h6>Check it out at the <a href="https://github.com/SCUEvals/scuevals"> GitHub repository.</a></h6>
                  </div>
                </div>


              </div>
              <div className="col-sm-6">

                <button className="btn" type="button" data-toggle="collapse" data-target="#serverSideDesc" aria-expanded="false" aria-controls="serverSideDesc">
                  Database Info <i className="fa fa-chevron-down"></i><br />
                  <small>Fredrik Blomqvist</small>
                </button>
              <div className="collapse" id="serverSideDesc">
                <div className="card card-block">
                  Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h6 id="aboutEnd">Like what you see? Have ideas for change?<br />
      Email us at  <a className="blueLink" href="mailto:scuevalsteam@gmail.com">scuevalsteam@gmail.com </a>
      or check out our official <a className="blueLink" href="https://github.com/scuevals">GitHub</a>!
      </h6>
    </div>
  );
}

export default About;
