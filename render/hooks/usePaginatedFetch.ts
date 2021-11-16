import { throttle } from 'lodash';
import React, {
  useState, useEffect, useCallback, RefObject
} from 'react';
import { useScroll } from 'react-use';
import { Issue, PaginatedActionResponse } from '../../types';

type PaginatedQueryParams = {
  offset: number;
  filters: any;
  limit?: number;
};

type UsePaginatedFetchProps = {
  request: (queryParams: PaginatedQueryParams) => Promise<PaginatedActionResponse<any>>;
  filters: any;
  containerRef: RefObject<HTMLElement>;
}

type FetchBatchArgs = {
  initialFetch?: boolean;
}

const usePaginatedFetch = ({ request, filters, containerRef }: UsePaginatedFetchProps) => {
  const [isFetching, setFetching] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [items, setItems] = useState<Issue[]>([]);
  const [error, setError] = useState<Error>();

  const { y } = useScroll(containerRef);

  const fetchBatch = useCallback(throttle(async ({ initialFetch }: FetchBatchArgs = {}) => {
    setFetching(true);

    const offset = initialFetch ? 0 : items.length;

    const response = await request({ offset, filters, limit: 2 });
    if (response.success) {
      setError(undefined);

      if (initialFetch) {
        setItems(response.data.items);
      } else {
        setItems((fetchedItems) => ([...fetchedItems, ...response.data.items]));
      }

      setHasMore((items.length + response.data.items.length) < response.data.total);
    } else {
      setError(response.error);
    }

    setFetching(false);
  }, 200), [items.length, request, filters]);

  useEffect(() => {
    console.log('[Resetting] changed.', filters);
    fetchBatch({ initialFetch: true });
  }, [filters, request, containerRef]);

  useEffect(() => {
    console.log('[Fetching] Changed');
    const { clientHeight = 0, scrollHeight = 0 } = containerRef.current || {};
    const nextBatchFits = scrollHeight === clientHeight && hasMore;
    const scrolledToBottom = (y + clientHeight) >= scrollHeight;
    // console.log('hasMore', hasMore);
    console.log(scrolledToBottom);
    console.log('y', y);
    console.log('clientHeight', containerRef.current?.clientHeight);
    console.log('scrollHeight', containerRef.current?.scrollHeight);
    if (!isFetching && hasMore && (nextBatchFits || scrolledToBottom)) {
      fetchBatch({ initialFetch: false });
    }
  }, [y, hasMore, isFetching]);

  return {
    isFetching,
    items,
    error,
  };
};

export {
  usePaginatedFetch
};
