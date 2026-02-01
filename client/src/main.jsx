import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from "react-redux";
import './index.css';
import store from './redux/store';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from "./AuthProvider.jsx";

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter >
    </AuthProvider>
  </Provider>

)



