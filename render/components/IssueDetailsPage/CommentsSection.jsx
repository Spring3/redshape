import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { remote } from 'electron';

import MarkdownEditor, { MarkdownText } from '../MarkdownEditor';
import Link from '../Link';
import DateComponent from '../Date';

const Section = styled.section`
  background: white;
  padding: 20px;
  margin-bottom: 20px;
`;

const SmallNotice = styled.p`
  font-size: 12px;
  margin-top: 30px;
  color: ${props => props.theme.minorText};
  font-weight: bold;

  a {
    font-size: inherit !important;
    margin-right: 5px;
  }
`;

const Comments = styled.ul`
  list-style-type: none;
  padding: 20px 0px;
  margin: 0px;
  border-radius: 3px;
  background: ${props => props.theme.bgDark};
  
  li:first-child {
    margin-top: 20px;
  }

  li {
    margin: 40px 20px 20px 20px;
    display: flex;
    justify-content: space-around;

    div.commentsHeader {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      min-width: 20%;

      ${({theme}) => css`
        h3 {
          margin-top: 20px;
          margin-bottom: 20px;
          color: ${theme.main};
        }

        span:last-child {
          color: ${theme.minorText};
          transition: color ease ${theme.transitionTime};
          text-align: left;

          &:hover {
            color: ${theme.normalText};
          }
          margin-bottom: 20px;
        }
      `}

    }

    iframe {
      margin-left: 20px;
      padding: 5px 20px 0px 20px;
      background: ${props => props.theme.bg};
      border: 1px solid ${props => props.theme.bgDarker};
      border-radius: 3px;
      width: 74%;
      min-height: 100px;
    }
  }
`;

const CommentsForm = styled.div`
  background: ${props => props.theme.bgDark};
  padding: 20px;
  border-radius: 3px;
  border: 2px solid ${props => props.theme.bgDark};
  #commentsForm {
    background: ${props => props.theme.bg};
    padding: 20px;
    border-radius: 3px;
    border: 1px solid ${props => props.theme.bgDarker};
  }
`;

class CommentsSection extends Component {
  sendComments = (comments) => {
    if (comments) {
      const { issueId, publishComments } = this.props;
      publishComments(issueId, comments);
    }
  }

  render() {
    const { journalEntries } = this.props;
    return (
      <Section>
        <div>
          <h2>Comments</h2>
          <Comments>
            {journalEntries.map(entry => (
              <li key={entry.id}>
                <div className="commentsHeader">
                  <h3 className="username">{entry.user.name}</h3>
                  <DateComponent className="date" date={entry.created_on} />
                </div>
                <MarkdownText markdownText={entry.notes} />
              </li>
            ))}
          </Comments>
          <CommentsForm>
            <MarkdownEditor
              id="commentsForm"
              onSubmit={this.sendComments}
            />
            <div>
              <SmallNotice>
                Press&nbsp;
                {
                  remote.process.platform === 'darwin'
                    ? (<Link href="#">Cmd + Enter</Link>)
                    : (<Link href="#">Ctrl + Enter</Link>)
                }
                to send
              </SmallNotice>
            </div>
          </CommentsForm>
        </div>
      </Section>
    );
  }
}

CommentsSection.propTypes = {
  issueId: PropTypes.number.isRequired,
  journalEntries: PropTypes.arrayOf(PropTypes.shape({
    notes: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string.isRequired
    }).isRequired,
    created_on: PropTypes.string.isRequired
  }).isRequired).isRequired,
  publishComments: PropTypes.func.isRequired
};

export default CommentsSection;
