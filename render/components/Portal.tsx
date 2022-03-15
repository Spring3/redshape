import { ReactNode, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
  children: ReactNode;
  active?: boolean;
  id?: string;
}

enum Portals {
  MODALS = 'modals-portal'
}

const Portal = ({ children, active, id }: PortalProps) => {
  const container = useMemo(() => document.createElement('div'), []);

  useEffect(() => {
    let portal: HTMLElement;

    if (active) {
      portal = document.getElementById(Portals.MODALS) as HTMLElement;
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
        document.querySelector('body')?.removeAttribute('style');
      }
    };
  }, [container, active]);

  return createPortal(children, container, id);
};

export {
  Portal,
  Portals
};
