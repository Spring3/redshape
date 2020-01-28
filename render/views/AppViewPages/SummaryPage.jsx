import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';
import MagnifyIcon from 'mdi-react/MagnifyIcon';

import { IssueFilter } from '../../actions/helper';
import actions from '../../actions';
import { Input } from '../../components/Input';
import IssuesTable from '../../components/SummaryPage/IssuesTable';

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
  grid-template-columns: 1fr minmax(80px, auto);
  // grid-template-columns: auto auto;
  grid-template-rows: auto;
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  margin-bottom: 20px;

  // background-color: #EFEFEF;
  // border-radius: 4px;
  // border: 1px solid #A0A0A0;
`;

const Box = styled.div`
  align-self: center;
`;

class SummaryPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: undefined,
      sortBy: undefined,
      sortDirection: undefined,
      searchIncludeID: false
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
      const showByAuthor = this.props.mode === 'author';
      let queryFilter = new IssueFilter();
      if (showByAuthor) {
        queryFilter = queryFilter.author(userId);
      } else {
        queryFilter = queryFilter.assignee(userId);
      }
      queryFilter = queryFilter
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

  toggleClosedIssuesDisplay = () => {
    const { settingsShowClosedIssues, showClosedIssues } = this.props;
    settingsShowClosedIssues(!showClosedIssues);
  }

  render() {
    const { theme, showClosedIssues, mode } = this.props;
    return (
      <Grid>
        <IssuesSection>
          <h2>
            { mode === 'author' ? 'Issues created by me' : 'Issues assigned to me'}
          </h2>
          <OptionsGrid>
            <Input
              icon={(
                <MagnifyIcon
                  xmlns="http://www.w3.org/2000/svg"
                  color={theme.main}
                />
)}
              type="text"
              name="search"
              placeholder="Search..."
              onChange={this.onSearchChange}
            />
            <Box>
              <label>
                <Input
                  type="checkbox"
                  checked={showClosedIssues}
                  onChange={this.toggleClosedIssuesDisplay}
                />
                <span>Closed</span>
              </label>
            </Box>
          </OptionsGrid>
          <IssuesTable
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
  theme: PropTypes.object.isRequired,
  settingsShowClosedIssues: PropTypes.func.isRequired,
  mode: PropTypes.string,
};

const mapStateToProps = state => ({
  userId: state.user.id,
  showClosedIssues: state.settings.showClosedIssues
});

const mapDispatchToProps = dispatch => ({
  fetchIssues: (filter, page) => dispatch(actions.issues.getPage(filter, page)),
  settingsShowClosedIssues: value => dispatch(actions.settings.setShowClosedIssues(value)),
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(SummaryPage));
