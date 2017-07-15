import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ()  => {
  return (
    <footer>
      <div className="container">
        <Link className="float-left" to={"/about"}>
          About Us
        </Link>
        <div className="float-right">
          Contact Us
        </div>
      </div>
    </footer>
  );
}

export default Footer;
