import '../src/styles/globals.css'
import {GameProvider} from "../src/contexts/gameContext";
import {FazendaProvider} from "../src/contexts/fazendaContext";

function MyApp({ Component, pageProps }) {
  return (
      <FazendaProvider>
        <GameProvider>
          <Component {...pageProps} />
        </GameProvider>
      </FazendaProvider>
  );
}

export default MyApp
