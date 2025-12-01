import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { selectTheme } from './store/slices/themeSlice'
import App from './App.tsx'
import './assets/styles/dashboard.scss'

// Initialize theme on app load
const initializeTheme = () => {
  const theme = selectTheme(store.getState());
  document.documentElement.setAttribute('data-theme', theme);
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
