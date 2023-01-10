import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import MintPanel from "../components/MintPanel";
import localFont from "@next/font/local";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <div className="flex justify-center items-center">
        <WalletMultiButtonDynamic
          style={{
            backgroundColor: "black",
          }}
        ></WalletMultiButtonDynamic>
      </div>
      <div className="flex justify-center items-center mt-5">
        <MintPanel></MintPanel>
      </div>
      <Toaster position="bottom-center" />
    </>
  );
}
