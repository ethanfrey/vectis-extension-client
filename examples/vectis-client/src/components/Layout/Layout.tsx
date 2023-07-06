import React, { PropsWithChildren } from "react";
import { useAppContext } from "../../providers/AppProvider";
import { GradientButton } from "../Buttons";
import { FiGithub } from "react-icons/fi";
import SimpleDropdown from "../Dropdowns/SimpleDropdown";

const chains = [
  { name: "Juno Testnet", chainId: "uni-6" },
  { name: "Stargaze Testnet", chainId: "elgafar-1" },
  { name: "Pulsarium DevNet", chainId: "pulsar-dev-1" },
];

const Layout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const { connectWallet, userKey, chain, setChain } = useAppContext();
  console.log("chain", chain);
  console.log("userKey", userKey);
  return (
    <div className="flex flex-col min-h-screen justify-between">
      <nav className="max-w-[1000px] p-4 mx-auto w-full flex items-center justify-between gap-4">
        {userKey && (
          <>
            <p className="font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500">
              TODO's
            </p>
            <div className="text-white text-md flex gap-4 justify-center items-center mx-4">
              <SimpleDropdown options={chains.map(({ name, chainId }) => ({ name, click: () => setChain(chainId) }))}>{chain}</SimpleDropdown>
            </div>
          </>
        )}
      </nav>
      {userKey ? (
        <div className="flex max-w-[1000px] w-full mx-auto p-4 h-full flex-1">{children}</div>
      ) : (
        <div className="flex items-center justify-center flex-1">
          <GradientButton onClick={connectWallet}>Log in!</GradientButton>
        </div>
      )}
      <footer className="w-full h-[5rem] bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 flex items-center justify-center mt-[6rem]">
        <a
          className="pointer hover:underline text-slate-900 text-xl font-bold flex gap-2"
          href="https://github.com/nymlab/vectis-extension-client"
          target="_blank"
        >
          <FiGithub size={24} /> Vectis - Example
        </a>
      </footer>
    </div>
  );
};

export default Layout;
