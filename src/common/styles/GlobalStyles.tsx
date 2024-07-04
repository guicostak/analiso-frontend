import React from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Theme } from './Theme';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/900.css';

export const GlobalStyle = createGlobalStyle`
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
`;

interface ThemedProviderProps {
  children: React.ReactNode;
}

export const ThemedProvider: React.FC<ThemedProviderProps> = ({ children }) => (
  <ThemeProvider theme={Theme}>
    <GlobalStyle />
    {children}
  </ThemeProvider>
);
