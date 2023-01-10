import { HTMLAttributes, useMemo } from "react";
import Image from "next/image";
import MintButton from "../components/MintButton";
import useCandyMachine from "../api/hooks/useCandyMachine";
import Spinner from "./Spinner";
import { SPL_TOKEN_NAME } from "../constants";

// a react fc component called MintPanel

const MintPanel: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...other
}) => {
  const { candyMachine, loadingCandyMachine, mutate } = useCandyMachine();
  const mintPrice = useMemo(() => {
    if (!candyMachine?.price) return 0;
    const { basisPoints, currency } = candyMachine.price;
    return basisPoints.toNumber() / 10 ** currency.decimals;
  }, [candyMachine?.price]);

  const goLiveDate = useMemo(() => {
    return new Date((candyMachine?.goLiveDate?.toNumber() as number) * 1000);
  }, [candyMachine?.goLiveDate]);

  return (
    <section className="relative bg-black text-white h-[400px] w-full mb-32">
      <div className="flex h-full justify-center items-center">
        <Image
          className=""
          src={"/mintcheckered.png"}
          width={1920}
          height={1080}
          alt="mintcheckered"
        />
      </div>
      <Image
        className="absolute top-10 md:left-10"
        src={"/mint a goonie.png"}
        width={350}
        height={200}
        alt="mint a goonie"
      />
      <div className="absolute top-0 left-0 bottom-0 right-0 w-full h-full flex flex-col items-center">
        <Image
          className=""
          src={"/goonie.png"}
          width={350}
          height={200}
          alt="goonie"
        />
        <div className="h-14">
          {loadingCandyMachine ? (
            <div className="flex justify-center p-3">
              <Spinner />
            </div>
          ) : (
            <div className="w-80 flex text-xl justify-between p-2 ">
              <div>
                {candyMachine?.itemsRemaining.toString()}/
                {candyMachine?.itemsAvailable.toString()}
              </div>
              <div>
                ◎ {mintPrice}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center pt-5">
          <MintButton
            mintPrice={mintPrice}
            goLiveDate={goLiveDate}
            afterMint={() => mutate()}
          />
        </div>
      </div>
    </section>
  );
};

export default MintPanel;
