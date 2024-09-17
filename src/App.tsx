import './App.css';
import useFilter from './filter-hook.ts';

function App() {
  const { view, status, more } = useFilter<{ name: string; url: string }>({
    index: 0,
    page: 20,
    url: 'https://pokeapi.co/api/v2/pokemon',
  });

  return (
    <>
      {status === 'complete' &&
        view?.map((item) => {
          return <li key={item.name}>{item.name}</li>;
        })}
      {status === 'error' && <>Error</>}
      <button onClick={() => more()}>load</button>
    </>
  );
}

export default App;
