import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { GlossaryProvider } from './components/glossary/glossary-context';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="443722990095-fssh39e39fr204tuphhlbnfu2rde3t7m.apps.googleusercontent.com">
      <GlossaryProvider>
        <RouterProvider router={router} />
      </GlossaryProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
