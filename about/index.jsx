import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled, { ThemeProvider } from 'styled-components';
import { version, name } from '../package.json';

import LogoIcon from '../assets/icon.png';

import Link from '../app/components/Link';
import { report } from '../modules/reporter';

import theme from '../app/theme';

if (module.hot) {
  module.hot.accept();
}

const FlexBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 40px 20px;
  height: 100vh;

  h3:nth-of-type(1) {
    margin-top: 20px;
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

  h2 {
    display: inline-block;
    font-size: 30px;
    margin-right: 10px;
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

class AboutPage extends Component {
  onReportButtonClick = () => report()

  render() {
    return (
      <FlexBox>
        <IconContainer>
          <Link
            href="https://spring3.github.io/website/redshape"
            type="external"
          >
            <img alt="App icon" height="80" src={LogoIcon} />
          </Link>
          <h2>{name}</h2>
          <h3>v{version}</h3>
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
            <span>&nbsp;issues/proposals on Github</span>
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
        <p>The program is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.</p>
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
