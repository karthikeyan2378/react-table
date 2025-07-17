
'use client';

import { useState, useEffect, useRef } from 'react';

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
 * A custom hook for row virtualization.
 * It calculates which items should be rendered based on the scroll position.
 */
export function useVirtualizer({
  count,
  getScrollElement,
  estimateSize,
  overscan = 5,
}: UseVirtualizerOptions) {
  const [virtualItems, setVirtualItems] = useState<VirtualItem[]>([]);
  const [totalSize, setTotalSize] = useState(0);

  // Memoize the estimated sizes to avoid recalculation
  const measuredSizes = useRef<Record<number, number>>({}).current;
  
  useEffect(() => {
    // Pre-calculate total size
    let size = 0;
    for (let i = 0; i < count; i++) {
        size += measuredSizes[i] ?? estimateSize(i);
    }
    setTotalSize(size);
  }, [count, estimateSize, measuredSizes]);


  useEffect(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    const calculateVirtualItems = () => {
      const { scrollTop, clientHeight } = scrollElement;
      
      let startIndex = -1;
      let endIndex = -1;
      let runningHeight = 0;

      // Find the start and end indices of visible items
      for (let i = 0; i < count; i++) {
        const itemSize = measuredSizes[i] ?? estimateSize(i);
        
        if (startIndex === -1 && runningHeight + itemSize >= scrollTop) {
          startIndex = Math.max(0, i - overscan);
        }
        
        if (endIndex === -1 && runningHeight >= scrollTop + clientHeight) {
          endIndex = Math.min(count - 1, i + overscan);
          break;
        }

        runningHeight += itemSize;
      }
      
      // Handle cases where scroll is at the end
      if (startIndex === -1) startIndex = 0;
      if (endIndex === -1) endIndex = count - 1;
      
      const newVirtualItems: VirtualItem[] = [];
      let currentPosition = 0;
      
      // Calculate positions for all items up to the end index
      for(let i = 0; i < startIndex; i++) {
          currentPosition += measuredSizes[i] ?? estimateSize(i);
      }

      for (let i = startIndex; i <= endIndex; i++) {
        const size = measuredSizes[i] ?? estimateSize(i);
        newVirtualItems.push({ index: i, start: currentPosition, size });
        currentPosition += size;
      }

      setVirtualItems(newVirtualItems);
    };

    calculateVirtualItems(); // Initial calculation

    scrollElement.addEventListener('scroll', calculateVirtualItems, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('scroll', calculateVirtualItems);
    };
  }, [count, estimateSize, getScrollElement, overscan, measuredSizes]);

  return {
    getVirtualItems: () => virtualItems,
    getTotalSize: () => totalSize,
  };
}
