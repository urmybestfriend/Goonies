import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <meta
          name="RETRO GOONIES"
          content=""
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="/fonts/ArchimotoV01-Thin.otf" as="font" crossOrigin="" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
