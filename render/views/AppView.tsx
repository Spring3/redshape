import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, Route, Routes } from 'react-router-dom';

import { Navbar } from '../components/Navbar';
import { TimeEntryModal } from '../components/TimeEntryModal';
import { DragArea } from '../components/DragArea';

import { useOvermindActions, useOvermindState } from '../store';
import { NavbarContextProvider } from '../contexts/NavbarContext';
import { useFetchAll } from '../hooks/useFetchAll';
import { SummaryPage } from './SummaryPage';
import { IssueDetailsPage } from './IssueDetailsPage';
import { IssueStatus } from '../../types';
import { ModalContextProvider } from '../contexts/ModalContext';
import { TimerContextProvider } from '../contexts/TimerContext';

const Grid = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: 60px auto 80px;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
`;

const Content = styled.div`
  grid-column: span 12;
  grid-row: 2 / -1;
`;

type AppViewProps = {
  // resetTimer: () => void;
};

const AppView = () => {
  const navigate = useNavigate();
  const state = useOvermindState();
  const actions = useOvermindActions();

  const requestIssueStatuses = useCallback(
    ({ limit, offset }) => actions.issueStatuses.getAll({ limit, offset }),
    [actions.issueStatuses.getAll]
  );

  useFetchAll<IssueStatus>({ request: requestIssueStatuses });

  if (!state.users.currentUser) {
    navigate('../', { replace: true });
    return null;
  }

  return (
    <Grid>
      <DragArea />
      <ModalContextProvider>
        <NavbarContextProvider>
          <TimerContextProvider>
            <Navbar />
            <Content>
              <Routes>
                <Route path="/" element={<SummaryPage />} />
                <Route path="/:id" element={<IssueDetailsPage />} />
              </Routes>
            </Content>
          </TimerContextProvider>
        </NavbarContextProvider>
      </ModalContextProvider>
    </Grid>
  );
};

export { AppView };
