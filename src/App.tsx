import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { GlossaryProvider } from './components/glossary/glossary-context';

function App() {
  return (
    <GlossaryProvider>
      <RouterProvider router={router} />
    </GlossaryProvider>
  );
}

export default App;

