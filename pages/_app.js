import '../src/styles/globals.css'
import {GameProvider} from "../src/contexts/gameContext";

function MyApp({ Component, pageProps }) {
  return (
      <GameProvider>
        <Component {...pageProps} />
      </GameProvider>
  );
}

export default MyApp
