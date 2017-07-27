import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import promise from 'redux-promise';

import reducers from './reducers';
import Header from './containers/header';
import SearchContent from './containers/searchContent';
import About from './components/about';
import Footer from './components/footer';
import Home from './components/home';
import PostEval from './containers/postEval';
import Privacy from './components/privacy';

import GAListener from './components/gaListener';
import ReactGA from 'react-ga';
ReactGA.initialize('UA-102751367-1');


const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())}>
    <BrowserRouter>
      <GAListener>
        <Header />
        <div className="page-wrapper container">
          <Switch>
            <Route path="/about" component={About} />
            <Route path="/search/:search" component={SearchContent} />
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
);

//window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() for browser extension to work for development
