import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';

import Select from 'react-select';
import HelpCircleIcon from 'mdi-react/HelpCircleIcon';
import actions from '../../actions';
import { Input, Label } from '../Input';
import Tooltip from '../Tooltip';

import { availableOptions } from '../../settings';

const FlexRow = styled.div`
  display: flex;
`;

const DiscardLabel = styled.label`
  display: flex;
  align-items: center;
  margin-left: 1rem;
`;

const compSelectStyles = {
  container: base => ({ ...base, minWidth: 240 }),
};

const HelpIconStyled = styled(HelpCircleIcon)`
  padding-bottom: 1px;
`;
const LabelIcon = styled.span`
  margin-left: 0.2rem;
  color: #A0A0A0;
`;
const tooltipOptions = '- Advanced timer controls: timer and comment are modifiable at runtime.\n- Issue always editable: server will check permissions and update (or not).\n- Comments editable: needs server-side support to update notes (if valid permissions).\n- Custom Fields editable: needs server-side support to update them (if valid permissions).';
const tooltipCheckpoint = 'Save the state of the timer periodically to avoid losing temporary data\n(eg. killing/suspend/shutdown not working properly in your system).';
const OptionsInfo = (<LabelIcon><Tooltip position="right" text={tooltipOptions}><HelpIconStyled size={14} /></Tooltip></LabelIcon>);
const ProgressInfo = (<LabelIcon><Tooltip text="Use 10% unless you have server-side support."><HelpIconStyled size={14} /></Tooltip></LabelIcon>);
const TimerBehaviorInfo = (<LabelIcon><Tooltip text="Detect if the system is idle to pause the timer."><HelpIconStyled size={14} /></Tooltip></LabelIcon>);
const CheckpointInfo = (<LabelIcon><Tooltip text={tooltipCheckpoint}><HelpIconStyled size={14} /></Tooltip></LabelIcon>);

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-gap: 5px;
  grid-column-gap: 80px;

  @media (max-width: 1200px) {
    grid-template-columns: auto 1fr;
  }

  @media (max-width: 950px) {
    grid-template-columns: 1fr;
  }
`;

const OptionList = styled.div`
  label {
    display: block;
  }
  label:not(:last-child) {
    margin-bottom: 0.5rem;
  }
