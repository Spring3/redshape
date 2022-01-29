import React, { useCallback } from 'react';
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';
import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'styled-components';
import { animationSlideRight } from '../animations';
import { GhostButton } from './GhostButton';
import { theme as Theme } from '../theme';

const BackButton = () => {
  const navigate = useNavigate();
  const theme = useTheme() as typeof Theme;

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <GhostButton onClick={goBack}>
      <ArrowLeftIcon
        css={css`
        border-radius: 3px;
        color: ${theme.main};
        border: 2px solid transparent;
        transition: all ease ${theme.transitionTime};
        animation: ${animationSlideRight} 2s ease-in infinite;

        &:hover {
          color: ${theme.main};
          border: 2px solid ${theme.main};
          animation-play-state: paused;
        }
      `}
        size={30}
      />
    </GhostButton>
  );
};

export {
  BackButton
};
