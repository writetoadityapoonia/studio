'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start with a clean slate on navigation
    setIsVisible(true);
    setProgress(0);

    // A series of timeouts to simulate loading progress.
    // This now runs only on the client, avoiding hydration mismatch.
    const timers = [
      setTimeout(() => setProgress(Math.random() * 25 + 10), 50),
      setTimeout(() => setProgress(Math.random() * 30 + 40), 300),
      setTimeout(() => setProgress(99), 1000),
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => setIsVisible(false), 500); // Hide after completion
      }, 1500),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [pathname, searchParams]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 w-full h-0.5 z-50">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}
