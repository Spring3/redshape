import React, { Component } from 'react';
import styled from 'styled-components';
import { Labeled, Email, Password } from '../components/Input';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;
  grid-auto-rows: 200px;
  grid-template-areas:
    '. a a .'
    '. a a .';
`;

class LoginView extends Component {
  render() {
    return (
      <Grid>
        <Labeled
          label="Email"
          htmlFor="email"
          onChange={() => {}}
        >
          <Email />
        </Labeled>
        <Labeled
          label="Password"
          htmlFor="password"
        >
          <Password />
        </Labeled>
      </Grid>
    );
  }
}

export default LoginView;
