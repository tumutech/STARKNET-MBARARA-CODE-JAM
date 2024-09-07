'use client';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useContractRead, useAccount, useContractWrite, useContract,useExplorer,useWaitForTransaction, } from "@starknet-react/core";
import contractAbi from "../abis/abi.json";
import { useState, useMemo } from 'react';

const WalletBar = dynamic(() => import('../components/WalletBar'), { ssr: false })
const Page: React.FC = () => {
  const contractAddress = "0x6b576267e7ed248233be4229e3538cb4cc15cf6f0970cb14d0c162c97f7aab9";
  const { data: readData, isError: readIsError, isLoading: readIsLoading, error: readError } = useContractRead({
    functionName: "get",
    args: [],
    abi: contractAbi,
    address: contractAddress,
    watch: true,
  });

  const { address: userAddress } = useAccount();
  const [value, setValue] = useState(0);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Setting counter value ", value);
    writeAsync();
  };
  
  const { contract } = useContract({
    abi: contractAbi,
    address: contractAddress,
  });
  const calls = useMemo(() => {
    if (!userAddress || !contract) return [];
    return contract.populateTransaction["set"]!({ low: (value ? value : 0), high: 0 });
  }, [contract, userAddress, value]);
  const {
    writeAsync,
    data: writeData,
    isPending: writeIsPending,
  } = useContractWrite({
    calls,
  });
  const explorer = useExplorer();
  const { isLoading: waitIsLoading, isError: waitIsError, error: waitError, data: waitData } = useWaitForTransaction({ hash: writeData?.transaction_hash, watch: true })
  const LoadingState = ({ message }: { message: string }) => (
    <div className="flex items-center space-x-2">
      <div className="animate-spin">
        <svg className="h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <span>{message}</span>
    </div>
  );
  const buttonContent = () => {
    if (writeIsPending) {
      return <LoadingState message="Send..." />;
    }

    if (waitIsLoading) {
      return <LoadingState message="Waiting for confirmation..." />;
    }

    if (waitData && waitData.status === "REJECTED") {
      return <LoadingState message="Transaction rejected..." />;
    }

    if (waitData) {
      return "Transaction confirmed";
    }

    return "Send";
  };


  
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <Head>
        <title>STARKNET MBARARA CODE JAM</title>
      </Head>
      <div className="flex flex-row mb-4">
        <WalletBar />
      </div>
      <h1 className="text-3xl font-bold underline">Welcome to Starknet Mbarara Code Jam!</h1>

      <div
        className={`p-4 w-full max-w-md m-4 bg-white border-black border`}>
        <h3 className="text-2xl font-bold mb-2">Read your Contract</h3>
        <p>Counter Value: {readData?.toString()}</p>
        <div className="flex justify-center pt-4">
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 w-full max-w-md m-4 border-black border">
        <h3 className="text-2xl font-bold mb-2">Write to a Contract</h3>
        <label
          htmlFor="value"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Amount:
        </label>
        <input
          type="number"
          id="value"
          value={value}
          onChange={(event) => setValue(event.target.valueAsNumber)}
          className="block w-full px-3 py-2 text-sm leading-6 border-black focus:outline-none focus:border-yellow-300 black-border-p"
        />
        {writeData?.transaction_hash && (
          <a
            href={explorer.transaction(writeData?.transaction_hash)}
            target="_blank"
            className="text-blue-500 hover:text-blue-700 underline"
            rel="noreferrer">Check TX on {explorer.name}</a>
        )}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className={`border border-black text-black font-regular py-2 px-4 ${userAddress ? "bg-yellow-300 hover:bg-yellow-500" : "bg-white"} `}
            disabled={!userAddress}
          >
            {buttonContent()}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;