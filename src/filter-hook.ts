import { useCallback, useEffect, useState } from 'react';

const useFilter = <T>(opt: { index: number; page: number; url: string }) => {
  const [view, setView] = useState<T[]>([]);
  const [index, setIndex] = useState(opt.index);
  const [status, setStatus] = useState<'loading' | 'error' | 'idle' | 'complete'>('idle');

  const fetchData = useCallback(
    (index: number) => {
      const abortController = new AbortController();

      const req = async () => {
        setStatus(() => 'loading');
        const res = await fetch(opt.url + `?offset=${index}` + `&limit=${opt.page}`, {
          signal: abortController.signal,
        });

        if (res.ok) {
          const data = await res.json();
          setView((prevData) => [...prevData, ...data.results]);
          setIndex((prevIndex) => prevIndex + opt.page);
          setStatus(() => 'complete');
        } else {
          setStatus(() => 'error');
        }
      };
      req().then();

      return () => abortController.abort();
    },
    [opt.page, opt.url],
  );

  useEffect(() => {
    return fetchData(opt.index);
  }, [fetchData, opt.index]);

  return { view, status, more: () => fetchData(index) };
};

export default useFilter;
