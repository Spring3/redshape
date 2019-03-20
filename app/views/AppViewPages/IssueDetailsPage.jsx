import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import styled from 'styled-components';

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

class IssueDetailsPage extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      issues: props.issues
      // issues: storage.get(`${id}.issuesAssignedToMe`, []),
    };
  }

  componentWillMount() {
    console.log(this.props.history);
    this.fetchIssues();
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
    return (
      <Grid>
        <MainSection>
          <h2>Issue Details</h2>
          <div>
          </div>
        </MainSection>
        <TimeSpentSection>
          <h2>Time spent</h2>
        </TimeSpentSection>
        <ActivitySection>
          <h2>Activity Stack</h2>
        </ActivitySection>
      </Grid>
    );
  }
}

IssueDetailsPage.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    api_key: PropTypes.string.isRequired,
    firstname: PropTypes.string.isRequired,
    lastname: PropTypes.string.isRequired,
    redmineEndpoint: PropTypes.string.isRequired
  }).isRequired
};

const mapStateToprops = state => ({
  user: state.user,
  issues: state.issues.all.data
});

const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToprops, mapDispatchToProps)(IssueDetailsPage);
