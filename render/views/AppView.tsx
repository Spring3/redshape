import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import _get from 'lodash/get';
import moment from 'moment';
// eslint-disable-next-line
import { ipcRenderer } from 'electron';

import actions from '../actions';
import { Navbar } from '../components/Navbar';
import Timer from '../components/Timer';
import { SummaryPage } from './AppViewPages/SummaryPage';
import IssueDetailsPage from './AppViewPages/IssueDetailsPage';
import TimeEntryModal from '../components/TimeEntryModal';
import DragArea from '../components/DragArea';

import { hoursToDuration } from '../datetime';
import { useOvermindState } from '../store';
import { NavbarContextProvider } from '../contexts/NavbarContext';

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
  getProjectData: () => void;
  projects: any[];
  resetTimer: () => void;
  history: any;
  match: any;
}

const AppView = ({
  getProjectData, projects, resetTimer, history, match
}: AppViewProps) => {
  const [activities, setActivities] = useState([]);
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [timeEntry, setTimeEntry] = useState<any>(null);

  const state = useOvermindState();

  useEffect(() => {
    ipcRenderer.send('menu', { settings: {} });

    return () => {
      getProjectData();
    };
  }, []);

  const onTrackingStop = (trackedIssue: any, value: any, comments: any) => {
    const existingActivities = _get(projects[trackedIssue.project.id], 'activities', []);
    const hours = parseFloat((value / 3600000).toFixed(3));
    setActivities(existingActivities.map(({ id, name }: { id: string, name: string }) => ({ value: id, label: name })));
    setShowTimeEntryModal(true);
    setTimeEntry({
      activity: {},
      issue: {
        id: trackedIssue.id,
        name: trackedIssue.subject
      },
      hours,
      duration: hoursToDuration(hours),
      comments: comments || '',
      project: {
        id: trackedIssue.project.id,
        name: trackedIssue.project.name
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
    resetTimer();
  };

  return (
    <Grid>
      <DragArea />
      {!state.users.currentUser && (<Redirect to="/" />)}
      <NavbarContextProvider>
        <Navbar />
        <Content>
          <Route exact path={`${match.path}/`} component={(props: any) => <SummaryPage {...props} />} />
          <Route path={`${match.path}/issue/:id`} component={(props: any) => <IssueDetailsPage {...props} />} />
          <Timer
            onStop={onTrackingStop}
            history={history}
          />
          <TimeEntryModal
            isOpen={showTimeEntryModal}
            isEditable={true}
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

const mapStateToProps = (state: any) => ({
  projects: state.projects.data,
});

const mapDispatchToProps = (dispatch: any) => ({
  getProjectData: () => dispatch(actions.projects.getAll()),
  resetTimer: () => dispatch(actions.tracking.trackingReset())
});

export default connect(mapStateToProps, mapDispatchToProps)(AppView);
