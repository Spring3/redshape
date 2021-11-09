import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import MagnifyIcon from 'mdi-react/MagnifyIcon';

import { Input } from '../../components/Input';
import { IssuesTable } from '../../components/SummaryPage/IssuesTable';
import { Flex } from '../../components/Flex';
import { useOvermindActions, useOvermindState } from '../../store';

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

const SummaryPage = () => {
  const [search, setSearch] = useState<string>('');

  const theme = useTheme();
  const state = useOvermindState();
  const actions = useOvermindActions();

  const onSearchChange = (e: any) => {
    setSearch(e.target.value);
  };

  const toggleClosedIssues = async () => {
    await actions.settings.update({
      ...state.settings,
      showClosedIssues: !state.settings.showClosedIssues
    });
  };

  return (
    <Grid>
      <IssuesSection>
        <h2>Issues assigned to me</h2>
        <OptionsGrid>
          <GridRow>
            <Flex alignItems="center">
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
              <label>
                <Input
                  type="checkbox"
                  checked={state.settings.showClosedIssues}
                  onChange={toggleClosedIssues}
                />
                <span>Include closed</span>
              </label>
            </Flex>
          </GridRow>
        </OptionsGrid>
        <IssuesTable search={search} />
      </IssuesSection>
    </Grid>
  );
};

export {
  SummaryPage
};
