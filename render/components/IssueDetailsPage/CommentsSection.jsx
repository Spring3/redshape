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
  margin-top: 0px;
  color: ${props => props.theme.minorText};

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
    background: ${props => props.theme.bg};
    box-shadow: 0px 0px 5px 0px ${props => props.theme.shadow};
    display: block;
    border-radius: 3px;
    margin: 20px;

    div.commentsHeader {
      display: flex;
      justify-content: space-between;
      padding: 10px 20px;
      border-bottom: 2px solid ${props => props.theme.bgDark};

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
  background: ${props => props.theme.bgDark};
  padding: 20px;
  border-radius: 3px;
  border: 2px solid ${props => props.theme.bgDark};
  #commentsForm {
    background: ${props => props.theme.bg};
    padding: 20px;
    border-radius: 3px;
    box-shadow: 0px 0px 10px ${props => props.theme.shadow};
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
                  <span className="username">{entry.user.name}</span>
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
