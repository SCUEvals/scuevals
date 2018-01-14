import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { setSearchResults } from '../actions';
import API from '../services/api';
import '../styles/searchContent.scss';

class SearchContent extends Component {

  static defaultProps = {
    searchResults: PropTypes.object,
    setSearchResults: PropTypes.func,
    match: PropTypes.object
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.searchResults && nextProps.searchResults.forceUpdate) return true;
    else if (this.props.searchResults !== nextProps.searchResults) return false; //don't update on new search results, only want 1st instance
    else return true;
  }

  componentWillMount() {
    if (this.props.match.params.search.length > 2 && this.props.history.action === 'POP') { //if loading this component straight from GET request (rather than being routed with React Router (action would be PUSH))
      let client = new API();
      client.get('/search', responseData => {
          this.sortResponseData(responseData);
          this.props.setSearchResults(responseData);
          $('#searchBarResults').hide(); //hide results dropdown when submitting until new input entered after
          this.forceUpdate(); //passes shouldComponentUpdate, ensures that new state read by component
        },
        {q: this.props.match.params.search}
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

  render() {
    const { searchResults } = this.props;
    $('#searchBarResults').hide();

    if (searchResults && !searchResults.loading) {
      return (
        <div styleName= "results" className="content">
          {searchResults.professors.length === 0 && searchResults.courses.length === 0 ?
            <h5>No results found for "{this.props.match.params.search}"</h5>
            :
            <h5>Showing results for "{this.props.match.params.search}"</h5>
          }
          {searchResults.professors.length > 0 ?
            <div>
              <h4>Professors</h4>
              <BootstrapTable withoutTabIndex version='4' data={searchResults.professors} striped={true} hover={true}>
                <TableHeaderColumn dataFormat={nameFormatter} dataField="last_name" isKey={true} dataAlign="center" dataSort={true}>Name</TableHeaderColumn>
              </BootstrapTable>
            </div>
            : ''
          }
          {searchResults.courses.length > 0 ?
            <div>
              <h4>Courses</h4>
              <BootstrapTable withoutTabIndex version='4' data={searchResults.courses} striped={true} hover={true}>
                <TableHeaderColumn dataFormat={courseNumberFormatter} dataField="number" dataSort={true} dataAlign="center">Course</TableHeaderColumn>
                <TableHeaderColumn dataFormat={courseTitleFormatter} dataField="title" isKey={true} dataSort={true} dataAlign="center">Title</TableHeaderColumn>
              </BootstrapTable>
            </div>
            : ''
          }
        </div>
      ); /* note: isKey={true} is not correctly set since there is no column displayed that is entirely unique,
      but it is needed to render. However, it does not affect functionality in this case*/
    } else if (this.props.match.params.search.length > 2) {
      return (
        <div className="loadingWrapper">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw"></i>
        </div>
      );
    } else {
      return (
        <div styleName="results" className="content">
          <h5>Please search with at least 3 characters.</h5>
        </div>
      );
    }
  }
}

function nameFormatter(cell, row) {
  return <Link to={`/professors/${row.id}`}>{`${row.last_name}, ${row.first_name}`}</Link>;
}

function courseNumberFormatter(cell, row) {
  return  <Link to={`/courses/${row.id}`}>{`${row.department} ${row.number}`}</Link>;
}

function courseTitleFormatter(cell, row) {
  return  <Link to={`/courses/${row.id}`}>{row.title}</Link>;
}

function mapStateToProps(state) {
  return {
    searchResults: state.searchResults
  };
}

export default connect(mapStateToProps, { setSearchResults })(SearchContent);
