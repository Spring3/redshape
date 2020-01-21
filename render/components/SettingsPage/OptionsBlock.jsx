import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import styled, {withTheme} from 'styled-components';

import actions from '../../actions';
import { Input, Label } from '../Input';
import Select from 'react-select';
import Tooltip from "../Tooltip";
import HelpCircleIcon from "mdi-react/HelpCircleIcon";

import { availableOptions } from "../../settings";

const FlexRow = styled.div`
  display: flex;
`;

const DiscardLabel = styled.label`
  display: flex;
  align-items: center;
`;

const compSelectStyles = {
  container: (base, state) => {
    return { ...base, minWidth: 240, marginRight: '1rem' };
  },
};

const HelpIconStyled = styled(HelpCircleIcon)`
  padding-bottom: 1px;
`;
const LabelIcon = styled.span`
  margin-left: 0.2rem;
  color: #A0A0A0;
`
const OptionsInfo = (<LabelIcon><Tooltip position="right" text="- Advanced timer controls: timer and comment are modifiable at runtime."><HelpIconStyled size={14}/></Tooltip></LabelIcon>)
const ProgressInfo = (<LabelIcon><Tooltip text="Use 10% unless you have server-side support."><HelpIconStyled size={14}/></Tooltip></LabelIcon>)
const TimerBehaviorInfo = (<LabelIcon><Tooltip text="Detect if the system is idle to pause the timer."><HelpIconStyled size={14}/></Tooltip></LabelIcon>)

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(auto, 400px) minmax(auto, 500px);
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 2fr;
  }
  
  @media (max-width: 950px) {
    grid-template-columns: 1fr;
  }
`;

class OptionsBlock extends Component {
  constructor(props){
    super(props);
    const { uiStyle, idleBehavior, progressSlider } = availableOptions;
    this.options = { uiStyle, idleBehavior, progressSlider };
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
    const { settingsUiStyle } = this.props;
    settingsUiStyle(uiStyle.value);
  }
  onIdleBehaviorChange = (idleBehavior) => {
    const { settingsIdleBehavior } = this.props;
    settingsIdleBehavior(idleBehavior.value);
  }
  onProgressSliderChange = (progressSlider) => {
    const { settingsProgressSlider } = this.props;
    settingsProgressSlider(progressSlider.value);
  }


  render() {
    const { showAdvancedTimerControls, uiStyle, idleBehavior, idleTimeDiscard, progressSlider, theme } = this.props;
    const values = {idleBehavior, progressSlider, uiStyle};
    const options = this.options;
    const selections = Object.fromEntries(Object.entries(options).map(([key, group]) => [key, group.find(el => el.value === values[key])]));
    const idleTimeDiscardDisabled = (idleBehavior === 'none') ? true : false;
    return (
      <Grid>
        <Label htmlFor="queryOptions" label="Options" rightOfLabel={OptionsInfo}>
          <div id="queryOptions">
            <label>
              <Input
                type="checkbox"
                checked={showAdvancedTimerControls}
                onChange={this.toggleShowAdvancedTimerControls}
              />
              <span>Use advanced timer controls</span>
            </label>
          </div>
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
            theme={(defaultTheme) => ({
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
          <Label htmlFor="progress" label="Progress values" rightOfLabel={ProgressInfo}>
            <Select
              name="progress"
              options={options.progressSlider}
              styles={compSelectStyles}
              value={selections.progressSlider}
              onChange={this.onProgressSliderChange}
              isClearable={false}
              theme={(defaultTheme) => ({
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
          <Label htmlFor="uiStyle" label="UI Style">
            <Select
              name="uiStyle"
              options={options.uiStyle}
              styles={compSelectStyles}
              value={selections.uiStyle}
              onChange={this.onUiStyleChange}
              isClearable={false}
              theme={(defaultTheme) => ({
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
  showClosedIssues: PropTypes.bool.isRequired,
  showAdvancedTimerControls: PropTypes.bool.isRequired,
  uiStyle: PropTypes.string.isRequired,
  idleBehavior: PropTypes.string.isRequired,
  idleTimeDiscard: PropTypes.bool.isRequired,
  progressSlider: PropTypes.string.isRequired,
  settingsShowAdvancedTimerControls: PropTypes.func.isRequired,
  settingsUiStyle: PropTypes.func.isRequired,
  settingsIdleBehavior: PropTypes.func.isRequired,
  settingsIdleTimeDiscard: PropTypes.func.isRequired,
  settingsProgressSlider: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  userId: state.user.id,
  showClosedIssues: state.settings.showClosedIssues,
  showAdvancedTimerControls: state.settings.showAdvancedTimerControls,
  uiStyle: state.settings.uiStyle,
  idleBehavior: state.settings.idleBehavior,
  idleTimeDiscard: state.settings.idleTimeDiscard,
  progressSlider: state.settings.progressSlider,
});

const mapDispatchToProps = dispatch => ({
  settingsShowAdvancedTimerControls: value => dispatch(actions.settings.setShowAdvancedTimerControls(value)),
  settingsUiStyle: value => dispatch(actions.settings.setUiStyle(value)),
  settingsIdleBehavior: value => dispatch(actions.settings.setIdleBehavior(value)),
  settingsIdleTimeDiscard: value => dispatch(actions.settings.setIdleTimeDiscard(value)),
  settingsProgressSlider: value => dispatch(actions.settings.setProgressSlider(value)),
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(OptionsBlock));
