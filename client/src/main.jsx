import { StrictMode } from 'react'
import { PersistGate } from 'redux-persist/integration/react';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from "react-redux";
import './index.css';
import store, { persistor } from './redux/store';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from "./AuthProvider.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
        <AuthProvider>
          <App />
        </AuthProvider>
      {/* </PersistGate> */}
    </Provider>
  </BrowserRouter >

)



