import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, Route, Routes } from 'react-router-dom';
import _get from 'lodash/get';
import moment from 'moment';

import { Navbar } from '../components/Navbar';
import { Timer } from '../components/Timer';
import { TimeEntryModal } from '../components/TimeEntryModal';
import DragArea from '../components/DragArea';

import { hoursToDuration } from '../datetime';
import { useOvermindActions, useOvermindState } from '../store';
import { NavbarContextProvider } from '../contexts/NavbarContext';
import { useFetchAll } from '../hooks/useFetchAll';
import { SummaryPage } from './AppViewPages/SummaryPage';
import IssueDetailsPage from './AppViewPages/IssueDetailsPage';
import { Project, Issue } from '../../types';

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
}

const AppView = () => {
  const [activities, setActivities] = useState([]);
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [timeEntry, setTimeEntry] = useState<any>(null);

  const navigate = useNavigate();
  const state = useOvermindState();
  const actions = useOvermindActions();

  const requestProjects = useCallback(({ limit, offset }) => actions.projects.getManyProjects({ limit, offset }), [actions.projects.getManyProjects]);
  const { items: projects, isFetching, error } = useFetchAll<Project>({ request: requestProjects });

  const onTrackingStop = ({ issue, recordedTime }: { issue: Issue, recordedTime: number }) => {
    const existingActivities = _get(projects[issue.project.id], 'activities', []);
    const hours = parseFloat((recordedTime / 3600000).toFixed(3));
    setActivities(existingActivities.map(({ id, name }: { id: string, name: string }) => ({ value: id, label: name })));
    setShowTimeEntryModal(true);
    setTimeEntry({
      activity: {},
      issue: {
        id: issue.id,
        name: issue.subject
      },
      hours,
      duration: hoursToDuration(hours),
      comments: '',
      project: {
        id: issue.project.id,
        name: issue.project.name
      },
      spent_on: moment().format('YYYY-MM-DD'),
      user: {
        id: state.users.currentUser?.id,
        name: `${state.users.currentUser?.firstName} ${state.users.currentUser?.lastName}`
      }
    });
  };

  const closeTimeEntryModal = () => {
    setShowTimeEntryModal(false);
    setTimeEntry(null);
    // resetTimer();
  };

  if (!state.users.currentUser) {
    navigate('../', { replace: true });
    return null;
  }

  return (
    <Grid>
      <DragArea />
      <NavbarContextProvider>
        <Navbar />
        <Content>
          <Routes>
            <Route path="/" element={<SummaryPage />} />
            <Route path="/:id" element={<IssueDetailsPage />} />
          </Routes>
          <Timer
            autoStart
            onStop={onTrackingStop}
          />
          <TimeEntryModal
            isOpen={showTimeEntryModal}
            activities={activities}
            isUserAuthor={true}
            timeEntry={timeEntry}
            initialVolatileContent={true}
            onClose={closeTimeEntryModal}
          />
        </Content>
      </NavbarContextProvider>
    </Grid>
  );
};

export { AppView };
