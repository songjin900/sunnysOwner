import LoadingAnimation from '@components/loadingAnimation';
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router';
import { SWRConfig } from 'swr'
import { useEffect, useState } from 'react';
import { Roboto, Raleway } from "@next/font/google"

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700']
})

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400']
})

export default function App({ Component, pageProps }: AppProps) {

  const router = useRouter();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      const currentRoute = router.pathname;
      const targetRoute = url;

      if (!currentRoute.startsWith('/shop') && targetRoute === '/shop' ||
        currentRoute.startsWith('/shop') && targetRoute === "/") {
        setShowLoading(true);
      }
    };

    const handleComplete = () => {
      setShowLoading(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <main className={raleway.className}>
      <SWRConfig value={{ fetcher: (url: string) => fetch(url).then((response) => response.json()) }}>
        <div className='w-full max-w-[90rem] mx-auto'>
          <LoadingAnimation showLoadingAnimation={showLoading} />
          <Component {...pageProps} />
        </div>
      </SWRConfig>
    </main>
  )
}
