import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
  children: ReactNode;
  active?: boolean;
}

const Portal = ({ children, active }: PortalProps) => {
  const container = document.createElement('div');

  useEffect(() => {
    let portal: HTMLElement;

    if (active) {
      portal = document.getElementById('modals-portal') as HTMLElement;
      portal?.appendChild(container);
      document.querySelector('body')?.setAttribute('style', 'overflow: hidden;');
    }
    return () => {
      if (!active) {
        setTimeout(() => {
          if (portal && container.parentNode === portal) {
            portal?.removeChild(container);
            document.querySelector('body')?.removeAttribute('style');
          }
        }, 1000);
      } else if (container.parentNode === portal) {
        portal?.removeChild(container);
      }
    };
  }, [container, active]);

  return createPortal(children, container);
};

export {
  Portal
};
