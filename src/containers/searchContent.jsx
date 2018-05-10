import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import { Link } from 'react-router-dom';

import { setSearchResultsAction } from '../actions';
import API from '../services/api';
import '../styles/searchContent.scss';
import { departmentsListPT, matchPT, historyPT, searchResultsPT } from '../utils/propTypes';
import CustomSort from '../utils/customSort';

class SearchContent extends Component {
  static propTypes = {
    searchResults: searchResultsPT,
    setSearchResults: PropTypes.func.isRequired,
    departmentsList: departmentsListPT,
    match: matchPT,
    history: historyPT,
  }

  static courseNumberFormatter(cell, row, departmentsList) {
    return (
      <Link to={`/courses/${row.id}`}>
        {departmentsList.object[row.department_id].abbr} {row.number}
      </Link>
    );
  }

  static courseTitleFormatter(cell, row) {
    return <Link to={`/courses/${row.id}`}>{row.title}</Link>;
  }

  static nameFormatter(cell, row) {
    return <Link to={`/professors/${row.id}`}>{`${row.last_name}, ${row.first_name}`}</Link>;
  }

  static sortCourseTitles(a, b, order) {
    const splitA = a.split(' ');
    const splitB = b.split(' ');
    const aDepartment = splitA[0];
    const bDepartment = splitB[0];
    if (order === 'asc') {
      if (aDepartment === bDepartment) {
        // nums can have letters in them too (ex. 12L), so parse integers and compare
        const parsedANum = parseInt(splitA[1], 10);
        const parsedBNum = parseInt(splitB[1], 10);
        // if integers same, check for letters to decide
        if (parsedANum === parsedBNum) return a > b ? 1 : a < b ? -1 : 0;
        return parsedANum > parsedBNum ? 1 : parsedANum < parsedBNum ? -1 : 0;
      }
      return aDepartment > bDepartment ? 1 : aDepartment < bDepartment ? -1 : 0;
    }

    if (aDepartment === bDepartment) {
      // nums can have letters in them too (ex. 12L), so parse integers and compare
      const parsedANum = parseInt(splitA[1], 10);
      const parsedBNum = parseInt(splitB[1], 10);
      // if integers same, check for letters to decide
      if (parsedANum === parsedBNum) return a > b ? -1 : a < b ? 1 : 0;
      return parsedANum > parsedBNum ? -1 : parsedANum < parsedBNum ? 1 : 0;
    }
    return aDepartment > bDepartment ? -1 : aDepartment < bDepartment ? 1 : 0;
  }

  componentDidMount() {
    /* if loading this component straight from GET request (rather than being routed with
       React Router (action would be PUSH)) */
    if (
      this.props.match.params.search.length > 2
      && (
        this.props.history.action === 'POP' ||
        (this.props.history.location.state && this.props.history.location.state.referrer)
      )
    ) {
      const client = new API();
      client.get(
        '/search', (responseData) => {
          if (this.props.departmentsList) {
            CustomSort('professor', responseData.professors);
            CustomSort('course', responseData.courses);
          }
          this.props.setSearchResults(responseData);
          // hide results dropdown when submitting until new input entered after
          $('#searchBarResults').hide();
          this.forceUpdate(); // passes shouldComponentUpdate, ensures new state read by component
        },
        { q: this.props.match.params.search },
      );
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.searchResults && nextProps.searchResults.forceUpdate) return true;
    // don't update on new search results, only want 1st instance
    else if (this.props.searchResults !== nextProps.searchResults) return false;
    return true;
  }

  componentDidUpdate(prevProps) {
    if (this.props.departmentsList && !prevProps.departmentsList && this.props.searchResults) {
      // make deep copy, state immutable
      const sortedSearchResults = JSON.parse(JSON.stringify(this.props.searchResults));
      CustomSort('professor', sortedSearchResults.professors);
      CustomSort('course', sortedSearchResults.courses);
      this.props.setSearchResults(sortedSearchResults);
      // hide results dropdown when submitting until new input entered after
      $('#searchBarResults').hide();
      this.forceUpdate(); // passes shouldComponentUpdate, ensures that new state read by component
    }
  }

  render() {
    const { searchResults, departmentsList } = this.props;
    const coursesColumns = [
      {
        dataField: 'course',
        text: 'Course',
        formatter: (cell, row) => SearchContent.courseNumberFormatter(cell, row, departmentsList),
        sort: true,
        sortFunc: SearchContent.sortCourseTitles,
        dataAlign: 'center',
      },
      {
        dataField: 'title',
        text: 'Title',
        formatter: SearchContent.courseTitleFormatter,
        sort: true,
        dataAlign: 'center',
      },
    ];
    const professorsColumns = [
      {
        dataField: 'name',
        text: 'Name',
        formatter: SearchContent.nameFormatter,
        sort: true,
        dataAlign: 'center',
      },
    ];
    const labeledSearchResults = searchResults ? Object.assign({}, searchResults) : null;
    if (searchResults && departmentsList) {
      labeledSearchResults.courses.forEach((obj) => {
        obj.course = `${departmentsList.object[obj.department_id].abbr} ${obj.number}`;
      });
      labeledSearchResults.professors.forEach(obj => (obj.name = `${obj.last_name}, ${obj.first_name}`));
    }

    $('#searchBarResults').hide();

    if (searchResults && !searchResults.loading) {
      return (
        <div styleName="results" className="content">
          {searchResults.professors.length === 0 && searchResults.courses.length === 0 ?
            <h5>{`No results found for "${this.props.match.params.search}"`}</h5>
            :
            <h5>{`Showing results for "${this.props.match.params.search}"`}</h5>
          }
          {searchResults.professors.length > 0 && (
            <div>
              <h4>Professors</h4>
              <BootstrapTable
                data={labeledSearchResults.professors}
                columns={professorsColumns}
                keyField="name"
                withoutTabIndex
                version="4"
                striped
                hover
              />
            </div>
          )}
          {searchResults.courses.length > 0 && departmentsList && (
            <div>
              <h4>Courses</h4>
              <BootstrapTable
                data={labeledSearchResults.courses}
                columns={coursesColumns}
                keyField="course"
                withoutTabIndex
                version="4"
                striped
                hover
              />
            </div>
          )}
        </div>
      );
    } else if (this.props.match.params.search.length > 2) {
      return (
        <div className="loadingWrapper">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw" />
        </div>
      );
    }
    return (
      <div styleName="results" className="content">
        <h5>Please search with at least 3 characters.</h5>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  searchResults: state.searchResults,
  departmentsList: state.departmentsList,
});

const mapDispatchToProps = {
  setSearchResults: setSearchResultsAction,
};


export default connect(mapStateToProps, mapDispatchToProps)(SearchContent);
