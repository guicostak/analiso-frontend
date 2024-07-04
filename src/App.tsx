import Routes from './routes/router';
import ThemedProvider from './common/styles/GlobalStyles';

function App() {
  return (
    <ThemedProvider>
      <Routes />
    </ThemedProvider>
  );
}

export default App;
