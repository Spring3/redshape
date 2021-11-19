import React, { useEffect, useState } from 'react';
import { css } from '@emotion/react';

import { debounce } from 'lodash';
import { Input } from '../../components/Input';
import { IssuesTable } from '../../components/SummaryPage/IssuesTable';
import { Flex } from '../../components/Flex';
import { useOvermindActions, useOvermindState } from '../../store';
import { useNavbar } from '../../contexts/NavbarContext';

const SummaryPage = () => {
  const [search, setSearch] = useState<string>('');

  const state = useOvermindState();
  const actions = useOvermindActions();
  const navbarState = useNavbar();

  useEffect(() => {
    navbarState.setTitle('My Backlog');
  }, [navbarState.setTitle]);

  const onSearchChange = debounce((e: any) => {
    setSearch(e.target.value);
  }, 200);

  const toggleClosedIssues = async () => {
    await actions.settings.update({
      ...state.settings,
      showClosedIssues: !state.settings.showClosedIssues
    });
  };

  return (
    <Flex
      css={css`
        margin-bottom: 2rem;
        margin-top: 2rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      `}
      direction="column"
    >
      <Flex
        grow="100%"
        css={css`
          padding-left: 1rem;
          padding-right: 1rem;
          margin-bottom: 1.5rem;
        `}
        gap="1rem"
        alignItems="center"
      >
        <div css={css`width: 250px`}>
          <Input type="text" name="search" placeholder="Search..." onChange={onSearchChange} />
        </div>
        <div css={css`margin-left: 1rem;`}>
          <label>
            <Input
              type="checkbox"
              checked={state.settings.showClosedIssues}
              onChange={toggleClosedIssues}
            />
            <span>Include closed</span>
          </label>
        </div>
      </Flex>
      <IssuesTable search={search} />
    </Flex>
  );
};

export { SummaryPage };
