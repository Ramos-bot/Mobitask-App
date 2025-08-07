import React from 'react';
import { AppProvider } from './src/shared/context/AppContext';
import MobitaskMain from './src/MobitaskMain';

export default function App() {
  return (
    <AppProvider>
      <MobitaskMain />
    </AppProvider>
  );
}
