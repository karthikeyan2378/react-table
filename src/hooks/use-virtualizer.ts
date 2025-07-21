
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVirtualizerOptions {
  count: number;
  getScrollElement: () => HTMLElement | null;
  estimateSize: (index: number) => number;
  overscan?: number;
}

interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

/**
 * A custom hook for row virtualization that uses ResizeObserver for accuracy.
 * It calculates which items should be rendered based on the scroll container's
 * actual height and scroll position.
 */
export function useVirtualizer({
  count,
  getScrollElement,
  estimateSize,
  overscan = 5,
}: UseVirtualizerOptions) {
  const [virtualItems, setVirtualItems] = useState<VirtualItem[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculate = useCallback(() => {
    if (!isMounted) return;

    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    const { scrollTop, clientHeight } = scrollElement;
    
    let runningHeight = 0;
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < count; i++) {
        const itemSize = estimateSize(i);
        
        const itemStart = runningHeight;
        const itemEnd = itemStart + itemSize;

        if (startIndex === -1 && itemEnd >= scrollTop) {
            startIndex = Math.max(0, i - overscan);
        }
        
        if (endIndex === -1 && itemStart > scrollTop + clientHeight) {
            endIndex = Math.min(count - 1, i + overscan);
        }

        runningHeight += itemSize;
    }
    
    setTotalSize(runningHeight);

    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = Math.max(0, count - 1);

    const newVirtualItems: VirtualItem[] = [];
    let currentPosition = 0;
    
    for(let i = 0; i < startIndex; i++) {
        currentPosition += estimateSize(i);
    }

    for (let i = startIndex; i <= endIndex; i++) {
        const size = estimateSize(i);
        newVirtualItems.push({ index: i, start: currentPosition, size });
        currentPosition += size;
    }

    setVirtualItems(newVirtualItems);

  }, [count, estimateSize, getScrollElement, overscan, isMounted]);


  useEffect(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement || !isMounted) return;

    const resizeObserver = new ResizeObserver(calculate);
    resizeObserver.observe(scrollElement);

    scrollElement.addEventListener('scroll', calculate, { passive: true });
    
    calculate(); 

    return () => {
      resizeObserver.unobserve(scrollElement);
      scrollElement.removeEventListener('scroll', calculate);
    };
  }, [calculate, getScrollElement, isMounted]);

  return {
    getVirtualItems: () => virtualItems,
    getTotalSize: () => totalSize,
  };
}
