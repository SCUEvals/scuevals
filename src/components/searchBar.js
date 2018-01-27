import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { setSearchResults, setDepartmentsList } from '../actions';
import API from '../services/api';
import '../styles/searchBar.scss';

class SearchBar extends Component {

  constructor(props) {
    super(props);
    this.debouncedGetResponse = debounce(this.debouncedGetResponse, 250);
  }

  getResponse(searchVal, setSearchResults) { //same as debouncedGetResponse but without delay
    if (searchVal && setSearchResults) {
      let client = new API();
      client.get('/search', responseData => {
          responseData.term = searchVal;
          this.sortResponseData(responseData);
          setSearchResults(responseData);
          $('#searchBarResults').hide(); //hide results dropdown after new results in until new input entered after
        },
        {q: searchVal}
      );
    }
  }

  debouncedGetResponse(searchVal, setSearchResults) {
    if (searchVal && setSearchResults) {
      let client = new API();
      client.get('/search', responseData => {
          this.sortResponseData(responseData);
          setSearchResults(responseData);
          $('#searchBar input').focus(); //focus on input after appears, which will also enable searchResults
        },
        {q: searchVal}
      );
    }
  }

  sortResponseData(responseData) {
    responseData.professors.sort((a, b) => {
      return a.last_name > b.last_name ? 1 : a.last_name < b.last_name ? -1 : 0;
    });
    responseData.courses.sort((a, b) => {
    if (a.department == b.department) {
      //nums can have letters in them too (ex. 12L), so parse integers and compare
      let parsedANum = parseInt(a.number, 10);
      let parsedBNum = parseInt(b.number, 10);
      //if integers same, check for letters to decide
      if (parsedANum == parsedBNum) return a.number > b.number ? 1 : a.number < b.number ? -1 : 0;
      return parsedANum > parsedBNum ? 1 : parsedANum < parsedBNum ? -1 : 0;
    }
    else return a.department > b.department ? 1 : a.department < b.department ? -1 : 0;
    });
  }

  renderSearch(field) {
    const { meta: { error, submitFailed, touched } } = field;

    function hideOnMouseDownOutside(searchBar, searchBarResults) { //must not be DOM objects passed, since each click needs to re-search DOM to see if exists
      const outsideMouseDownListener = event => {
        if (!$(event.target).closest($(searchBar)).length) {
          $(searchBarResults).hide(); //if already hidden, will do nothing
          document.removeEventListener('mousedown', outsideMouseDownListener);
        }
      }
      document.addEventListener('mousedown', outsideMouseDownListener);
    }
    return (
      <div className="row">
        <label className="sr-only">{field.label}</label>
        <div id='searchBar' styleName={submitFailed && error ? 'search-error' : ''} className='col-12 col-md-8 mx-auto input-group'>
          <input
            className='form-control'
            type='text'
            placeholder='Search for professor or class'
            autoComplete='off'
            {...field.input}
            onFocus={ event => {
              $('#searchBarResults').show();
              field.input.onFocus(event);
              hideOnMouseDownOutside('#searchBar', '#searchBarResults');
            }}

          />
          <span className="input-group-btn">
            <button type="submit" className="btn"><i className="fa fa-search" /></button>
          </span>
          {submitFailed && error ?
            <div styleName='text-help'>
              {error}
            </div>
            : ''
          }
          {field.searchResults && field.input.value.length > 2 ? field.renderSearchResults(field.searchResults)
            : ''
          }
        </div>
      </div>
    ); //searchResults can exist while value length < 3. Edge case: Old GET request still processing, but value length no longer > 2
  }

  renderSearchResults(response) {
    if (response.courses.length === 0 && response.professors.length === 0) return null;

    //onMouseDown prevents losing focus if clicking on h6 elements (will also prevent potential unnecessary hideOnMouseDownOutside events which are called on refocusing on input)
    return (
      <ul id='searchBarResults'>
        {response.professors.length > 0 ? <li><h6 onMouseDown={event => event.preventDefault()}>Professors</h6></li> : ''}
        {
          response.professors.map(professor => {
            return (
              <li key={professor.id}>
                <Link
                  onMouseDown={event => event.preventDefault()}
                  onClick={event => {
                    $('#searchBarResults').hide();
                    $('#searchBar input').blur();
                   }}
                  to={`/professors/${professor.id}`}>
                  {professor.last_name}, {professor.first_name}
                </Link>
              </li>
            );
          })
        }
        {response.courses.length > 0 ? <li><h6 onMouseDown={event => event.preventDefault()}>Classes</h6></li> : ''}
        {
          response.courses.map(course => {
            return(
              <li key={course.id}>
                <Link onClick={() => $('#searchBarResults').hide()} to={`/courses/${course.id}`}>
                  {course.department} {course.number}: {course.title}
                </Link>
              </li>
            );
          })
        }
      </ul>
    );
  }

  onSubmit(values) {
    //values is object with searchBar: <input>
    this.debouncedGetResponse(null, null); //cancel other responses in progress
    if ('/search/' + values.searchBar !== this.props.location.pathname) { //only do something if search is different than last
      if (this.props.searchResults && values.searchBar === this.props.searchResults.term) { //if values same, don't make new request, use current searchResults instead (but force update for searchContent)
        const response = this.props.searchResults;
        response.forceUpdate = true;
        this.props.setSearchResults(response);
      }
      else if ('/search/' + values.searchBar !== this.props.location.pathname) { //don't re-search if search would be same
        const tempResponse = {professors: [], courses: [], forceUpdate: true, loading: true};
        this.props.setSearchResults(tempResponse); //show loading icon while results being asynchronously fetched
        this.getResponse(values.searchBar, response =>  {
          response.forceUpdate = true;
          response.term = values.searchBar;
          this.props.setSearchResults(response);
        });
      }
      this.props.history.push('/search/' + values.searchBar);
    }
  }

  render() {
    return(
      <form className="container" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          name="searchBar" //responsible for object's key name for values
          component={this.renderSearch}
          renderSearchResults={this.renderSearchResults}
          searchResults={this.props.searchResults}
          setSearchResults={response => this.props.setSearchResults(response)}
          onChange={
            (change, newVal) => {
              if (newVal.length > 2) {
                this.debouncedGetResponse(newVal, response => {
                  response.term = newVal;
                  this.props.setSearchResults(response);
                });
              } else {
                this.debouncedGetResponse(null, null);//this cancels any previous calls still being debounced so function not called later
                if (this.props.searchResults !== null) this.props.setSearchResults(null);
              }
            }
          }
        />
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo,
    searchResults: state.searchResults,
    departmentsList: state.departmentsList
  };
}

function validate(values) {
  const errors = {};
  if (!values.searchBar || values.searchBar.length < 3) {
    errors.searchBar = "Enter at least 3 characters";
  }
  return errors;
}

export default reduxForm({
  validate,
  form: 'searchBar'
})connect(mapStateToProps, { setSearchResults, setDepartmentsList })(SearchBar);
