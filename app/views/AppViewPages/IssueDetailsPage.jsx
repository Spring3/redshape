import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import styled from 'styled-components';
import moment from 'moment';

import actions from '../../actions';

const Grid = styled.div`
  display: grid;
  padding: 20px;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-auto-rows: 100px;
  grid-auto-flow: dense;
  grid-gap: 20px;
`;

const Section = styled.section`
  background: white;
  padding: 20px;
  border-radius: 5px;
`;

const MainSection = styled(Section)`
  grid-column: span 8;
  grid-row: span 6;
`;

const TimeSpentSection = styled(Section)`
  grid-column: span 3;
  grid-row: span 2;
`;

const ActivitySection = styled(Section)`
  grid-column: span 3;
  grid-row: span 4;
`;

const ColumnList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: auto;
  float: left;
  padding-right: 20px;

  li {
    columns: 2;
    padding: 5px 0px 5px 0px;
  }

  li div {
    width: 150px;
  }

  li div:first-child {
    font-weight: bold;
  }
`;

const SmallNotice = styled.p`
  font-size: 12px;
`;

const Wrapper = styled.div`
  display: inline-block;
  width: 100%;
`;

class IssueDetailsPage extends Component { 
  componentWillMount() {
    const { dispatch, match } = this.props;
    dispatch(actions.issues.get(match.params.id));
  }

  fetchIssues = () => {
    // const { dispatch, user } = this.props;
    // const queryFilter = new IssueFilter()
    //   .assignee(user.id)
    //   .status({ open: true})
    //   .build();
    // console.log(queryFilter);
    // dispatch(actions.issues.getAll(queryFilter))
    // .then(() => {
    //   this.setState({
    //     issues: this.props.issues
    //   });
    // });
    // redmineApi.issues.getAll(queryFilter)
    //   .then(({ data }) => {
    //     const { issues } = data;
    //     console.log(issues);
    //     if (Array.isArray(issues) && issues.length) {
    //       this.setState({
    //         issues: [...issues]
    //       });
    //       // storage.set(`${userId}.issuesAssignedToMe`, issues);
    //     }
    //   });
  }

  render() {
    const { issueDetails } = this.props;
    console.log(issueDetails);
    return issueDetails.id
    ? (
      <Grid>
        <MainSection>
          <h2>
            <span>#{issueDetails.id}&nbsp;</span>
            {issueDetails.subject}
          </h2>
          <SmallNotice>
            Created by
            <a href="#"> {issueDetails.author.name} </a>
            <span>{moment().diff(issueDetails.created_on, 'days')} day(s) ago</span>
          </SmallNotice>
          {issueDetails.closed_on && (
           <SmallNotice>Closed on <span>{issueDetails.closed_on}</span></SmallNotice> 
          )}
          <label>Status:</label>
          <ul>
            <li>Pending</li>
            <li>in-Test</li>
          </ul>
          <Wrapper>
            <ColumnList>
              <li>
                <div>Priority: </div>
                <div>{issueDetails.priority.name}</div>
              </li>
              <li>
                <div>Assignee: </div>
                <div>{issueDetails.assigned_to.name}</div>
              </li>
              <li>
                <div>Target version: </div>
                <div>{issueDetails.fixed_version.name}</div>
              </li>
              <li>
                <div>Due Date: </div>
                <div>{issueDetails.due_date}</div>
              </li>
              </ColumnList>
              <ColumnList>
              <li>
                <div>Tracker: </div>
                <div>{issueDetails.tracker.name}</div>
              </li>
              <li>
                <div>Estimated hours: </div>
                <div>{issueDetails.total_estimated_hours}</div>
              </li>
              <li>
                <div>Total time spent: </div>
                <div>{issueDetails.total_spent_hours}</div>
              </li>
              <li>
                <div>Time spent by me: </div>
                <div>{issueDetails.spent_hours}</div>
              </li>
            </ColumnList>
          </Wrapper>
          <span>% Done: {issueDetails.done_ratio}</span>
          <div>
            <h3>Description</h3>
            <pre>
              {issueDetails.description}
            </pre>
          </div>
        </MainSection>
        <TimeSpentSection>
          <h2>Time spent</h2>
        </TimeSpentSection>
        <ActivitySection>
          <h2>Activity Stack</h2>
        </ActivitySection>
      </Grid>
    )
    : null;
  }
}

IssueDetailsPage.propTypes = {
  issueDetails: PropTypes.object.isRequired
};

const mapStateToprops = state => ({
  issueDetails: state.issues.details.data
});

const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToprops, mapDispatchToProps)(IssueDetailsPage);
