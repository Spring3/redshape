import React from 'react';
import styled from 'styled-components';

const DragArea = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 23px;
  z-index: 3;
  -webkit-app-region: drag
`;

export default () => (<DragArea />);
