import React, {
  useEffect, useCallback, MouseEventHandler, useState
} from 'react';
import { css } from '@emotion/react';
import throttle from 'lodash/throttle';
import { useOvermindEffects } from '../store';

type IframeProps = {
  name: string;
  className?: string;
  html: string;
  width?: string;
  cssCode?: string;
  onResize?: (iframe: HTMLIFrameElement | null) => void;
}

const styles = {
  iframe: css`
    box-sizing: border-box;
    overflow: hidden;
  `
};

const Iframe = ({
  className, html, cssCode, onResize, name, width
}: IframeProps) => {
  const effects = useOvermindEffects();
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const [isLoaded, setLoaded] = useState(false);

  const handleResize = useCallback(throttle(() => {
    if (iframe) {
      iframe.height = iframe.contentDocument.body.scrollHeight + 30;
      iframe.width = width ? width : iframe.contentDocument.body.scrollWidth || 0;
    }

    if (onResize) {
      onResize(iframe);
    }
  }, 300), [onResize, width, html, iframe]);

  const handleFocus = useCallback(() => {
    if (iframe) {
      iframe.contentWindow?.getSelection()?.empty();
    }
  }, [iframe]);

  useEffect(() => {
    if (isLoaded) {
      handleResize();
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded, handleResize]);

  const onLoad = useCallback(() => {
    setLoaded(true);
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

    if (iframe) {
      for (const elem of iframe.contentDocument?.body.querySelectorAll(['a', 'img', 'button', 'input']) ?? []) {
        elem.removeEventListener('click', interceptIframeInternalRedirect);
        elem.addEventListener('click', interceptIframeInternalRedirect);
      }

      iframe.contentWindow?.addEventListener('blur', handleFocus);
      iframe.contentWindow?.onbeforeunload = () => {
        iframe.contentWindow?.removeEventListener('blur', handleFocus);
      };

      if (cssCode) {
        const cssContainer = document.createElement('style');
        // styles.type = 'text/css';
        cssContainer.innerText = cssCode;
        iframe.contentDocument?.head.appendChild(cssContainer);
      }

      handleResize();
    }
  }, [cssCode, setLoaded, handleResize, handleFocus]);

  return (
    <iframe
      css={styles.iframe}
      title={name}
      frameBorder="0"
      width={width}
      ref={setIframe}
      className={className}
      srcDoc={html}
      onLoad={onLoad}
    />
  );
};

export {
  Iframe
};