`;

class OptionsBlock extends Component {
  constructor(props) {
    super(props);
    const {
      uiStyle, idleBehavior, progressSlider, timerCheckpoint
    } = availableOptions;
    this.options = {
      uiStyle, idleBehavior, progressSlider, timerCheckpoint
    };
  }

  toggleShowAdvancedTimerControls = () => {
    const { settingsShowAdvancedTimerControls, showAdvancedTimerControls } = this.props;
    settingsShowAdvancedTimerControls(!showAdvancedTimerControls);
  }

  toggleIdleTimeDiscard = () => {
    const { settingsIdleTimeDiscard, idleTimeDiscard } = this.props;
    settingsIdleTimeDiscard(!idleTimeDiscard);
  }

  onUiStyleChange = (uiStyle) => {
    const { settingsUiStyle, fetchAvatar, avatar_id } = this.props;
    const { value } = uiStyle;
    if (value === 'enhanced' && avatar_id >= 0) {
      fetchAvatar(avatar_id);
    }
    settingsUiStyle(value);
  }

  onIdleBehaviorChange = (idleBehavior) => {
    const { settingsIdleBehavior } = this.props;
    settingsIdleBehavior(idleBehavior.value);
  }

  onProgressSliderChange = (progressSlider) => {
    const { settingsProgressSlider } = this.props;
    settingsProgressSlider(progressSlider.value);
  }

  toggleIssueAlwaysEditable = () => {
    const { settingsIssueAlwaysEditable, isIssueAlwaysEditable } = this.props;
    settingsIssueAlwaysEditable(!isIssueAlwaysEditable);
  }

  toggleCommentsEditable = () => {
    const { settingsCommentsEditable, areCommentsEditable } = this.props;
    settingsCommentsEditable(!areCommentsEditable);
  }

  toggleCustomFieldsEditable = () => {
    const { settingsCustomFieldsEditable, areCustomFieldsEditable, getFieldsData } = this.props;
    const nowAreCustomFieldsEditable = !areCustomFieldsEditable;
    settingsCustomFieldsEditable(nowAreCustomFieldsEditable);
    if (nowAreCustomFieldsEditable) {
      getFieldsData();
    }
  }

  onTimerCheckpointChange = (timerCheckpoint) => {
    const { settingsTimerCheckpoint } = this.props;
    settingsTimerCheckpoint(timerCheckpoint.value);
  }

  render() {
    const {
      showAdvancedTimerControls, uiStyle, idleBehavior, idleTimeDiscard, progressSlider, theme, isIssueAlwaysEditable, timerCheckpoint, areCommentsEditable, areCustomFieldsEditable
    } = this.props;
    const values = {
      idleBehavior, progressSlider, uiStyle, timerCheckpoint
    };
    const { options } = this;
    const selections = Object.fromEntries(Object.entries(options).map(([key, group]) => [key, group.find(el => el.value === values[key])]));
    const idleTimeDiscardDisabled = (idleBehavior === 'none');
    return (
      <Grid>
        <Label label="Options" rightOfLabel={OptionsInfo}>
          <OptionList>
            <label>
              <Input
                type="checkbox"
                checked={showAdvancedTimerControls}
                onChange={this.toggleShowAdvancedTimerControls}
              />
              <span>Use advanced timer controls</span>
            </label>
            <label>
              <Input
                type="checkbox"
                checked={isIssueAlwaysEditable}
                onChange={this.toggleIssueAlwaysEditable}
              />
              <span>Issue is always editable</span>
            </label>
            <label>
              <Input
                type="checkbox"
                checked={areCommentsEditable}
                onChange={this.toggleCommentsEditable}
              />
              <span>Comments are editable</span>
            </label>
            <label>
              <Input
                type="checkbox"
                checked={areCustomFieldsEditable}
                onChange={this.toggleCustomFieldsEditable}
              />
              <span>Custom fields are editable</span>
            </label>
          </OptionList>
        </Label>
        <Label htmlFor="idleBehavior" label="Timer behavior" rightOfLabel={TimerBehaviorInfo}>
          <FlexRow>
            <Select
              name="idleBehavior"
              options={options.idleBehavior}
              styles={compSelectStyles}
              value={selections.idleBehavior}
              onChange={this.onIdleBehaviorChange}
              isClearable={false}
              theme={defaultTheme => ({
                ...defaultTheme,
                borderRadius: 3,
                colors: {
                  ...defaultTheme.colors,
                  primary: theme.main,
                },
              })
            }
            />
            <DiscardLabel>
              <Input
                type="checkbox"
                checked={idleTimeDiscardDisabled ? false : idleTimeDiscard}
                disabled={idleTimeDiscardDisabled}
                onChange={this.toggleIdleTimeDiscard}
              />
              <span>Auto discard idle time from timer</span>
            </DiscardLabel>
          </FlexRow>
        </Label>
        <FlexRow>
          <Label htmlFor="checkpoint" label="Timer checkpoint" rightOfLabel={CheckpointInfo}>
            <Select
              name="checkpoint"
              options={options.timerCheckpoint}
              styles={compSelectStyles}
              value={selections.timerCheckpoint}
              onChange={this.onTimerCheckpointChange}
              isClearable={false}
              theme={defaultTheme => ({
                ...defaultTheme,
                borderRadius: 3,
                colors: {
                  ...defaultTheme.colors,
                  primary: theme.main,
                },
              })
              }
            />
          </Label>
        </FlexRow>
        <FlexRow>
          <Label htmlFor="progress" label="Progress values" rightOfLabel={ProgressInfo}>
            <Select
              name="progress"
              options={options.progressSlider}
              styles={compSelectStyles}
              value={selections.progressSlider}
              onChange={this.onProgressSliderChange}
              isClearable={false}
              theme={defaultTheme => ({
                ...defaultTheme,
                borderRadius: 3,
                colors: {
                  ...defaultTheme.colors,
                  primary: theme.main,
                },
              })
              }
            />
          </Label>
        </FlexRow>
        <FlexRow>
          <Label htmlFor="uiStyle" label="UI style">
            <Select
              name="uiStyle"
              options={options.uiStyle}
              styles={compSelectStyles}
              value={selections.uiStyle}
              onChange={this.onUiStyleChange}
              isClearable={false}
              theme={defaultTheme => ({
                ...defaultTheme,
                borderRadius: 3,
                colors: {
                  ...defaultTheme.colors,
                  primary: theme.main,
                },
              })
              }
            />
          </Label>
        </FlexRow>
      </Grid>
    );
  }
}

OptionsBlock.propTypes = {
  userId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  avatar_id: PropTypes.number,
  showClosedIssues: PropTypes.bool.isRequired,
  showAdvancedTimerControls: PropTypes.bool.isRequired,
  uiStyle: PropTypes.string.isRequired,
  idleBehavior: PropTypes.string.isRequired,
  idleTimeDiscard: PropTypes.bool.isRequired,
  progressSlider: PropTypes.string.isRequired,
  isIssueAlwaysEditable: PropTypes.bool.isRequired,
  areCommentsEditable: PropTypes.bool.isRequired,
  areCustomFieldsEditable: PropTypes.bool.isRequired,
  timerCheckpoint: PropTypes.string.isRequired,
  settingsShowAdvancedTimerControls: PropTypes.func.isRequired,
  settingsUiStyle: PropTypes.func.isRequired,
  settingsIdleBehavior: PropTypes.func.isRequired,
  settingsIdleTimeDiscard: PropTypes.func.isRequired,
  settingsProgressSlider: PropTypes.func.isRequired,
  settingsIssueAlwaysEditable: PropTypes.func.isRequired,
  settingsCommentsEditable: PropTypes.func.isRequired,
  settingsCustomFieldsEditable: PropTypes.func.isRequired,
  settingsTimerCheckpoint: PropTypes.func.isRequired,
  fetchAvatar: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  userId: state.user.id,
  avatar_id: state.user.avatar_id,
  showClosedIssues: state.settings.showClosedIssues,
  showAdvancedTimerControls: state.settings.showAdvancedTimerControls,
  uiStyle: state.settings.uiStyle,
  idleBehavior: state.settings.idleBehavior,
  idleTimeDiscard: state.settings.idleTimeDiscard,
  progressSlider: state.settings.progressSlider,
  isIssueAlwaysEditable: state.settings.isIssueAlwaysEditable,
  areCommentsEditable: state.settings.areCommentsEditable,
  areCustomFieldsEditable: state.settings.areCustomFieldsEditable,
  timerCheckpoint: state.settings.timerCheckpoint,
});

const mapDispatchToProps = dispatch => ({
  settingsShowAdvancedTimerControls: value => dispatch(actions.settings.setShowAdvancedTimerControls(value)),
  settingsUiStyle: value => dispatch(actions.settings.setUiStyle(value)),
  settingsIdleBehavior: value => dispatch(actions.settings.setIdleBehavior(value)),
  settingsIdleTimeDiscard: value => dispatch(actions.settings.setIdleTimeDiscard(value)),
  settingsProgressSlider: value => dispatch(actions.settings.setProgressSlider(value)),
  settingsIssueAlwaysEditable: value => dispatch(actions.settings.setIssueAlwaysEditable(value)),
  settingsCommentsEditable: value => dispatch(actions.settings.setCommentsEditable(value)),
  settingsCustomFieldsEditable: value => dispatch(actions.settings.setCustomFieldsEditable(value)),
  settingsTimerCheckpoint: value => dispatch(actions.settings.setTimerCheckpoint(value)),
  fetchAvatar: id => dispatch(actions.user.fetchAvatar(id)),
  getFieldsData: () => dispatch(actions.fields.getAll()),
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(OptionsBlock));
