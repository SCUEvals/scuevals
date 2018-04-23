import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';

class RelatedInfo extends Component {
  static propTypes = {
    departmentsList: PropTypes.object.isRequired,
    info: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
  }

  sortCourseTitles(a, b, order) {
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

  courseFormatter(cell, row) {
    return <Link to={`/courses/${row.id}`}>{row.course}</Link>;
  }

  courseTitleFormatter(cell, row) {
    return <Link to={`/courses/${row.id}`}>{row.title}</Link>;
  }

  nameFormatter(cell, row) {
    return <Link to={`/professors/${row.id}`}>{row.name}</Link>;
  }

  render() {
    const { type, info, departmentsList } = this.props;
    const coursesColumns = [
      {
        dataField: 'course',
        text: 'Course',
        formatter: this.courseFormatter,
        sort: true,
        sortFunc: this.sortCourseTitles,
        dataAlign: 'center',
      },
      {
        dataField: 'title',
        text: 'Title',
        formatter: this.courseTitleFormatter,
        sort: true,
        dataAlign: 'center',
      },
    ];

    const professorsColumns = [
      {
        dataField: 'name',
        text: 'Name',
        formatter: this.nameFormatter,
        sort: true,
        dataAlign: 'center',
      },
    ];

    const labeledInfo = info.slice();
    labeledInfo.map((obj) => {
      if (type === 'professors') {
        obj.course = `${departmentsList.object[obj.department_id].abbr} ${obj.number}`;
        obj.key = obj.course + obj.title;
      } else {
        obj.name = `${obj.last_name}, ${obj.first_name}`;
      }
    });

    return (
      type === 'professors' ?
        <div className="widget">
          <BootstrapTable
            ref={node => this.table = node}
            data={labeledInfo}
            columns={coursesColumns}
            keyField="key"
            withoutTabIndex
            version="4"
            striped
            hover
          />
        </div>
        : <div className="widget">
          <BootstrapTable
            ref={node => this.table = node}
            data={labeledInfo}
            columns={professorsColumns}
            keyField="name"
            withoutTabIndex
            version="4"
            striped
            hover
          />
        </div>
    );
  }
}

export default RelatedInfo;
