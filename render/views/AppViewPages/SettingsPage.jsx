import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';

import { IssueFilter } from '../../actions/helper';
import actions from '../../actions';
import { Input, Label } from '../../components/Input';
import IssuesTable from '../../components/SummaryPage/IssuesTable';
import OptionsBlock from '../../components/SettingsPage/OptionsBlock';
import ColumnHeadersSelect from '../../components/SettingsPage/ColumnHeadersSelect';

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

class SettingsPage extends Component {
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

  onRefresh = () => {
    this.fetchIssues();
  }

  onSearchChange = (e) => {
    this.setState({
      search: e.target.value
    }, () => this.deboucedFetch());
  }

  onSort = (sortBy, sortDirection) => {
    this.setState({
      sortBy,
      sortDirection
    }, () => this.deboucedFetch());
  }

  render() {
    const { theme } = this.props;
    return (
      <Grid>
        <IssuesSection>
          <h2>Settings</h2>
          <OptionsBlock />
          <ColumnHeadersSelect />
          <Label label="Example view" />
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

SettingsPage.propTypes = {
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

export default withTheme(connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(SettingsPage));
