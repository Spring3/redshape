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

const EyeIconButton = styled(EyeIcon)`
  cursor: pointer;
  margin-left: 4px;
`;

const Grid = styled.div`
  display: grid;
  padding: 20px;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  margin-bottom: 60px;
`;

const Section = styled.section`
  background: white;
  padding: 0px 20px 20px 20px;
  border-radius: 5px;
`;

const IssuesSection = styled(Section)`
  grid-column: span 8;
  grid-row: auto;
`;

const OptionsGrid = styled.div`
  display: grid;
  // grid-template-columns: minmax(200px, auto) 1fr;
  grid-template-columns: auto;
  grid-template-rows: auto;
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  margin-bottom: 20px;
`;

const GridRow = styled.div`
  grid-column: 1/-1;
`;

class SummaryPage extends Component {
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
      <Grid>
        <IssuesSection>
          <h2>Settings</h2>
          <OptionsBlock />
          <ColumnHeadersSelect/>
          <Label label="Example view"></Label>
          <IssuesTable
            limit={10}
            onSort={this.onSort}
            fetchIssuePage={this.fetchIssues}
          />
        </IssuesSection>
      </Grid>
    );
  }
}

SummaryPage.propTypes = {
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
