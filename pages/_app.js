// changelly-exchange/pages/_app.js
import { MeshProvider } from '@meshsdk/react';
import '@meshsdk/react/styles.css'; // Add this for default styles

import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <MeshProvider>
      <Component {...pageProps} />
    </MeshProvider>
  );
}

export default MyApp;

