import React from 'react';

const About = () => {
  return (
    <div className="container text-center">
      <div className="content">
        <div className="card">
          <h3 className="card-header">
            About Us
            <i className="fa fa-window-close btn closeBtn"></i>
          </h3>
          <div className="card-block">
            <p>
              While attending Santa Clara University, we noticed that class evaluations just
              weren't very helpful. That's where we come in. We are dedicated to serving a
              platform that helps SCU students make informed decisions about registering for
              classes.</p> <strong>We want a place where you can read and write
              relevant evaluations that we think are important to your
              education.</strong>
            <hr />
            <div className="row">
              <div className="col-sm-6">
                <p>
                  <button className="btn" type="button" data-toggle="collapse" data-target="#clientSideDesc" aria-expanded="false" aria-controls="clientSideDesc">
                    Web App Implementation <i className="fa fa-chevron-down"></i><br />
                    <small>Joseph Théberge</small>
                  </button>
                </p>
                <div className="collapse" id="clientSideDesc">
                  <div className="card card-block">
                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.
                  </div>
                </div>


              </div>
              <div className="col-sm-6">

              <p>
                <button className="btn" type="button" data-toggle="collapse" data-target="#serverSideDesc" aria-expanded="false" aria-controls="serverSideDesc">
                  Database Implementation <i className="fa fa-chevron-down"></i><br />
                  <small>Fredrik Blomqvist</small>
                </button>
              </p>
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
      <h6 className="">Like what you see? Have ideas for change? <a className="blueLink" href="mailto:scuevalsteam@gmail.com">Email us at scuevalsteam@gmail.com!</a></h6>
    </div>
  );
}

export default About;
