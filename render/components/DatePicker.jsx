import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';

import MenuLeftIcon from 'mdi-react/MenuLeftIcon';
import MenuRightIcon from 'mdi-react/MenuRightIcon';

import { Input } from './Input';

const StyledDatePicker = styled.div`
  .DayPicker {
    display: inline-block;
    font-size: 1rem;
  }

  .DayPicker-wrapper {
    position: relative;
    flex-direction: row;
    padding-bottom: 1em;

    user-select: none;
  }

  .DayPicker-Months {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .DayPicker-Month {
    display: table;
    margin: 0 1em;
    margin-top: 1em;
    border-spacing: 0;
    border-collapse: collapse;

    user-select: none;
  }

  .DayPicker-NavButton {
    position: absolute;
    top: 1em;
    right: 1.5em;
    left: auto;

    display: inline-block;
    margin-top: 2px;
    width: 1.25em;
    height: 1.25em;
    background-position: center;
    background-size: 50%;
    background-repeat: no-repeat;
    cursor: pointer;
  }

  .DayPicker-NavButton:hover {
    opacity: 0.8;
  }

  .DayPicker-NavButton--prev {
    margin-right: 1.5em;
    left: 1.5em;
    right: unset;
    background-image: url('data:image/svg+xml;utf8,${props => props.buttonLeft}');
    background-size: 1.5rem;
  }

  .DayPicker-NavButton--next {
    background-image: url('data:image/svg+xml;utf8,${props => props.buttonRight}');
    background-size: 1.5rem;
  }

  .DayPicker-NavButton--interactionDisabled {
    display: none;
  }

  .DayPicker-Caption {
    display: table-caption;
    margin-bottom: 0.5em;
    padding: 0 0.5em;
    text-align: center;
  }

  .DayPicker-Caption > div {
    font-weight: 500;
    font-size: 1.15em;
  }

  .DayPicker-Weekdays {
    display: table-header-group;
    margin-top: 1em;
  }

  .DayPicker-WeekdaysRow {
    display: table-row;
  }

  .DayPicker-Weekday {
    display: table-cell;
    padding: 0.5em;
    color: ${props => props.theme.normalText};
    font-weight: bold;
    text-align: center;
    font-size: 0.875em;
  }

  .DayPicker-Weekday abbr[title] {
    border-bottom: none;
    text-decoration: none;
  }

  .DayPicker-Body {
    display: table-row-group;
  }

  .DayPicker-Week {
    display: table-row;
  }

  .DayPicker-Day {
    display: table-cell;
    padding: 0.5em;
    border-radius: 50%;
    vertical-align: middle;
    text-align: center;
    cursor: pointer;
  }

  .DayPicker--interactionDisabled .DayPicker-Day {
    cursor: default;
  }

  .DayPicker-Footer {
    padding-top: 0.5em;
  }


  .DayPicker-Day--today {
    color: ${props => props.theme.main};
    font-weight: 700;
  }

  .DayPicker-Day--disabled {
    color: ${props => props.theme.minorText};
    cursor: default;
  }


  .DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside) {
    position: relative;
    background-color: ${props => props.theme.normalText};
    color: ${props => props.theme.hoverText};
    font-weight: bold;
  }


  .DayPicker:not(.DayPicker--interactionDisabled)
    .DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover {
      background-color: ${props => props.theme.bgDark};
      color: ${props => props.theme.normalText};
  }

  .DayPickerInput {
    display: inline-block;
  }

  .DayPickerInput-OverlayWrapper {
    position: relative;
    left: -30%;
    bottom: -5px;
  }

  .DayPickerInput-Overlay {
    position: absolute;
    left: 0;
    z-index: 1;

    background: ${props => props.theme.bg};
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }
`;

class DatePicker extends Component {
  render() {
    const { theme, value, name, isDisabled, onChange } = this.props;
    return (
      <StyledDatePicker
        buttonLeft={encodeURIComponent(renderToStaticMarkup(<MenuLeftIcon xmlns="http://www.w3.org/2000/svg" color={theme.normalText} />))}
        buttonRight={encodeURIComponent(renderToStaticMarkup(<MenuRightIcon xmlns="http://www.w3.org/2000/svg" color={theme.normalText} />))}
      >
        <DayPickerInput
          styles={this.styles}
          name={name}
          value={value}
          inputProps={{
            disabled: isDisabled
          }}
          disabled={isDisabled}
          placeholder={false}
          onDayChange={onChange}
          component={props => (<Input {...props} />)}
        />
      </StyledDatePicker>
    );
  }
}

DatePicker.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string
  ]),
  isDisabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  theme: PropTypes.object.isRequired
};

DatePicker.defaultProps = {
  value: new Date(),
  isDisabled: false,
  name: null
};

export default withTheme(DatePicker);
