import React from 'react';
import { Link } from 'react-router-dom';

import '../styles/footer.scss';

const Footer = ()  => {
  return (
    <footer>
      <div className="container">
        <Link className="btn" to={"/about"}>
          About Us
        </Link>
        <Link className="btn" to={"/privacy"}>
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
