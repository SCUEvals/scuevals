import React from 'react';
const Privacy = () => {

  return (
    <div className="content">
      <h3>Privacy Policy</h3>
        <p>
          The only cookies in use on our site are for Google Analytics and Oauth 2.0 for Google.
          Google Analytics is a tool that helps us understand how visitors interact
          with our website. Oauth 2.0 allows you to securely login through Google's services without
          us managing or having access to passwords. We use this so we may ensure those who wish
          to post reviews are from Santa Clara University while keeping you secure.
          We also use Google Analytics' 3rd-party audience data such as age and gender to
          better understand the behavior of our users.
        </p>
        <p>We do not store nor have access to your personal passwords.</p>
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
          Last revision: 24 July 2017.
        </p>
    </div>
  );
}

export default Privacy;
