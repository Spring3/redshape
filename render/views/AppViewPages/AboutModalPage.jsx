import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';
import MagnifyIcon from 'mdi-react/MagnifyIcon';
import Button from "../../components/Button";

import EyeIcon from "mdi-react/EyeIcon";

import { IssueFilter } from '../../actions/helper';
import actions from '../../actions';
import { Input, Label } from '../../components/Input';
import IssuesTable from '../../components/SummaryPage/IssuesTable';
import OptionsBlock from '../../components/SettingsPage/OptionsBlock';
import ColumnHeadersSelect from '../../components/SummaryPage/ColumnHeadersSelect';

import AboutPage from "../../about/AboutPage";

class AboutModalPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: undefined,
      sortBy: undefined,
      sortDirection: undefined,
      showExampleView: false
    };

    this.deboucedFetch = debounce(this.fetchIssues, 500);
  }

  componentWillMount() {
    this.fetchIssues();
  }

  componentDidUpdate(oldProps) {
    if (oldProps.showClosedIssues !== this.props.showClosedIssues) {
      this.fetchIssues();
    }
  }

  fetchIssues = (page = 0) => {
    const { search, sortBy, sortDirection } = this.state;
    const { userId, showClosedIssues } = this.props;
    if (userId) {
      const queryFilter = new IssueFilter()
        .assignee(userId)
        .status({ open: true, closed: showClosedIssues })
        .title(search)
        .sort(sortBy, sortDirection)
        .build();
      this.props.fetchIssues(queryFilter, page);
    }
  }

  onSearchChange = (e) => {
    this.setState({
      search: e.target.value
    }, () => this.deboucedFetch());
  }

  onSort = (sortBy, sortDirection) => {
    this.setState({
      sortBy: sortBy,
      sortDirection: sortDirection
    }, () => this.deboucedFetch());
  }

  render() {
    const { theme } = this.props;
    return (
      <Modal
        open={!!isOpen}
        center={true}
      >
        <AboutPage></AboutPage>
      </Modal>
    );
  }
}

AboutModalPage.propTypes = {
  userId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  showClosedIssues: PropTypes.bool.isRequired,
  fetchIssues: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  userId: state.user.id,
  showClosedIssues: state.settings.showClosedIssues
});

const mapDispatchToProps = dispatch => ({
  fetchIssues: (filter, page) => dispatch(actions.issues.getPage(filter, page))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(SummaryPage));
