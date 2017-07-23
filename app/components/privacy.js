import React from 'react';
import { Link } from 'react-router-dom';
const Privacy = () => {

  return (
    <div className="container">
      <div className="content">
        <div className="card">
          <h3 className="card-header">
            Privacy Policy
            <Link to={'/'}><i className="fa fa-window-close btn closeBtn"></i></Link>
          </h3>
          <div className="card-block">
            <p>
              The only cookies in use on our site are for Google Analytics.
              Google Analytics is a tool that helps us understand how visitors interact
              with our website. We also use
              Google Analytics' 3rd-party audience data such as age and gender to
              better understand the behavior of our users.
            </p>
            <p>
              Google Analytics collects information anonymously. It reports website trends
              without identifying individual visitors.  To learn more about Google Analytics
               and how it uses your data, please visit  <a href="https://google.com/analytics/learn/privacy.html">https://google.com/analytics/learn/privacy.html</a>.
            </p>
            <p>
              You can opt out of Google Analytics without affecting how you visit our site –
              for more information on opting out of being tracked by Google Analytics across
              all websites you use, visit this Google page, <a href="https://tools.google.com/dlpage/gaoptout">https://tools.google.com/dlpage/gaoptout</a>.
            </p>

              <h6>Changes to This Policy</h6>
            <p>
              We reserve the right to change this policy to meet the changing needs of
              SCU Evals, or for any other reason.
              Last revision: 23 July 2017.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
