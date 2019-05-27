import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled, { ThemeProvider, css } from 'styled-components';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import { version, name } from '../../package.json';
import LogoIcon from '../../assets/icon.png';

import Link from '../components/Link';
import { report } from '../../common/reporter';
import License from './License';

import theme from '../theme';

if (module.hot) {
  module.hot.accept();
}

const FlexBox = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box; 

  h3:nth-of-type(1) {
    margin: 15px auto;
  }

  h3:nth-of-type(2) {
    margin-top: 0px;
  }
`;

const IconContainer = styled.div`
  align-self: center;
  display: flex;
  align-items: center;

  img {
    margin-right: 20px;
    border-radius: 50%;
  }

  h2:nth-of-type(1) {
    display: inline-block;
    font-size: 30px;
    margin: 20px 10px 20px 0px;
  }

  h2:nth-of-type(2) {
    position: relative;
    bottom: -2px;
  }
  `;
  
  const CenteredDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  div:nth-of-type(2) {
    margin-top: 15px;
  }
`;
  
const StyledTabPanel = styled(TabPanel)`
  flex-grow: 1;
  padding: 20px;
  display: none;
  background: ${props => props.theme.bgDark};
`;

const StyledTabs = styled(Tabs)`
  box-sizing: border-box;
  height: 100vh;
  flex-direction: column;
  display: flex;

  ul.react-tabs__tab-list {
    list-style-type: none;
    padding: 10px 0px 10px 0px;
    margin: 0px;
    width: 100%;
    display: inline-block;
    text-align: center;
    border-bottom: 2px solid ${props => props.theme.bgDarker};
    
    li.react-tabs__tab {
      display: inline-block;
      position: relative;
      padding: 5px;
      cursor: pointer;
      margin-right: 10px;
      border-radius: 50%;

      ${({ theme }) => css`
        background: ${theme.bg};
        border: 1px solid ${theme.main};
        transition: background ease-in ${theme.transitionTime};
        transition: box-shadow ease-in ${theme.transitionTime};

        &:hover {
          border-color: ${theme.main};
          box-shadow: 0px 0px 5px 0px ${theme.main};
        }
      `}
    }

    li.react-tabs__tab--selected {
      ${({ theme }) => css`
        border-color: ${theme.main};
        background: ${theme.main};
      `}
      box-shadow: none;
    }
  }

  ${StyledTabPanel}.react-tabs__tab-panel--selected {
    display: block;
  }
`;

const Paragraph = styled.p`
  text-align: justify;
`;


class AboutPage extends Component {
  onReportButtonClick = () => report()

  render() {
    return (
    <StyledTabs>
      <TabList>
        <Tab></Tab>
        <Tab></Tab>
      </TabList>

      <StyledTabPanel>
        <FlexBox>
          <IconContainer>
            <Link
              href="https://spring3.github.io/website/redshape"
              type="external"
            >
              <img alt="App icon" height="70" src={LogoIcon} />
            </Link>
            <h2>{name}</h2>
            <h2>v{version}</h2>
          </IconContainer>
          <CenteredDiv>
            <h3>Time tracker for Redmine</h3>
            <div>
              <Link
                href="#"
                onClick={this.onReportButtonClick}
              >
                Submit
              </Link>
              <span>&nbsp;issues/proposals on Github.</span>
            </div>
            <div>
              <span>Visit the Redshape</span>
              <Link
                href="https://spring3.github.io/website/redshape"
                type="external"
              >
                homepage
              </Link>
            </div>
          </CenteredDiv>
          <Paragraph>The program is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.</Paragraph>
          <footer>
            <div>
              Copyright © 2019&nbsp;
              <Link
                href="https://spring3.github.io/website/"
                type="external"
              >
                Daniyil Vasylenko
              </Link>
            </div>
          </footer>
        </FlexBox>
      </StyledTabPanel>
      <StyledTabPanel>
        <FlexBox>
          <License />
        </FlexBox>
      </StyledTabPanel>
    </StyledTabs>
    );
  }
};

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <AboutPage />
    {/* <!-- https://github.com/electron/electron/issues/2863 -->
    <script>var exports = exports || {};</script> */}
  </ThemeProvider>,
  document.getElementById('root')
);
