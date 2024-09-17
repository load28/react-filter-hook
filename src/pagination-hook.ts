import { useCallback, useEffect, useState } from 'react';

type LoadingStatus = {
  type: 'loading';
};

type IdleStatus = {
  type: 'idle';
};

type CompleteStatus = {
  type: 'complete';
};

type ErrorStatus = {
  type: 'error';
  error: Error;
};

type Status = IdleStatus | LoadingStatus | CompleteStatus | ErrorStatus;

type Option<TView, TServerData> = {
  initIndex: number;
  size: number;
  url: string;
  parser: (data: TServerData) => TView[];
  useLazyLoad?: boolean;
  urlBuilder?: (url: string, index: number, size: number) => string;
};

const defaultUrlBuilder = (url: string, index: number, size: number) => `${url}?offset=${index}&limit=${size}`;
const createSafeParams: <TView, TServerData>(option: Option<TView, TServerData>) => Required<Option<TView, TServerData>> = <TView, TServerData>(
  option: Option<TView, TServerData>,
) => ({
  ...option,
  useLazyLoad: false,
  urlBuilder: option.urlBuilder || defaultUrlBuilder,
});

const fetchData = async <TServerData>(url: string, signal: AbortSignal): Promise<TServerData> => {
  const res = await fetch(url, { signal });
  return await res.json();
};

const usePagination = <TView, TServerData>(option: Option<TView, TServerData>) => {
  const [view, setView] = useState<TView[]>([]);
  const [currentIndex, setCurrentIndex] = useState(option.initIndex);
  const [status, setStatus] = useState<Status>({ type: 'idle' });

  const fetchDataHandler = useCallback(
    (_currentIndex: number, signal: AbortSignal) => {
      const req = async () => {
        setStatus(() => ({ type: 'loading' }));
        try {
          const safeParams = createSafeParams(option);
          const fetchUrl = safeParams.urlBuilder(safeParams.url, _currentIndex, safeParams.size);
          const data = await fetchData<TServerData>(fetchUrl, signal);
          const parsingData = option.parser(data);

          setView((prevData) => [...prevData, ...parsingData]);
          setCurrentIndex(_currentIndex + safeParams.size);
          setStatus(() => ({ type: 'complete' }));
        } catch (error: unknown) {
          if (error instanceof Error) {
            setStatus(() => ({ type: 'error', error }));
          }
        }
      };
      req().then();
    },
    [option],
  );

  useEffect(() => {
    if (!option.useLazyLoad) {
      const abortController = new AbortController();
      fetchDataHandler(option.initIndex, abortController.signal);
      return () => abortController.abort();
    }
  }, []);

  return {
    view,
    status,
    load: () => {
      const abortController = new AbortController();
      fetchDataHandler(currentIndex, abortController.signal);
      return abortController;
    },
  };
};

export default usePagination;
