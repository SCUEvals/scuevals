import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { setSearchResults, setDepartmentsList, setProfessorsList, setQuartersList, setCoursesList, setMajorsList } from '../actions';
import debounce from 'lodash.debounce';
import { Link } from 'react-router-dom';

import '../styles/searchBar.scss';
import API from '../services/api';

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
    handleSubmit: PropTypes.func
  }

  /*searchBar always loaded after auth as full user, so make ajax requests after auth
  (not on authWithBackEnd on home because if going to non-home page from link, then won't load)*/
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this.debouncedGetResponse = debounce(this.debouncedGetResponse, 250);
    if (!this.props.departmentsList) {
      let client = new API();
      client.get('/departments', departmentsList => this.props.setDepartmentsList(departmentsList));
    }
    if (!this.props.professorsList) {
      let client = new API();
      client.get('/professors', professorsList => this.props.setProfessorsList(professorsList));
    }
    if (!this.props.quartersList) {
      let client = new API();
      client.get('/quarters', quartersList => this.props.setQuartersList(quartersList));
    }
    if (!this.props.coursesList) {
      let client = new API();
      client.get('/courses', coursesList =>this.props.setCoursesList(coursesList, this.props.departmentsList)); //departmentsList needed to lookup ids. May not be loaded yet, but that's handled below
    }
    if (!this.props.majorsList) {
      let client = new API();
      client.get('/majors', majorsList =>this.props.setMajorsList(majorsList));
    }
  }

  componentDidUpdate() { //if coursesList fetched before departmentsList, then need to retroactively search for department name from id and sort
    if (this.props.coursesList && !this.props.coursesList.departmentsListLoaded && this.props.departmentsList)
      this.props.setCoursesList(this.props.coursesList.array.slice(), this.props.departmentsList); //make deep copy of current, state immutable
  }

  getResponse(searchVal, setSearchResults) { //same as debouncedGetResponse but without delay
    $('#searchBarResults').hide(); //hide results dropdown after new results in until new input entered after
    if (searchVal && setSearchResults) {
      let client = new API();
      client.get('/search', responseData => {
          responseData.term = searchVal;
          this.sortResponseData(responseData);
          setSearchResults(responseData);
        },
        {q: searchVal}
      );
    }
  }

  debouncedGetResponse(searchVal, setSearchResults) {
    if (searchVal && setSearchResults) {
      let client = new API();
      if (this.form) {
        this.setState({loading: true}, () => client.get('/search', responseData => {
            if (this.form) {
              responseData.term = searchVal;
              this.sortResponseData(responseData);
              setSearchResults(responseData);
              this.setState({loading: false});
              if (responseData.courses.length > 0 || responseData.professors.length > 0) $('#searchBar input').focus(); //focus on input after appears, which will also enable searchResults
            }
          },
          {q: searchVal}
        ));
      }
    }
  }

  sortResponseData(responseData) {
    const { departmentsList } = this.props;
    responseData.professors.sort((a, b) => {
      return a.last_name > b.last_name ? 1 : a.last_name < b.last_name ? -1 : 0;
    });
    responseData.courses.sort((a, b) => {
    if (a.department_id == b.department_id) {
      //nums can have letters in them too (ex. 12L), so parse integers and compare
      let parsedANum = parseInt(a.number, 10);
      let parsedBNum = parseInt(b.number, 10);
      //if integers same, check for letters to decide
      if (parsedANum == parsedBNum) return a.number > b.number ? 1 : a.number < b.number ? -1 : 0;
      return parsedANum > parsedBNum ? 1 : parsedANum < parsedBNum ? -1 : 0;
    }
    else return departmentsList[a.department_id].abbr > departmentsList[b.department_id].abbr ? 1 : departmentsList[a.department_id].abbr < departmentsList[b.department_id].abbr ? -1 : 0;
    });
  }

  renderSearch(field) {
    const { meta: { error, submitFailed }, renderSearchResults, departmentsList, input, searchResults, loading } = field;
    function hideOnMouseDownOutside(searchBar, searchBarResults) { //must not be DOM objects passed, since each click needs to re-search DOM to see if exists
      const outsideMouseDownListener = event => {
        if (!$(event.target).closest($(searchBar)).length) {
          $(searchBarResults).hide(); //if already hidden, will do nothing
          document.removeEventListener('mousedown', outsideMouseDownListener);
        }
      }
      document.addEventListener('mousedown', outsideMouseDownListener);
    }
    const submitBtnClass = loading ? 'Select-loading' : 'fa fa-search';
    return (
      <div className="row">
        <label className="sr-only">{field.label}</label>
        <div id='searchBar' styleName={submitFailed && error ? 'search-error' : ''} className='col-12 col-md-8 mx-auto input-group'>
          <input
            onChange={event => input.onChange(event)}
            className='form-control'
            type='text'
            placeholder='Search for professor or class'
            autoComplete='off'
            onFocus={ event => {
              $('#searchBarResults').show();
              input.onFocus(event);
              hideOnMouseDownOutside('#searchBar', '#searchBarResults');
            }}
          />
          <span className="input-group-btn">
            <button type="submit" className="btn"><i className={submitBtnClass} /></button>
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

  renderSearchResults(response, search, departmentsList) { //searchResults can exist while search value length < 3. Edge case: Old GET request still processing, but value length no longer > 2
    if (response && response.term && response.term.length > 2) {
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
                    onClick={() => {
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
          {response.courses.length > 0 ? <li><h6 onMouseDown={event => event.preventDefault()}>Courses</h6></li> : ''}
          {
            response.courses.map(course => {
              return(
                <li key={course.id}>
                  <Link
                    onClick={() => {
                      $('#searchBarResults').hide();
                      $('#searchBar input').blur();
                    }}
                    onMouseDown={event => event.preventDefault()}
                     to={`/courses/${course.id}`}
                    >
                     {departmentsList ? departmentsList[course.department_id].abbr : '...'} {course.number}: {course.title}
                  </Link>
                </li>
              );
            })
        }
        </ul>
      );
    }
    else return null;
  }

  onSubmit(values) {
    const { location, searchResults, setSearchResults, history } = this.props;
    //values is object with searchr: <input>
    this.debouncedGetResponse(null, null); //cancel other responses in progress
    if ('/search/' + values.search !== location.pathname) { //only do something if search is different than last
      if (!searchResults || values.search != searchResults.term) { //if values same, don't make new request, use current searchResults instead (but force update for searchContent)
        const tempResponse = {professors: [], courses: [], forceUpdate: true, loading: true};
        setSearchResults(tempResponse); //show loading icon while results being asynchronously fetched
        this.getResponse(values.search, response =>  {
          response.forceUpdate = true;
          response.term = values.search;
          setSearchResults(response);
        });
      }
      history.push('/search/' + values.search);
    }
  }

  render() {
    const { handleSubmit, setSearchResults, searchResults, departmentsList } = this.props;
    const { loading } = this.state;
    return(
      <form ref={node => this.form = node} className="container" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <Field
          name='search' //responsible for object's key name for values
          component={this.renderSearch}
          renderSearchResults={(results, term) => this.renderSearchResults(results, term, departmentsList)}
          departmentsList={departmentsList}
          searchResults={searchResults}
          setSearchResults={response => setSearchResults(response)}
          loading={loading}
          onChange={
            (change, newVal) => {
              if (newVal.length > 2) {
                this.debouncedGetResponse(newVal, response => {
                  response.term = newVal;
                  setSearchResults(response);
                });
              } else {
                this.debouncedGetResponse(null, null);//this cancels any previous calls still being debounced so function not called later
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
    errors.search = "Enter at least 3 characters";
  }
  return errors;
}

const mapStateToProps = state => {
   return {
     userInfo: state.userInfo,
     searchResults: state.searchResults,
     departmentsList: state.departmentsList,
     coursesList: state.coursesList,
     majorsList: state.majorsList,
     myEvalsList: state.myEvalsList
   }
}

const mapDispatchToProps = {
 setSearchResults,
 setDepartmentsList,
 setProfessorsList,
 setQuartersList,
 setCoursesList,
 setMajorsList
};

export default reduxForm({
  validate,
  form: 'searchBar'
})(connect(mapStateToProps, mapDispatchToProps)(SearchBar));
