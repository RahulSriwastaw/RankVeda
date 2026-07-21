import '@/styles/globals.css';
import 'react-quill/dist/quill.snow.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import '@/utils/firebase';

import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </Head>
      <Toaster position="top-center" reverseOrder={false} />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}