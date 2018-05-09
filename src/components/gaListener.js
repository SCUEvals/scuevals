import { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { withRouter } from 'react-router-dom';
import { locationPT, historyPT } from '../utils/propTypes';

class GAListener extends Component {
  static propTypes = {
    location: locationPT,
    history: historyPT,
    children: PropTypes.arrayOf(PropTypes.object),
  };

  static sendPageView(location) {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
  }

  componentDidMount() {
    GAListener.sendPageView(this.props.location);
    this.props.history.listen(this.sendPageView);
  }

  render() {
    return [this.props.children];
  }
}

export default withRouter(GAListener);
