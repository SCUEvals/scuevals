import React from 'react';
import PropTypes from 'prop-types';

import '../styles/checkbox.scss';

const Checkbox = (props) => {
  const { onKeyDown, defaultChecked } = props;
  const { input, text } = props.field;
  return (
    <label styleName="container">
      <input
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
  field: PropTypes.object.isRequired,
  onKeyDown: PropTypes.func,
};

export default Checkbox;
