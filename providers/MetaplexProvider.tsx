import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { MetaplexContext } from "../api/hooks/useMetaplex";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PropsWithChildren, useMemo } from "react";
import { connection } from "../constants";

export const MetaplexProvider = (props: PropsWithChildren<{}>) => {
  const wallet = useWallet();

  const metaplex = useMemo(
    () => Metaplex.make(connection).use(walletAdapterIdentity(wallet)),
    [connection, wallet]
  );

  return <MetaplexContext.Provider value={{ metaplex }} {...props} />;
};
