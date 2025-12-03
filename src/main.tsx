import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { selectTheme } from './store/slices/themeSlice'
import App from './App.tsx'
import './assets/styles/dashboard.scss'

// Initialize theme on app load - ensure dark is default
const initializeTheme = () => {
  const theme = selectTheme(store.getState());
  // Ensure data-theme is set (defaults to dark if not set)
  const finalTheme = theme || 'dark';
  document.documentElement.setAttribute('data-theme', finalTheme);
  
  // If no theme in localStorage, set it to dark
  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'dark');
  }
};

initializeTheme();

// Subscribe to theme changes
store.subscribe(() => {
  const theme = selectTheme(store.getState());
  document.documentElement.setAttribute('data-theme', theme);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
