/* eslint-disable jsx-a11y/label-has-for */ // inputs won't have id's,
import React from 'react';
import PropTypes from 'prop-types';

import '../styles/checkbox.scss';

const Checkbox = (props) => {
  const { onKeyDown, defaultChecked } = props;
  const { input, text } = props.field;
  return (
    <label htmlFor={input.name} styleName="container">
      <input
        id={input.name}
        type="checkbox"
        defaultChecked={defaultChecked}
        {...input}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault(); // disable form submission
            event.target.click();
          }
        }}
        onKeyDown={onKeyDown} // may be undefined
      />
      <span styleName="checkmark" />
      {text}
    </label>
  );
};

Checkbox.propTypes = {
  field: PropTypes.shape({
    text: PropTypes.string.isRequired,
    input: PropTypes.shape({
        name: PropTypes.string.isRequired,
    }).isRequired,
  }),
  onKeyDown: PropTypes.func,
  defaultChecked: PropTypes.bool,
};

export default Checkbox;
