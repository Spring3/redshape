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
  margin-bottom: 60px;
`;

const SmallNotice = styled.p`
  font-size: 12px;
  margin-top: 0px;
  color: ${props => props.theme.minorText};

  a {
    font-size: inherit !important;
    margin-right: 5px;
  }
`;

const Comments = styled.ul`
  list-style-type: none;
  padding: 0;
  
  li {
    background: ${props => props.theme.bgDark};
    display: block;
    border-radius: 3px;
    margin-bottom: 20px;

    div.commentsHeader {
      display: flex;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 2px solid ${props => props.theme.bg};

      ${({theme}) => css`
        span:first-child {
          font-weight: bold;
          color: ${theme.normalText};
        }

        span:last-child {
          font-weight: bold;
          color: ${theme.minorText};
          transition: color ease ${theme.transitionTime};
          text-align: center;

          &:hover {
            color: ${theme.normalText};
          }
        }
      `}

    }

    iframe {
      padding: 5px 20px 0px 20px;
    }
  }
`;

const CommentsForm = styled.div`
  margin-top: 40px;
  padding: 20px;
  border-radius: 3px;
  border: 2px solid ${props => props.theme.bgDark};
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
                  <span className="username">{entry.user.name}</span>
                  <DateComponent className="date" date={entry.created_on} />
                </div>
                <MarkdownText markdownText={entry.notes} />
              </li>
            ))}
          </Comments>
          <CommentsForm>
            <MarkdownEditor
              onSubmit={this.sendComments}
            />
            <p>
              <SmallNotice>
                Press&nbsp;
                {
                  remote.process.platform === 'darwin'
                    ? (<Link href="#">Cmd + Enter</Link>)
                    : (<Link href="#">Ctrl + Enter</Link>)
                }
                to send
              </SmallNotice>
            </p>
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
