import { throttle } from 'lodash';
import React, {
  useState, useEffect, useCallback, RefObject
} from 'react';
import useInView from 'react-cool-inview';
import { PaginatedActionResponse } from '../../types';

type PaginatedQueryParams = {
  offset: number;
  filters: any;
  limit?: number;
};

type UsePaginatedFetchProps<T> = {
  request: (queryParams: PaginatedQueryParams) => Promise<PaginatedActionResponse<T>>;
  filters?: any;
  containerRef?: RefObject<HTMLElement>;
}

type FetchBatchArgs = {
  initialFetch?: boolean;
}

const usePaginatedFetch = <T>({ request, filters, containerRef }: UsePaginatedFetchProps<T>) => {
  const [isFetching, setFetching] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<Error>();

  const fetchBatch = useCallback(throttle(async ({ initialFetch }: FetchBatchArgs = {}) => {
    setFetching(true);

    const offset = initialFetch ? 0 : items.length;

    const response = await request({ offset, filters });
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

  const { observe: fetchTriggerElementRef } = useInView({
    root: containerRef?.current,
    rootMargin: '20px 0px',
    onEnter: async ({ unobserve, observe }) => {
      unobserve();
      if (!isFetching && hasMore) {
        await fetchBatch({ initialFetch: false });
      }
      observe();
    },
  });

  useEffect(() => {
    fetchBatch({ initialFetch: true });
  }, [filters, request]);

  return {
    fetchTriggerElementRef,
    isFetching,
    items,
    error,
  };
};

export {
  usePaginatedFetch
};
