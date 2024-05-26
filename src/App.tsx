import React from 'react';
import Routes from './routes/router';
import { ThemedProvider } from './common/styles/GlobalStyles';

export const App: React.FC = () => {
  return (
    <ThemedProvider>
      <Routes />
    </ThemedProvider>
  );
};

