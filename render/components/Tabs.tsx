import { css } from '@emotion/react';
import { theme } from '../theme';

const tabsTrigger = css`
  background: transparent;
  font: ${theme.font};
  font-size: 1rem;
  font-weight: bold;
  padding: 0.5rem;
  border: none;
  border-bottom: 3px solid transparent;
`;

const tabsTriggerActive = css`
  border-bottom: 3px solid ${theme.main};
`;

const tabsHeaderList = css`
  width: 100%;
`;

export {
  tabsTrigger,
  tabsTriggerActive,
  tabsHeaderList
};
