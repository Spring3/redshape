import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { css, withTheme } from 'styled-components';
import { remote } from 'electron';

import SortAscendingIcon from 'mdi-react/SortAscendingIcon';
import SortDescendingIcon from 'mdi-react/SortDescendingIcon';
import EditIcon from 'mdi-react/EditIcon';

import MarkdownEditor, { MarkdownText } from '../MarkdownEditor';
import Link from '../Link';
import DateComponent from '../Date';
import Button from '../Button';

const Section = styled.section`
  background: white;
  padding: 20px;
  margin-bottom: 20px;
`;

const SmallNotice = styled.span`
  font-size: 12px;
  display: inline;
  margin: 0;
  margin-top: 0.5rem;
  margin-right: 0.5rem;
  color: ${props => props.theme.minorText};
  font-weight: bold;
  opacity: 0;
  height: 0;
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

      ${({ theme }) => css`
        h3 {
          margin-top: 20px;
          color: ${theme.main};
        }

        span:last-child {
          color: ${theme.minorText};
          transition: color ease ${theme.transitionTime};
          text-align: left;

          &:hover {
            color: ${theme.normalText};
          }
        }
      `}

      ${props => (props.isEnhanced ? css`
      width: 300px;
      ` : css`
      min-width: 20%;
      `)}

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
    padding-left: 22px;
    border-radius: 3px;
    border: 1px solid ${props => props.theme.bgDarker};

    &.editing {
      border-left: 3px solid ${props => props.theme.main};
      padding-left: 20px;
    }
  }
`;

const CommentsHeader = styled.div`
  display: inline-flex;
  justify-content: space-between;
  width: 100%;

  div:last-child {
    display: flex;
    button {
      margin-right: 0.5rem;
      &:last-child {
        margin-right: 0;
      }
    }
  }
`;

const FlexButton = styled(Button)`
  align-self: center;
`;

const Comment = styled.li`
  padding: 8px;
  transition: background-color 300ms;
  padding-left: 11px;

  ${props => props.editable && css`
  cursor: pointer;
  :hover {
    background-color: #EEEEEE;
    iframe {
      background-color: white;
    }
  }
  &.selected {
    background-color: #EEEEEE;
    border-left: 3px solid ${props => props.theme.main};
    padding-left: 8px;
  }
  `}
`;

class CommentsSection extends Component {
  constructor(props) {
    super(props);
    const { entries, timestamp } = props.journalEntries;
    const sortDescending = props.uiStyle === 'enhanced';
    this.state = {
      showNotice: false,
      sortDescending,
      timestamp,
      entries: sortDescending ? entries.reverse() : entries,
      selected: null,
      editorText: '',
      showEditor: false
    };
    this.editor = React.createRef();
  }

  componentDidUpdate(oldProps) {
    const { timestamp: oldTimestamp } = oldProps.journalEntries;
    const { volatile } = this.props;
    const { entries, timestamp } = this.props.journalEntries;
    if (oldTimestamp !== timestamp) {
      const { sortDescending } = this.state;
      let selected = null;
      let editorText = '';
      if (volatile) {
        const { oldVolatile } = oldProps;
        if (!oldVolatile || (volatile.comments !== oldVolatile.comments && volatile.commentId !== oldVolatile.commentId)) {
          selected = entries.find(el => el.id === volatile.commentId);
          editorText = volatile.comments;
        }
      }
      this.setState({
        entries: sortDescending ? entries.reverse() : entries,
        timestamp,
        selected,
        editorText,
      });
    }
  }

  sendComments = (comments) => {
    if (comments) {
      const { selected } = this.state;
      const { issueId, publishComments, publishUpdateComments } = this.props;
      if (selected) {
        if (selected.notes === comments) {
          this.setState({
            selected: null,
            editorText: ''
          });
        } else {
          publishUpdateComments(issueId, selected.id, comments);
        }
      } else {
        publishComments(issueId, comments);
      }
    }
  }

