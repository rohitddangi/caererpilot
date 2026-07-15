import { useState, useEffect } from 'react';

/**
 * useLiveTime — returns live-updating date/time for the dashboard header.
 * Updates every 60 seconds to show current time.
 */
export default function useLiveTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let interval;
    // Align to the next minute boundary for clean updates
    const msToNextMinute = (60 - now.getSeconds()) * 1000;
    const initialTimeout = setTimeout(() => {
      setNow(new Date());
      // Then update every 60 seconds
      interval = setInterval(() => setNow(new Date()), 60000);
    }, msToNextMinute);

    return () => {
      clearTimeout(initialTimeout);
      if (interval) clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return { greeting, dateStr, timeStr, now };
}
