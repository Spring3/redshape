import React, {
  useEffect, forwardRef, useCallback, MouseEventHandler
} from 'react';
import { css } from '@emotion/react';
import { useOvermindEffects } from '../store';

type IframeProps = {
  name: string;
  className?: string;
  html: string;
  width?: string;
  cssCode?: string;
  onResize?: () => void;
}

const styles = {
  iframe: css`
    box-sizing: border-box;
    overflow: hidden;
  `
};

const Iframe = forwardRef<HTMLIFrameElement, IframeProps>(({
  className, html, cssCode, onResize, name, width
}: IframeProps, ref) => {
  const effects = useOvermindEffects();

  const handleResize = useCallback(() => {
    if (ref.current) {
      ref.current.height = ref.current.contentDocument.body.scrollHeight || 0;
      ref.current.width = width ? width : ref.current.contentDocument.body.scrollWidth || 0;
    }

    if (onResize) {
      onResize();
    }
  }, [onResize, width]);

  useEffect(() => () => {
    window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const onLoad = useCallback(() => {
    const interceptIframeInternalRedirect: MouseEventHandler<HTMLElement> = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const hyperlink = (e.target as HTMLElement).getAttribute('href') || (e.target as HTMLElement).innerText;

      if (hyperlink?.startsWith('http') || hyperlink?.startsWith('mailto:')) {
        effects.mainProcess.system({
          payload: {
            url: hyperlink
          },
          action: 'open-url'
        });
      }
    };

    if (ref.current) {
      for (const elem of ref.current.contentDocument?.body.querySelectorAll(['a', 'img', 'button', 'input']) ?? []) {
        elem.removeEventListener('click', interceptIframeInternalRedirect);
        elem.addEventListener('click', interceptIframeInternalRedirect);
      }

      if (cssCode) {
        const cssContainer = document.createElement('style');
        // styles.type = 'text/css';
        cssContainer.innerText = cssCode;
        ref.current.contentDocument?.head.appendChild(cssContainer);
      }
      handleResize();
      window.addEventListener('resize', handleResize);
    }
  }, [cssCode, handleResize]);

  return (
    <iframe
      css={styles.iframe}
      title={name}
      frameBorder="0"
      width={width}
      height={html ? undefined : 20}
      ref={ref}
      className={className}
      srcDoc={html}
      onLoad={onLoad}
    />
  );
});

export {
  Iframe
};
