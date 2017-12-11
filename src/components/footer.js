import React from 'react';
import { Link } from 'react-router-dom';

import '../styles/footer.scss';

const Footer = ()  => {
  return (
    <footer styleName="footer">
      <div className="container">
        <Link styleName="link" className="float-left" to={"/about"}>
          About Us
        </Link>
        <div className="float-right">
          <Link styleName="link" className="float-left" to={"/privacy"}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
