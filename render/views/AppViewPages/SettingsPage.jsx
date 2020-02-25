import React, { Component, Fragment } from 'react';
import moment from 'moment';
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
import Link from '../../components/Link';

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

const SettingsSection = styled(Section)`
  grid-column: span 8;
  grid-row: auto;
`;

const Title = styled.h2`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SmallNotice = styled.div`
  font-size: 12px;
  margin-top: 0px;
  color: ${props => props.theme.minorText};

  margin-block-start: 1em;
  margin-block-end: 1em;

  a {
    font-size: inherit !important;
    margin: 0 5px;
  }
`;

const Logs = styled.div`
  display: grid;
  grid-template-columns: minmax(100px, 150px) minmax(150px, auto) auto;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
  color: #888;
  word-break: break-word;

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
    const {
      uiStyle, redmineEndpoint, logs, theme
    } = this.props;
    return (
      <Grid>
        <SettingsSection>
          <Title>
Settings
            { uiStyle === 'enhanced' && (<SmallNotice><Link clickable={true} type="external" href={`${redmineEndpoint}`}>{redmineEndpoint}</Link></SmallNotice>) }
          </Title>
          <OptionsBlock />
          <ColumnHeadersSelect />
          <Label label="Example view" />
          <IssuesTable
            limit={10}
            onSort={this.onSort}
            fetchIssuePage={this.fetchIssues}
          />
          { logs && logs.length ? (
            <Fragment>
              <h4 style={{ color: theme.main }}>Logs</h4>
              <Logs>
                <strong>Date</strong>
                <strong>Message</strong>
                <strong>Detail</strong>
                { logs && (
                  logs.map((el, i) => {
                    const { date, message } = el;
                    let { detail } = el;
                    if (detail && typeof detail === 'object') {
                      detail = JSON.stringify(detail, null, 2);
                    }
                    return (
                      <Fragment key={i}>
                        <span>{date}</span>
                        <span>{message || ''}</span>
                        <span>{detail || ''}</span>
                      </Fragment>
                    );
                  })
                )}
              </Logs>
            </Fragment>
          ) : undefined }
        </SettingsSection>
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
  theme: PropTypes.object.isRequired,
  uiStyle: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  userId: state.user.id,
  redmineEndpoint: state.user.redmineEndpoint,
  showClosedIssues: state.settings.showClosedIssues,
  uiStyle: state.settings.uiStyle,
  logs: state.session.log,
});

const mapDispatchToProps = dispatch => ({
  fetchIssues: (filter, page) => dispatch(actions.issues.getPage(filter, page)),
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(SettingsPage));
