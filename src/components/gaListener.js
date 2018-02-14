import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { withRouter } from 'react-router';

class GAListener extends Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    children: PropTypes.array
  };

  componentDidMount() {
    this.sendPageView(this.props.location);
    this.props.history.listen(this.sendPageView);
  }

  sendPageView(location) {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default withRouter(GAListener);
