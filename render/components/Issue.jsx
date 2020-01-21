import React, { Component } from 'react';
import styled, { withTheme, css } from 'styled-components';

import ArrowLow from "mdi-react/ChevronDownCircleOutlineIcon";
import ArrowNormal from "mdi-react/ChevronRightCircleOutlineIcon";
import ArrowHigh from "mdi-react/ChevronUpCircleOutlineIcon";
import ArrowUrgent from "mdi-react/ArrowTopDropCircleOutlineIcon";
import ArrowImmediate from "mdi-react/ArrowTopBoldCircleOutlineIcon";

import Link from './Link';
import {withRouter} from "react-router-dom";

const PrioritySpan = styled.span`
  display: flex;
  align-items: center;
  svg {
    margin-right: 4px;
  }
  color: ${props => props.color};
  justify-content: ${props => props.centered ? 'center' : 'left'};
`;

class PriorityComponent extends Component {
  constructor(props){
    super(props)
  }

  render(){
    const { theme, value, centered } = this.props;
    // const { theme } = this.props;
    let icon;
    let textColor;
    switch(value){
      case 'Low': { icon = <ArrowLow color={theme.green} size={20}/>; } break
      case 'High': { icon = <ArrowHigh color={theme['yellow-red']} size={20}/>; } break
      case 'Urgent': { textColor = theme['yellow-red']; icon = <ArrowUrgent color={theme.red} size={20}/>; } break
      case 'Immediate': { textColor = theme.red; icon = <ArrowImmediate color={theme.red} color="red" size={20}/>; } break
      default: { icon = <ArrowNormal color={theme.cyan} size={20}/>; }
    }
    return (<PrioritySpan centered={centered} color={textColor}>{icon}{value}</PrioritySpan>);
  }
};

const IdLink = styled(Link)`
    &::before {
      color: #BBBBBB;
      content: '#';
    }
    font-weight: bold;
    padding: 0 6px;
    margin-right: 0.5rem;
    border-radius: 2px 6px 6px 2px;
    color: white;
    background-color: #888888;
      
    &.tracker-1 {
      &::before {
        color: ${props => props.theme.lightRed};
      }
      background-color: ${props => props.theme.darkRed};
    }
    &.tracker-2 {
      &::before {
        color: ${props => props.theme.lightBlue};
      }
      background-color: ${props => props.theme.darkBlue};
    }
    &.tracker-3 {
      &::before {
        color: ${props => props.theme.lightGreen};
      }
      background-color: ${props => props.theme.darkGreen};
    }
    &.tracker-4 {
      &::before {
        color: ${props => props.theme.lightViolet};
      }
      background-color: ${props => props.theme.darkViolet};
    }
    &.tracker-5 {
      &::before {
        color: ${props => props.theme.lightOrange};
      }
      background-color: ${props => props.theme.darkOrange};
    }
  }
`

class IdComponent extends Component {
  constructor(props){
    super(props)
  }

  render() {
    const { theme, history, value, tracker, fontSize, clickable, mode } = this.props;
    return (mode === 'plain' ? (<Link onClick={clickable ? () => history.push(`/app/issue/${value}/`) : undefined}>{`#${value}`}</Link>) : (<IdLink fontSize={fontSize || "inherit"} className={`tracker-${tracker}`} onClick={clickable ? () => history.push(`/app/issue/${value}/`) : undefined}>{`${value}`}</IdLink>));
  }
};

const StatusSpan = styled.span`
    
  ${props => props.simple ? css`
    color: #614BA6;
    &.Closed {
      color: ${props.theme.red};
    }
    &.New {
      color: ${props.theme.darkBlue};
    }
  ` : css`
    font-weight: bold;
    background-color: #614BA6;
    padding: 1px 8px;
    border-radius: 3px;
    color: white;
    text-transform: uppercase;
    font-size: 13px;
    
    &.Closed {
      background-color: ${props.theme.red};
    }
    &.New {
      background-color: ${props.theme.darkBlue};
    }
  `}
  
`;

class StatusComponent extends Component {
  constructor(props){
    super(props)
  }

  render() {
    const { style, value, simple } = this.props;
    return (<StatusSpan simple={simple} className={`${value}`}>{value}</StatusSpan>);
  }
}

const TagSpan = styled.span`
  // margin-right: 0.5rem;
  margin: 0.2rem 0.2rem 0.2rem 0;
  font-size: 13px;
  ${props => props.mode !== 'plain' && css`
  background-color: #EFEFEF;
  ${props => props.mode === 'simple' ? css`
  padding: 1px 3px;
  border-radius: 5px;
  ` : css`
  padding: 0.2rem 0.3rem;
  border-radius: 5px;
  `}
  `}
`;

class TagComponent extends Component {
  constructor(props){
    super(props)
  }

  render() {
    const { value, mode } = this.props;
    return (<TagSpan mode={mode}>{value}</TagSpan>);
  }
}

const TagContainerComponent = styled.div`
  display: flex;
  flex-wrap: wrap;
`

export const Priority = withTheme(PriorityComponent);
export const IssueId = withRouter(withTheme(IdComponent));
export const Status = withTheme(StatusComponent);
export const Tag = withTheme(TagComponent);
export const TagContainer = withTheme(TagContainerComponent);