  removeComment = (comments) => {
    const { selected } = this.state;
    if (selected) {
      const { issueId, publishUpdateComments } = this.props;
      publishUpdateComments(issueId, selected.id, comments, true);
    }
  }

  toggleSortDirection = () => {
    const { sortDescending, entries } = this.state;
    const { current } = this.editor;
    this.setState({
      sortDescending: !sortDescending,
      entries: entries.reverse(),
      ...(current && { editorText: current.state.value })
    });
  }

  toggleEditor = () => {
    const { showEditor } = this.state;
    const { current } = this.editor;
    this.setState({
      showEditor: !showEditor,
      ...(current && { editorText: current.state.value })
    });
  }

  selectComment = (entry) => {
    const { selected, showEditor } = this.state;
    const sel = (selected && entry.id === selected.id) ? null : entry;
    this.setState({
      selected: sel,
      ...(sel ? {
        editorText: sel.notes,
        showEditor: !showEditor ? true : showEditor
      } : {
        editorText: ''
      })
    });
  }

  render() {
    const { uiStyle, areCommentsEditable } = this.props;
    const {
      showNotice, sortDescending, entries, selected, editorText, showEditor
    } = this.state;
    const anySelected = areCommentsEditable && selected != null;
    const isEnhanced = uiStyle === 'enhanced';
    const comments = (
      <Comments isEnhanced={isEnhanced}>
        {entries.map(entry => (
          <Comment key={entry.id} className={anySelected ? (selected.id === entry.id ? 'selected' : '') : ''} editable={areCommentsEditable} onClick={areCommentsEditable ? () => this.selectComment(entry) : undefined}>
            <div className="commentsHeader">
              <h3 className="username">{entry.user.name}</h3>
              <DateComponent className="date" date={entry.created_on} />
            </div>
            <MarkdownText markdownText={entry.notes} isEnhanced={isEnhanced} />
          </Comment>
        ))}
      </Comments>
    );
    const commentsForm = (
      <CommentsForm>
        <MarkdownEditor
          ref={this.editor}
          className={selected && 'editing'}
          initialValue={editorText}
          editing={selected}
          id="commentsForm"
          onSubmit={this.sendComments}
          onRemove={this.removeComment}
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
            to
            {' '}
            { selected ? 'update the selected comment' : 'send a new comment' }
.
          </SmallNotice>
        </div>
      </CommentsForm>
    );

    return (
      <Section>
        <div>
          <CommentsHeader>
            <h2>Comments</h2>
            <div>
              <FlexButton onClick={this.toggleEditor}>
                <EditIcon size={22} />
&nbsp;Editor
              </FlexButton>
              <FlexButton onClick={this.toggleSortDirection}>
                {sortDescending && (
                  <SortDescendingIcon size={22} />
                ) || (
                  <SortAscendingIcon size={22} />
                )
                }
              </FlexButton>
            </div>
          </CommentsHeader>
          { sortDescending ? (showEditor && commentsForm) : (comments) }
          { sortDescending ? (comments) : (showEditor && commentsForm) }
        </div>
      </Section>
    );
  }
}

CommentsSection.propTypes = {
  issueId: PropTypes.number.isRequired,
  journalEntries: PropTypes.shape({
    timestamp: PropTypes.object.isRequired,
    entries: PropTypes.arrayOf(PropTypes.shape({
      notes: PropTypes.string.isRequired,
      user: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string.isRequired
      }).isRequired,
      created_on: PropTypes.string.isRequired
    }).isRequired).isRequired
  }).isRequired,
  areCommentsEditable: PropTypes.bool.isRequired,
  publishComments: PropTypes.func.isRequired,
  publishUpdateComments: PropTypes.func.isRequired,
  uiStyle: PropTypes.string.isRequired,
  volatile: PropTypes.object
};

const mapStateToProps = state => ({
  uiStyle: state.settings.uiStyle,
  areCommentsEditable: state.settings.areCommentsEditable,
});

export default withTheme(connect(mapStateToProps)(CommentsSection));
