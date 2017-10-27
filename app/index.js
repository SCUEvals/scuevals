import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import promise from 'redux-promise';
import axios from 'axios';
import ReactGA from 'react-ga';
import jwtDecode from 'jwt-decode';

import Service from '../public/scripts/api_service';

import reducers from './reducers';
import Header from './containers/header';
import SearchContent from './containers/searchContent';
import About from './containers/about';
import Footer from './components/footer';
import Home from './containers/home';
import PostEval from './containers/postEval';
import Privacy from './containers/privacy';
import GAListener from './components/gaListener';
import Profile from './containers/profile';

import requireAuth from './components/requireAuth';

import { ROOT_URL, requestConfig } from './actions';

ReactGA.initialize('UA-102751367-1');

export const storeWithMiddleware = createStore(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), //for browser's Redux DevTools add-on to work for development
  applyMiddleware(promise)
);


//const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

if (localStorage.jwt) {
  if (new Date().getTime() / 1000 > jwtDecode(localStorage.jwt).exp) { //if token expired, delete it
    localStorage.removeItem('jwt');
    renderDOM();
  }
  else axios.post(`${ROOT_URL}/auth/validate`, {jwt: localStorage.jwt}, requestConfig) //else verify with back end
  .then(response => {
    localStorage.jwt = response.data.jwt;
    renderDOM();
  })
  .catch(function (error) {
    localStorage.removeItem('jwt');
    renderDOM();
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(error.response);
      console.error(error.response.status);
      console.error(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', error.message);
    }
    console.error(error.config);
  });
} else {
  renderDOM();
}

function renderDOM () {
  ReactDOM.render(
    <Provider store={storeWithMiddleware}>
      <BrowserRouter>
        <GAListener>
          <div id='push-footer'>
            <Header />
            <div className='container'>
              <Switch>
                <Route path="/about" component={About} />
                <Route path="/search/:search" component={requireAuth(SearchContent)} />
                <Route path="/post/" component={requireAuth(PostEval)} />
                <Route path="/privacy" component={Privacy} />
                <Route path="/profile" component={requireAuth(Profile)} />
                <Route path="/" component={requireAuth(Home)} />
              </Switch>
            </div>
          </div>
          <Footer />
        </GAListener>
      </BrowserRouter>
    </Provider>,
    document.getElementById('app')
  )
}
