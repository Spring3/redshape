import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

import actions from '../../actions';
import { Input, Label } from '../Input';

const MarginedDiv = styled.div`
  margin-top: 10px;
`;

class OptionsBlock extends Component {
  toggleClosedIssuesDisplay = () => {
    const { settingsShowClosedIssues, showClosedIssues } = this.props;
    settingsShowClosedIssues(!showClosedIssues);
  }

  toggleUseColors = () => {
    const { settingsUseColors, useColors } = this.props;
    settingsUseColors(!useColors);
  }

  render() {
    const { showClosedIssues, useColors } = this.props;
    return (
      <div>
        <Label htmlFor="queryOptions" label="Options">
          <div id="queryOptions">
            <label>
              <Input
                type="checkbox"
                checked={showClosedIssues}
                onChange={this.toggleClosedIssuesDisplay}
              />
              <span>Include Closed</span>
            </label>
          </div>
        </Label>
        <MarginedDiv>
          <label>
            <Input
              type="checkbox"
              checked={useColors}
              onChange={this.toggleUseColors}
            />
            <span>Use Colors</span>
          </label>
        </MarginedDiv>
      </div>
    );
  }
}

OptionsBlock.propTypes = {
  showClosedIssues: PropTypes.bool.isRequired,
  useColors: PropTypes.bool.isRequired,
  settingsShowClosedIssues: PropTypes.func.isRequired,
  settingsUseColors: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  showClosedIssues: state.settings.showClosedIssues,
  useColors: state.settings.useColors
});

const mapDispatchToProps = (dispatch) => ({
  settingsShowClosedIssues: (value) => dispatch(actions.settings.setShowClosedIssues(value)),
  settingsUseColors: (value) => dispatch(actions.settings.setUseColors(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(OptionsBlock);
