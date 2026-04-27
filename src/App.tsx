import { useState } from 'react';
import Login from './components/Login';
import MainApp from './MainApp';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return <MainApp />;
}
