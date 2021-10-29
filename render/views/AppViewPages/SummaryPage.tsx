import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { connect } from 'react-redux';
import styled, { useTheme } from 'styled-components';
import MagnifyIcon from 'mdi-react/MagnifyIcon';

import { IssueFilter } from '../../actions/helper';
import actions from '../../actions';
import { Input } from '../../components/Input';
import IssuesTable from '../../components/SummaryPage/IssuesTable';
import OptionsBlock from '../../components/SummaryPage/OptionsBlock';
import ColumnHeadersSelect from '../../components/SummaryPage/ColumnHeadersSelect';
import { useOvermindState } from '../../store';

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
  grid-template-columns: minmax(200px, auto) 1fr;
  grid-template-rows: auto;
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  margin-bottom: 20px;
`;

const GridRow = styled.div`
  grid-column: 1/-1;
`;

const SummaryPage = ({ showClosedIssues, fetchIssues }: any) => {
  const [search, setSearch] = useState();
  const [sortBy, setSortBy] = useState();
  const [sortDirection, setSortDirection] = useState();

  const state = useOvermindState();
  const theme = useTheme();

  const sendFetchIssues = (page = 0) => {
    if (state.users.currentUser?.id) {
      const queryFilter = new IssueFilter()
        .assignee(state.users.currentUser?.id as string)
        .status({ open: true, closed: showClosedIssues })
        .title(search)
        .sort(sortBy, sortDirection)
        .build();
      fetchIssues(queryFilter, page);
    }
  }

  const deboucedFetch = debounce(sendFetchIssues, 500);

  useEffect(() => {
    sendFetchIssues();
  }, [showClosedIssues]);

  useEffect(() => {
    deboucedFetch();
  }, [search, sortBy, sortDirection]);

  const onSearchChange = (e: any) => {
    setSearch(e.target.value);
  }

  const onSort = (sortBy: any, sortDirection: any) => {
    setSortBy(sortBy);
    setSortDirection(sortDirection);
  }

    return (
      <Grid>
        <IssuesSection>
          <h2>Issues assigned to me</h2>
          <OptionsGrid>
            <OptionsBlock />
            <ColumnHeadersSelect />
            <GridRow>
              <Input
                icon={(
                  <MagnifyIcon
                    xmlns="http://www.w3.org/2000/svg"
                    color={(theme as any).main}
                  />
                )}
                type="text"
                name="search"
                placeholder="Search..."
                onChange={onSearchChange}
              />
            </GridRow>
          </OptionsGrid>
          <IssuesTable
          // @ts-expect-error
            onSort={onSort}
            fetchIssuePage={sendFetchIssues}
          />
        </IssuesSection>
      </Grid>
    );
};

SummaryPage.propTypes = {
  showClosedIssues: PropTypes.bool.isRequired,
  fetchIssues: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired
};

const mapStateToProps = (state: any) => ({
  showClosedIssues: state.settings.showClosedIssues
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchIssues: (filter: any, page: any) => dispatch(actions.issues.getPage(filter, page))
});

export default connect(mapStateToProps, mapDispatchToProps)(SummaryPage);
