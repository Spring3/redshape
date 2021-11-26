import React, {
  useState, useEffect, useCallback
} from 'react';
import range from 'lodash/range';
import { PaginatedActionResponse } from '../../types';

type PaginatedQueryParams = {
  offset: number;
  filters: any;
  limit?: number;
};

type UsePaginatedFetchProps<T> = {
  request: (queryParams: PaginatedQueryParams) => Promise<PaginatedActionResponse<T>>;
  filters?: any;
}

const limit = 100;

const useFetchAll = <T>({ request, filters }: UsePaginatedFetchProps<T>) => {
  const [isFetching, setFetching] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<Error>();

  const fetchAll = useCallback(async () => {
    setFetching(true);
    setError(undefined);

    const response = await request({ offset: 0, filters, limit });

    if (response.success) {
      const firstBatch = response.data.items;
      const hasMore = response.data.items.length < response.data.total;

      if (!hasMore) {
        setItems(firstBatch);
        setFetching(false);
        return;
      }

      const promises = range(response.data.items.length, response.data.total, limit)
        .map((offset) => request({ offset, filters, limit }));
      const results = await Promise.all(promises);

      const failedResult = results.find(result => result.success === false);
      const allItemsFetched = results.flatMap((batch) => batch.data.items);

      if (failedResult) {
        setError(failedResult.error);
        setItems(firstBatch.concat(allItemsFetched));
      }
    } else {
      setError(response.error);
    }

    setFetching(false);
  }, [request, filters]);

  useEffect(() => {
    fetchAll();
  }, [filters, request]);

  return {
    isFetching,
    items,
    error,
  };
};

export {
  useFetchAll
};
