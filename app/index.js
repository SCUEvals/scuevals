import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import promise from 'redux-promise';
import axios from 'axios';
import ReactGA from 'react-ga';

import reducers from './reducers';
import Header from './containers/header';
import SearchContent from './containers/searchContent';
import About from './components/about';
import Footer from './components/footer';
import Home from './containers/home';
import PostEval from './containers/postEval';
import Privacy from './components/privacy';
import GAListener from './components/gaListener';

import requireAuth from './components/requireAuth';

import { ROOT_URL, postConfig } from './actions';

ReactGA.initialize('UA-102751367-1');

const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

if (localStorage.jwt) {
  axios.post(`${ROOT_URL}/auth/validate`, {jwt: localStorage.jwt}, postConfig)
  .then(response => {
    localStorage.jwt = response.data.jwt;
    ReactDOM.render(
      <Provider store={createStoreWithMiddleware(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())}>
        <BrowserRouter>
          <GAListener>
            <Header response={response} />
            <div className="page-wrapper container">
              <Switch>
                <Route path="/about" component={About} />
                <Route path="/search/:search" component={requireAuth(SearchContent)} />
                <Route path="/post/" component={requireAuth(PostEval)} />
                <Route path="/privacy" component={Privacy} />
        		    <Route path="/" component={Home} />
        	    </Switch>
            </div>
            <Footer />
          </GAListener>
        </BrowserRouter>
      </Provider>,
    	document.getElementById('app')
    )
    //window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() for browser extension to work for development
  })
  .catch(function (error) {
    if (error.response && error.response.status === 401) localStorage.removeItem('jwt');
    ReactDOM.render(
      <Provider store={createStoreWithMiddleware(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())}>
        <BrowserRouter>
          <GAListener>
            <Header />
            <div className="page-wrapper container">
              <Switch>
                <Route path="/about" component={About} />
                <Route path="/search/:search" component={requireAuth(SearchContent)} />
                <Route path="/post/" component={requireAuth(PostEval)} />
                <Route path="/privacy" component={Privacy} />
        		    <Route path="/" component={Home} />
        	    </Switch>
            </div>
            <Footer />
          </GAListener>
        </BrowserRouter>
      </Provider>,
    	document.getElementById('app')
    );
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
  ReactDOM.render(
    <Provider store={createStoreWithMiddleware(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())}>
      <BrowserRouter>
        <GAListener>
          <Header />
          <div className="page-wrapper container">
            <Switch>
              <Route path="/about" component={About} />
              <Route path="/search/:search" component={requireAuth(SearchContent)} />
              <Route path="/post/" component={PostEval} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/" component={Home} />
            </Switch>
          </div>
          <Footer />
        </GAListener>
      </BrowserRouter>
    </Provider>,
    document.getElementById('app')
  )
}
