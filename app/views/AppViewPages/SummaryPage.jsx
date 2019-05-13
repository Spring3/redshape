import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { IssueFilter } from '../../actions/helper';
import actions from '../../actions';
import { Input } from '../../components/Input';
import IssuesTable from '../../components/SummaryPage/IssuesTable';
import OptionsBlock from '../../components/SummaryPage/OptionsBlock';
import ColumnHeadersSelect from '../../components/SummaryPage/ColumnHeadersSelect';

const Grid = styled.div`
  display: grid;
  padding: 20px;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-auto-rows: 100px;
  grid-auto-flow: dense;
  grid-gap: 20px;
  margin-bottom: 60px;
`;

const Section = styled.section`
  background: white;
  padding: 0px 20px 20px 20px;
  border-radius: 5px;
`;

const IssuesSection = styled(Section)`
  grid-column: span 8;
  grid-row: span 6;
`;

const ActivitySection = styled(Section)`
  grid-column: span 3;
  grid-row: span 4;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, auto) 1fr;
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
      sortDirection: undefined
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
    const queryFilter = new IssueFilter()
      .assignee(userId)
      .status({ open: true, closed: showClosedIssues })
      .title(search)
      .sort(sortBy, sortDirection)
      .build();
    this.props.fetchIssues(queryFilter, page);
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
    return (
      <Grid>
        <IssuesSection>
          <h2>Issues assigned to me</h2>
          <OptionsGrid>
            <OptionsBlock />
            <ColumnHeadersSelect />
            <GridRow>
              <Input
                type="text"
                name="search"
                placeholder="Search"
                onChange={this.onSearchChange}
              />
            </GridRow>
          </OptionsGrid>
          <IssuesTable
            onSort={this.onSort}
            fetchIssuePage={this.fetchIssues}
          />
        </IssuesSection>
        <ActivitySection>
          <h2>Activity Stack</h2>
        </ActivitySection>
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
  fetchIssues: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  userId: state.user.id,
  showClosedIssues: state.settings.showClosedIssues
});

const mapDispatchToProps = dispatch => ({
  fetchIssues: (filter, page) => dispatch(actions.issues.getPage(filter, page))
});

export default connect(mapStateToProps, mapDispatchToProps)(SummaryPage);
