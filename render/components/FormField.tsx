import React, {
  ReactNode,
} from 'react';
import { css } from '@emotion/react';
import { useTheme } from 'styled-components';
import { theme as Theme } from '../theme';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
  inline?: boolean;
  rightToLeft?: boolean;
};

const styles = {
  container: css`
    margin-top: 0.75rem;
    margin-bottom: 0.5rem;
  `,
  wrapper: css`
    margin-bottom: 0.35rem;
  `
};

const FormField = ({
  label,
  htmlFor,
  children,
  className,
  inline = false,
  rightToLeft = false,
}: FormFieldProps) => {
  const theme = useTheme() as typeof Theme;

  const labelLeftStyle = css`
    color: ${theme.minorText};
  `;

  const labelRightStyle = css`
    color: ${theme.minorText};
    font-weight: bold;
  `;

  if (rightToLeft && inline) {
    return (
      <div css={styles.container} className={className}>
        {children}
        <div css={styles.wrapper}>
          <label
            css={labelLeftStyle}
            htmlFor={htmlFor}
          >
            {label}
          </label>
        </div>
      </div>
    );
  }

  if (rightToLeft && !inline) {
    return (
      <div css={styles.container} className={className}>
        {children}
        <div css={styles.wrapper}>
          <label
            css={labelRightStyle}
            htmlFor={htmlFor}
          >
            {label}
          </label>
        </div>
      </div>
    );
  }

  if (!rightToLeft && inline) {
    return (
      <div css={styles.container} className={className}>
        <div css={styles.wrapper}>
          <label
            css={labelLeftStyle}
            htmlFor={htmlFor}
          >
            {label}
          </label>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div css={styles.container} className={className}>
      <div css={styles.wrapper}>
        <label
          css={labelRightStyle}
          htmlFor={htmlFor}
        >
          {label}
        </label>
      </div>
      {children}
    </div>
  );
};

export { FormField };
