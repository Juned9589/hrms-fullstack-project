import { useEffect, useState } from 'react';

export default function useCountUp(end, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endVal = Number(end);
    if (isNaN(endVal)) return;
    const decimals = Number.isInteger(endVal) ? 0 : 1;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const nextValue = progress * endVal;
      setCount(decimals ? Number(nextValue.toFixed(decimals)) : Math.floor(nextValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}
