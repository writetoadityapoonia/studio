'use client';

import { useState, useEffect, useRef } from 'react';

interface DynamicIframeProps {
  srcDoc: string;
  title: string;
}

export function DynamicIframe({ srcDoc, title }: DynamicIframeProps) {
  const [iframeHeight, setIframeHeight] = useState<number | string>('400px');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // It's a good practice to check the origin of the message for security
      // but for srcDoc iframes, the origin is 'null'.
      // We'll rely on the message type.
      if (event.data && event.data.type === 'iframe-resize') {
        setIframeHeight(event.data.height);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      title={title}
      style={{ width: '100%', height: `${iframeHeight}px`, border: 'none' }}
      scrolling="no"
      sandbox="allow-scripts"
    />
  );
}
