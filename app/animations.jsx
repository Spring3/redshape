import { keyframes } from 'styled-components';

export const animationSlideRight = keyframes`
  0% {
    transform: translateX(0px);
  }
  10% {
    transform: translateX(-5px);
  }
  20% {
    transform: translateX(-5px);
  }
  30% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(0px);
  }
`;

export default {
  animationSlideRight
};
