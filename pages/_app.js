import { MeshProvider } from '@meshsdk/react';
import '@meshsdk/react/styles.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <MeshProvider>
      <Component {...pageProps} />
    </MeshProvider>
  );
}

export default MyApp;