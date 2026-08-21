import Head from "next/head";
import '../src/styles/globals.css'
import {GameProvider} from "../src/contexts/gameContext";
import {FazendaProvider} from "../src/contexts/fazendaContext";

function MyApp({ Component, pageProps }) {
  return (
      <FazendaProvider>
        <GameProvider>
          <Head>
            <title>Fred 2</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
            <meta name="theme-color" content="#050816" />
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="icon" type="image/png" href="/images/icone-fred.png" />
            <link rel="apple-touch-icon" href="/images/icone-fred.png" />
          </Head>
          <Component {...pageProps} />
        </GameProvider>
      </FazendaProvider>
  );
}

export default MyApp
