import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { css, withTheme } from 'styled-components';
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
  margin: 0;
  margin-top: 0.5rem;
  color: ${props => props.theme.minorText};
  font-weight: bold;
  opacity: 0;
  height: auto;
  transition: opacity 1s, height 1s;

  a {
    font-size: inherit !important;
    margin-right: 5px;
  }
  &.visible {
    opacity: 1;
    height: auto;
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
      
      ${props => props.isEnhanced ? css`
      width: 300px;      
      ` : css`
      min-width: 20%;
      `}

    }

    iframe {
      margin-left: 20px;
      padding: 5px 20px 0px 20px;
      background: ${props => props.theme.bg};
      border: 1px solid ${props => props.theme.bgDarker};
      border-radius: 3px;
      min-height: 100px;
      
      ${props => (!props.isEnhanced) && css`
      width: 74%;
      `}
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
  constructor(props){
    super(props)
    this.state = {
      showNotice: false
    };
  }

  sendComments = (comments) => {
    if (comments) {
      const { issueId, publishComments } = this.props;
      publishComments(issueId, comments);
    }
  }

  render() {
    const { journalEntries, uiStyle } = this.props;
    const { showNotice } = this.state;
    return (
      <Section>
        <div>
          <h2>Comments</h2>
          <Comments isEnhanced={uiStyle === 'enhanced'}>
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
              onBlur={() => this.setState({ showNotice: false })}
              onFocus={() => this.setState({ showNotice: true })}
            />
            <div>
              <SmallNotice className={showNotice && 'visible'}>
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
  publishComments: PropTypes.func.isRequired,
  uiStyle: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  uiStyle: state.settings.uiStyle,
});

export default withTheme(connect(mapStateToProps)(CommentsSection));


