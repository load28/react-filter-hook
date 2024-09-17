import './App.css';
import usePagination from './pagination-hook.ts';

type Item = {
  name: string;
  url: string;
};

function App() {
  const { view, status, load } = usePagination<Item, { results: Item[] }>({
    size: 20,
    initIndex: 0,
    useLazyLoad: true,
    url: 'https://pokeapi.co/api/v2/pokemon',
    parser: (data) => data.results,
  });

  return (
    <>
      {view?.map((item) => {
        return <li key={item.name}>{item.name}</li>;
      })}
      {status.type === 'error' && status.error.message}
      <button onClick={() => load()}>load</button>
    </>
  );
}

export default App;
