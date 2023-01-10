import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import {
  useAnchorWallet,
  useWallet,
  Wallet,
} from "@solana/wallet-adapter-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import useCandyMachine from "../api/hooks/useCandyMachine";
import * as anchor from "@project-serum/anchor";
import { useMetaplex } from "../api/hooks/useMetaplex";
import usePrizeMoneyTokenAccounts from "../api/hooks/usePrizeMoneyTokenAccounts";
import useSolBalance from "../api/hooks/useSolBalance";
import { CANDY_MACHINE_ID, RPC_ENDPOINT } from "../constants";
import Spinner from "./Spinner";
import Countdown from "react-countdown";
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  createAccountsForMint,
  getCandyMachineState,
  getCollectionPDA,
  mintOneToken,
  SetupState,
} from "../api/candy-machine";
import { AlertState, getAtaForMint, toDate } from "../api/utils";
import { Commitment, Connection, Transaction } from "@solana/web3.js";
import { DEFAULT_TIMEOUT } from "../api/connection";

enum MintButtonState {
  Disabled,
  NotLiveYet,
  InsufficientFunds,
  ReadyToMint,
  Minting,
  WhiteList,
}

function MintButton({
  mintPrice,
  goLiveDate,
  afterMint,
}: {
  mintPrice: number;
  goLiveDate: Date;
  afterMint: () => void;
}) {
  const wallet = useWallet();
  const { balance } = useSolBalance();
  const [state, setState] = useState(MintButtonState.Disabled);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [isActive, setIsActive] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [itemsRemaining, setItemsRemaining] = useState<number>();
  const [isWhitelistUser, setIsWhitelistUser] = useState(false);
  const [isPresale, setIsPresale] = useState(false);
  const [isValidBalance, setIsValidBalance] = useState(false);
  const [discountPrice, setDiscountPrice] = useState<anchor.BN>();
  const [needTxnSplit, setNeedTxnSplit] = useState(true);
  const [setupTxn, setSetupTxn] = useState<SetupState>();

  const anchorWallet = useAnchorWallet();
  const { connect, connected, publicKey } = useWallet();

  const setAlertState = (alertState: AlertState) => {
    if (alertState.severity === "error") {
      toast.error(alertState.message);
    } else if (alertState.severity === "success") {
      toast.success(alertState.message);
    } else {
      toast(alertState.message);
    }
  };

  const refreshCandyMachineState = useCallback(
    async (commitment: Commitment = "confirmed") => {
      if (!publicKey) {
        return;
      }

      const connection = new Connection(RPC_ENDPOINT as string, commitment);

      if (CANDY_MACHINE_ID) {
        try {
          afterMint();
          const cndy = await getCandyMachineState(
            anchorWallet as anchor.Wallet,
            new PublicKey(CANDY_MACHINE_ID),
            connection
          );
          console.log("Candy machine state: ", cndy);
          let active = cndy?.state.goLiveDate
            ? cndy?.state.goLiveDate.toNumber() < new Date().getTime() / 1000
            : false;
          let presale = false;

          // duplication of state to make sure we have the right values!
          let isWLUser = false;
          let userPrice = cndy.state.price;

          // whitelist mint?
          if (cndy?.state.whitelistMintSettings) {
            // is it a presale mint?
            if (
              cndy.state.whitelistMintSettings.presale &&
              (!cndy.state.goLiveDate ||
                cndy.state.goLiveDate.toNumber() > new Date().getTime() / 1000)
            ) {
              presale = true;
            }
            // is there a discount?
            if (cndy.state.whitelistMintSettings.discountPrice) {
              setDiscountPrice(cndy.state.whitelistMintSettings.discountPrice);
              userPrice = cndy.state.whitelistMintSettings.discountPrice;
            } else {
              setDiscountPrice(undefined);
              // when presale=false and discountPrice=null, mint is restricted
              // to whitelist users only
              if (!cndy.state.whitelistMintSettings.presale) {
                cndy.state.isWhitelistOnly = true;
              }
            }
            // retrieves the whitelist token
            const mint = new anchor.web3.PublicKey(
              cndy.state.whitelistMintSettings.mint
            );
            const token = (await getAtaForMint(mint, publicKey))[0];

            try {
              const balance = await connection.getTokenAccountBalance(token);
              isWLUser = parseInt(balance.value.amount) > 0;
              // only whitelist the user if the balance > 0
              setIsWhitelistUser(isWLUser);

              if (cndy.state.isWhitelistOnly) {
                active = isWLUser && (presale || active);
              }
            } catch (e) {
              setIsWhitelistUser(false);
              // no whitelist user, no mint
              if (cndy.state.isWhitelistOnly) {
                active = false;
              }
              console.log(
                "There was a problem fetching whitelist token balance"
              );
              console.log(e);
            }
          }
          userPrice = isWLUser ? userPrice : cndy.state.price;

          if (cndy?.state.tokenMint) {
            // retrieves the SPL token
            const mint = new anchor.web3.PublicKey(cndy.state.tokenMint);
            const token = (await getAtaForMint(mint, publicKey))[0];
            try {
              const balance = await connection.getTokenAccountBalance(token);

              const valid = new anchor.BN(balance.value.amount).gte(userPrice);

              // only allow user to mint if token balance >  the user if the balance > 0
              setIsValidBalance(valid);
              active = active && valid;
            } catch (e) {
              setIsValidBalance(false);
              active = false;
              // no whitelist user, no mint
              console.log("There was a problem fetching SPL token balance");
              console.log(e);
            }
          } else {
            const balance = new anchor.BN(
              await connection.getBalance(publicKey)
            );
            const valid = balance.gte(userPrice);
            setIsValidBalance(valid);
            active = active && valid;
          }

          // datetime to stop the mint?
          if (cndy?.state.endSettings?.endSettingType.date) {
            setEndDate(toDate(cndy.state.endSettings.number));
            if (
              cndy.state.endSettings.number.toNumber() <
              new Date().getTime() / 1000
            ) {
              active = false;
            }
          }
          // amount to stop the mint?
          if (cndy?.state.endSettings?.endSettingType.amount) {
            const limit = Math.min(
              cndy.state.endSettings.number.toNumber(),
              cndy.state.itemsAvailable
            );
            if (cndy.state.itemsRedeemed < limit) {
              setItemsRemaining(limit - cndy.state.itemsRedeemed);
            } else {
              setItemsRemaining(0);
              cndy.state.isSoldOut = true;
            }
          } else {
            setItemsRemaining(cndy.state.itemsRemaining);
          }

          if (cndy.state.isSoldOut) {
            active = false;
          }

          const [collectionPDA] = await getCollectionPDA(
            new PublicKey(CANDY_MACHINE_ID)
          );
          const collectionPDAAccount = await connection.getAccountInfo(
            collectionPDA
          );

          setIsActive((cndy.state.isActive = active));
          setIsPresale((cndy.state.isPresale = presale));
          setCandyMachine(cndy);

          const txnEstimate =
            892 +
            (!!collectionPDAAccount && cndy.state.retainAuthority ? 182 : 0) +
            (cndy.state.tokenMint ? 66 : 0) +
            (cndy.state.whitelistMintSettings ? 34 : 0) +
            (cndy.state.whitelistMintSettings?.mode?.burnEveryTime ? 34 : 0) +
            (cndy.state.gatekeeper ? 33 : 0) +
            (cndy.state.gatekeeper?.expireOnUse ? 66 : 0);

          setNeedTxnSplit(txnEstimate > 1230);
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === `Account does not exist ${CANDY_MACHINE_ID}`) {
              setAlertState({
                open: true,
                message: `Couldn't fetch candy machine state from candy machine with address: ${CANDY_MACHINE_ID}, using rpc: ${RPC_ENDPOINT}! You probably typed the REACT_APP_CANDY_MACHINE_ID value wrong in your .env file, or you are using the wrong RPC!`,
                severity: "error",
                hideDuration: null,
              });
            } else if (
              e.message.startsWith("failed to get info about account")
            ) {
              setAlertState({
                open: true,
                message: `Couldn't fetch candy machine state with rpc: ${RPC_ENDPOINT}! This probably means you have an issue with the REACT_APP_SOLANA_RPC_HOST value in your .env file, or you are not using a custom RPC!`,
                severity: "error",
                hideDuration: null,
              });
            }
          } else {
            setAlertState({
              open: true,
              message: `${e}`,
              severity: "error",
              hideDuration: null,
            });
          }
          console.log(e);
        }
      } else {
        setAlertState({
          open: true,
          message: `Your REACT_APP_CANDY_MACHINE_ID value in the .env file doesn't look right! Make sure you enter it in as plain base-58 address!`,
          severity: "error",
          hideDuration: null,
        });
      }
    },
    [anchorWallet]
  );

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = []
  ) => {
    try {
      setState(MintButtonState.Minting);
      if (connected && candyMachine?.program && publicKey && RPC_ENDPOINT) {
        const connection = new anchor.web3.Connection(RPC_ENDPOINT);
        let setupMint: SetupState | undefined;
        if (needTxnSplit && setupTxn === undefined) {
          setAlertState({
            open: true,
            message: "Please sign account setup transaction",
            severity: "info",
          });
          setupMint = await createAccountsForMint(candyMachine, publicKey);
          let status: any = { err: true };
          if (setupMint.transaction) {
            status = await awaitTransactionSignatureConfirmation(
              setupMint.transaction,
              DEFAULT_TIMEOUT,
              connection,
              true
            );
          }
          if (status && !status.err) {
            setSetupTxn(setupMint);
            setAlertState({
              open: true,
              message:
                "Setup transaction succeeded! Please sign minting transaction",
              severity: "info",
            });
          } else {
            setAlertState({
              open: true,
              message: "Mint failed! Please try again!",
              severity: "error",
            });
            setState(MintButtonState.ReadyToMint);
            return;
          }
        } else {
          setAlertState({
            open: true,
            message: "Please sign minting transaction",
            severity: "info",
          });
        }

        const mintResult = await mintOneToken(
          candyMachine,
          publicKey,
          beforeTransactions,
          afterTransactions,
          setupMint ?? setupTxn
        );

        let status: any = { err: true };
        let metadataStatus = null;
        if (mintResult) {
          status = await awaitTransactionSignatureConfirmation(
            mintResult.mintTxId,
            DEFAULT_TIMEOUT,
            connection,
            true
          );

          metadataStatus =
            await candyMachine.program.provider.connection.getAccountInfo(
              mintResult.metadataKey,
              "processed"
            );
          console.log("Metadata status: ", !!metadataStatus);
        }

        if (status && !status.err && metadataStatus) {
          // manual update since the refresh might not detect
          // the change immediately
          const remaining = itemsRemaining! - 1;
          setItemsRemaining(remaining);
          setIsActive((candyMachine.state.isActive = remaining > 0));
          candyMachine.state.isSoldOut = remaining === 0;
          setSetupTxn(undefined);
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
            hideDuration: 7000,
          });
          refreshCandyMachineState("processed");
        } else if (status && !status.err) {
          setAlertState({
            open: true,
            message:
              "Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.",
            severity: "error",
            hideDuration: 8000,
          });
          refreshCandyMachineState();
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
          refreshCandyMachineState();
        }
      }
    } catch (error: any) {
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (!error.message) {
          message = "Transaction timeout! Please try again.";
        } else if (error.message.indexOf("0x137")) {
          console.log(error);
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          console.log(error);
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
      // updates the candy machine state to reflect the latest
      // information on chain
      refreshCandyMachineState();
    } finally {
      setState(MintButtonState.ReadyToMint);
    }
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [anchorWallet, refreshCandyMachineState]);

  useEffect(() => {
    (function loop() {
      setTimeout(() => {
        refreshCandyMachineState();
        loop();
      }, 20000);
    })();
  }, [refreshCandyMachineState]);

  const mintButtonLabels = useMemo(
    () => ({
      [MintButtonState.Disabled]: "Connect Wallet",
      [MintButtonState.NotLiveYet]: <Countdown date={goLiveDate} />,
      [MintButtonState.InsufficientFunds]: "Insufficient funds",
      [MintButtonState.ReadyToMint]: "Mint a goonie",
      [MintButtonState.WhiteList]: "White list only",
      [MintButtonState.Minting]: <Spinner />,
    }),
    [goLiveDate]
  );

  useEffect(() => {
    if (!isWhitelistUser && goLiveDate > new Date()) {
      setState(MintButtonState.NotLiveYet);
    } else if (!wallet.publicKey || !mintPrice) {
      setState(MintButtonState.Disabled);
    } else if (!isValidBalance) {
      setState(MintButtonState.InsufficientFunds);
    } else {
      setState(MintButtonState.ReadyToMint);
    }
  }, [wallet, balance, mintPrice, isValidBalance]);

  return (
    <div
      onClick={() => onMint()}
      style={{
        ...(state === MintButtonState.Disabled ||
        state === MintButtonState.NotLiveYet ||
        state === MintButtonState.WhiteList ||
        state === MintButtonState.InsufficientFunds
          ? { cursor: "not-allowed", opacity: 0.5, pointerEvents: "none" }
          : {}),
      }}
      className="h-12 bg-black text-white w-44 flex justify-center items-center cursor-pointer button hover:bg-retrogradient bg-[length:400px_400px]"
    >
      {mintButtonLabels[state]}
    </div>
  );
}

export default MintButton;
