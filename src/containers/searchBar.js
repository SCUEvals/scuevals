import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import debounce from 'lodash.debounce';
import { Link } from 'react-router-dom';

import '../styles/searchBar.scss';
import API from '../services/api';
import { setSearchResults, setDepartmentsList, setProfessorsList, setQuartersList, setCoursesList, setMajorsList } from '../actions';
import CustomSort from '../utils/customSort';

class SearchBar extends Component {
  static propTypes = {
    searchResults: PropTypes.object,
    quartersList: PropTypes.object,
    coursesList: PropTypes.object,
    departmentsList: PropTypes.object,
    professorsList: PropTypes.object,
    majorsList: PropTypes.object,
    setSearchResults: PropTypes.func,
    setDepartmentsList: PropTypes.func,
    setProfessorsList: PropTypes.func,
    setQuartersList: PropTypes.func,
    setCoursesList: PropTypes.func,
    setMajorsList: PropTypes.func,
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    handleSubmit: PropTypes.func,
  }

  /* searchBar always loaded after auth as full user, so make ajax requests after auth
  (not on authWithBackEnd on home because if going to non-home page from link, then won't load) */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.debouncedGetResponse = debounce(this.debouncedGetResponse, 250);
    if (!this.props.departmentsList) {
      const client = new API();
      client.get('/departments', departments => this.props.setDepartmentsList(departments));
    }
    if (!this.props.quartersList) {
      const client = new API();
      client.get('/quarters', quarters => this.props.setQuartersList(quarters));
    }
    if (!this.props.coursesList) {
      const client = new API();
      client.get('/courses', courses => this.props.setCoursesList(courses, this.props.departmentsList)); // departmentsList needed to lookup ids. May not be loaded yet, but that's handled below
    }
    if (!this.props.professorsList) {
      const client = new API();
      client.get('/professors', professors => this.props.setProfessorsList(professors));
    }
    if (!this.props.majorsList) {
      const client = new API();
      client.get('/majors', majors => this.props.setMajorsList(majors));
    }
  }

  componentDidUpdate() { // if coursesList fetched before departmentsList, then need to retroactively search for department name from id and sort
    if (this.props.coursesList && !this.props.coursesList.departmentsListLoaded && this.props.departmentsList) { this.props.setCoursesList(this.props.coursesList.array.slice(), this.props.departmentsList); } // make deep copy of current, state immutable
  }

  getResponse(searchVal, setSearchResults) { // similar to debouncedGetResponse but without delay
    $('#searchBarResults').hide(); // hide results dropdown after new results in until new input entered after
    if (searchVal && setSearchResults) {
      const client = new API();
      client.get(
        '/search', (responseData) => {
          responseData.term = searchVal;
          this.sortResponseData(responseData);
          setSearchResults(responseData);
        },
        { q: searchVal },
      );
    }
  }

  debouncedGetResponse(searchVal, setSearchResults) {
    if (searchVal && setSearchResults) {
      const client = new API();
      if (this.form) {
        this.setState({ loading: true }, () => client.get(
          '/search', (responseData) => {
            if (this.form) {
              responseData.term = searchVal;
              this.sortResponseData(responseData);
              setSearchResults(responseData);
              this.setState({ loading: false });
              if (responseData.courses.length > 0 || responseData.professors.length > 0) $('#searchBar input').focus(); // focus on input after appears, which will also enable searchResults
            }
          },
          { q: searchVal },
        ));
      }
    }
  }

  sortResponseData(responseData) {
    CustomSort('professor', responseData.professors);
    CustomSort('course', responseData.courses);
  }

  renderSearch(field) {
    const {
      meta: { error, submitFailed }, renderSearchResults, departmentsList, input, searchResults, loading,
    } = field;
    function hideOnMouseDownOutside(searchBar, searchBarResults) { // must not be DOM objects passed, since each click needs to re-search DOM to see if exists
      const outsideMouseDownListener = (event) => {
        if (!$(event.target).closest($(searchBar)).length) {
          $(searchBarResults).hide(); // if already hidden, will do nothing
          document.removeEventListener('mousedown', outsideMouseDownListener);
        }
      };
      document.addEventListener('mousedown', outsideMouseDownListener);
    }
    const submitBtnClass = loading ? 'Select-loading' : 'fa fa-search';
    return (
      <div className='row'>
        <div id='searchBar' styleName={submitFailed && error ? 'search-error' : ''} className='col-12 col-md-8 mx-auto input-group'>
          <span className='sr-only'>Search bar</span>
          <input
            onChange={input.onChange}
            onKeyDown={(event) => {
              switch (event.keyCode) {
              case 38: // up
                event.preventDefault();
                break;
              case 40: { // down
                $('#searchBarResults li a')[0].focus();
                event.preventDefault();
                break;
              }
              }
            }}
            className='form-control'
            type='text'
            placeholder='Search for professor or class'
            autoComplete='off'
            onFocus={ (event) => {
              $('#searchBarResults').show();
              input.onFocus(event);
              hideOnMouseDownOutside('#searchBar', '#searchBarResults');
            }}
          />
          <span className='input-group-btn'>
            <button type='submit' className='btn'><i className={submitBtnClass} /></button>
          </span>
          {submitFailed && error ?
            <div styleName='text-help'>
              {error}
            </div>
            : ''
          }
          {renderSearchResults(searchResults, input.value, departmentsList)}
        </div>
      </div>
    );
  }

  renderSearchResults(response, search, departmentsList) { // searchResults can exist while search value length < 3. Edge case: Old GET request still processing, but value length no longer > 2
    if (response && response.term && response.term.length > 2) {
      if (response.courses.length === 0 && response.professors.length === 0) return null;
      // onMouseDown prevents losing focus if clicking on h6 elements (will also prevent potential unnecessary hideOnMouseDownOutside events which are called on refocusing on input)
      return (
        <ul id='searchBarResults'>
          <span className='sr-only'>Search results</span>
          {response.professors.length > 0 && (<li><h6 onMouseDown={event => event.preventDefault()}>Professors</h6></li>)}
          {
            response.professors.map(professor => (
              <li key={professor.id}>
                <Link
                  onMouseDown={event => event.preventDefault()}
                  onKeyDown={(event) => {
                    // event.preventDefault(); //disables scrolling with keys, but also selecting with enter key (re-enabled manually below)
                    switch (event.keyCode) {
                    case 38: { // up
                      const node = document.activeElement.parentNode.previousSibling.firstChild;
                      if (node.tagName == 'H6') $('#searchBar input').focus();
                      else node.focus();
                      event.preventDefault();
                      break;
                    }
                    case 40: { // down
                      let node = document.activeElement.parentNode.nextSibling.firstChild;
                      if (node) {
                        if (node.tagName == 'H6') node = node.parentNode.nextSibling.firstChild;
                        node.focus();
                      }
                      event.preventDefault();
                      break;
                    }
                    }
                  }}
                  onClick={() => {
                    $('#searchBarResults').hide();
                    $('#searchBar input').blur();
                  }}
                  to={`/professors/${professor.id}`}>
                  {professor.last_name}, {professor.first_name}
                </Link>
              </li>
            ))
          }
          {response.courses.length > 0 ? <li><h6 onMouseDown={event => event.preventDefault()}>Courses</h6></li> : ''}
          {
            response.courses.map(course => (
              <li key={course.id}>
                <Link
                  onClick={() => {
                    $('#searchBarResults').hide();
                    $('#searchBar input').blur();
                  }}
                  onKeyDown={(event) => {
                    // event.preventDefault(); //disables scrolling with keys, but also selecting with enter key (re-enabled manually below)
                    switch (event.keyCode) {
                    case 38: { // up
                      let node = document.activeElement.parentNode.previousSibling.firstChild;
                      if (node.tagName == 'H6') node = node.parentNode.previousSibling.firstChild;
                      node.focus();
                      event.preventDefault();
                      break;
                    }
                    case 40: { // down
                      let node = document.activeElement.parentNode.nextSibling;
                      if (!node) break; // since very last <li> may be here, must check if another exists or console error sometimes appears after last <li> selected and holding down arrow
                      else node = node.firstChild;
                      if (node.tagName == 'H6') node = node.parentNode.nextSibling.firstChild;
                      node.focus();
                      event.preventDefault();
                      break;
                    }
                    }
                  }}
                  onMouseDown={event => event.preventDefault()}
                  to={`/courses/${course.id}`}
                >
                  {departmentsList ? departmentsList[course.department_id].abbr : '...'} {course.number}: {course.title}
                </Link>
              </li>
            ))
          }
        </ul>
      );
    }
    return null;
  }

  onSubmit(values) {
    const {
      location, searchResults, setSearchResults, history,
    } = this.props;
      // values is object with searchr: <input>
    this.debouncedGetResponse(null, null); // cancel other responses in progress
    if (`/search/${values.search}` !== location.pathname) { // only do something if search is different than last
      if (!searchResults || values.search != searchResults.term) { // if values same, don't make new request, use current searchResults instead (but force update for searchContent)
        const tempResponse = {
          professors: [], courses: [], forceUpdate: true, loading: true,
        };
        setSearchResults(tempResponse); // show loading icon while results being asynchronously fetched
        this.getResponse(values.search, (response) => {
          response.forceUpdate = true;
          response.term = values.search;
          setSearchResults(response);
        });
      }
      history.push(`/search/${values.search}`);
    }
  }

  render() {
    const {
      handleSubmit, setSearchResults, searchResults, departmentsList,
    } = this.props;
    const { loading } = this.state;
    return (
      <form ref={node => this.form = node} className='container' onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          name='search' // responsible for object's key name for values
          component={this.renderSearch}
          renderSearchResults={(results, term) => this.renderSearchResults(results, term, departmentsList)}
          departmentsList={departmentsList}
          searchResults={searchResults}
          loading={loading}
          onChange={
            (change, newVal) => {
              if (newVal.length > 2) {
                this.debouncedGetResponse(newVal, (response) => {
                  response.term = newVal;
                  setSearchResults(response);
                });
              } else {
                this.debouncedGetResponse(null, null);// this cancels any previous calls still being debounced so function not called later
                if (this.props.searchResults !== null) setSearchResults(null);
              }
            }
          }
        />
      </form>
    );
  }
}

function validate(values) {
  const errors = {};
  if (!values.search || values.search.length < 3) {
    errors.search = 'Enter at least 3 characters';
  }
  return errors;
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  searchResults: state.searchResults,
  departmentsList: state.departmentsList,
  coursesList: state.coursesList,
  majorsList: state.majorsList,
  myEvalsList: state.myEvalsList,
});

const mapDispatchToProps = {
  setSearchResults,
  setDepartmentsList,
  setProfessorsList,
  setQuartersList,
  setCoursesList,
  setMajorsList,
};

export default reduxForm({
  validate,
  form: 'searchBar',
})(connect(mapStateToProps, mapDispatchToProps)(SearchBar));
