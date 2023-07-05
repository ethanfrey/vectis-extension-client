import React, { PropsWithChildren, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "react-use";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import { VectisCosmosProvider, getVectisForCosmos, KeyInfo } from "@vectis/extension-client";

import { ITodo } from "../interfaces/ITodo";
import { TodoStatus } from "../interfaces/TodoStatus";

const CODES_ID = {
  "uni-6": 2545,
  "elgafar-1": 2609,
  "pulsar-dev-1": 1,
};

const CHAIN_CONFIG = {
  "uni-6": {
    gasPrice: GasPrice.fromString("0.003ujunox"),
    rpcUrl: "https://rpc.testcosmos.directory/junotestnet",
  },
  "elgafar-1": {
    gasPrice: GasPrice.fromString("0.04ustars"),
    rpcUrl: "https://rpc.testcosmos.directory/stargazetestnet",
  },
  "pulsar-dev-1": {
    gasPrice: GasPrice.fromString("0.025upulse"),
    rpcUrl: "http://localhost:26657",
  },
};

interface AppContextValue {
  userKey: KeyInfo | null;
  connectWallet: () => void;
  todos: ITodo[];
  addTodo: (description: string) => void;
  contractAddr: string | undefined;
  instantiateTodoContract: () => void;
  queryTodos: () => void;
  deleteTodo: (id: number) => void;
  updateTodoDescription: (id: number, description: string) => void;
  updateTodoStatus: (id: number, status: TodoStatus) => void;
  setChain: (chain: string) => void;
  chain: string;
}

export const AppContext = React.createContext<AppContextValue | null>(null);

const AppProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [chain, setChain] = useState("pulsar-dev-1");
  // const [chain, setChain] = useState("uni-6");
  const [userKey, setUserKey] = useState<KeyInfo | null>(null);
  const [vectisClient, setVectisClient] = useState<VectisCosmosProvider | null>(null);
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null);
  const [allowPermission, setAllowPermission] = useLocalStorage<boolean>("allowPermission");
  const [contractAddr, setContractAddr] = useLocalStorage<string>(`${userKey?.address}contractAddr`);

  const instantiateTodoContract = async () => {
    if (!userKey || !client) return toast.error("Please connect your wallet");
    const { contractAddress } = await toast.promise(
      client.instantiate(userKey.address, CODES_ID[chain as keyof typeof CODES_ID], { owner: userKey.address }, "Todo-List", "auto"),
      {
        loading: "Loading...",
        success: "Instantiated!",
        error: (err) => err.message,
      },
      {
        success: {
          icon: "🔥",
        },
      }
    );
    setContractAddr(contractAddress);
  };

  const connectWallet = async () => {
    try {
      const vectis = await getVectisForCosmos();

      const localnet = {
        chainId: "pulsar-dev-1",
        chainName: "localhost",
        prettyName: "Pulsarium DevNet",
        rpcUrl: "http://localhost:26657",
        restUrl: "http://localhost:1317",
        bech32Prefix: "pulsar",
        bip44: {
          coinType: 118
        }, 
        stakeCurrency: {
          coinDenom: "Pulse",
          coinMinimalDenom: "upulse",
          coinDecimals: 6,
        },
        feeCurrencies: [{
          coinDenom: "Pulse",
          coinMinimalDenom: "upulse",
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04
          }
        }],
        features: [],
        currencies: [],
        ecosystem: 'cosmos',
      };
      await vectis.suggestChains([localnet]);

      // Enable connection to allow read and write permission;
      const key = await vectis.getKey(chain);
      // This method decide for you what is the best signer to sign transaction
      const signer = await vectis.getOfflineSignerDirect(chain);

      const config = CHAIN_CONFIG[chain as keyof typeof CHAIN_CONFIG];
      const client = await SigningCosmWasmClient.connectWithSigner(config.rpcUrl, signer, {
        gasPrice: config.gasPrice,
      });

      // TODO: remove only for demo
      const address = (await signer.getAccounts())[0].address;
      const balance = await client.getBalance(address, "upulse");
      console.info(`${address} has balance: ${balance.amount} upulse`);

      // TODO: Try to send (demo)
      await client.sendTokens(address, "pulsar1hsm76p4ahyhl5yh3ve9ur49r5kemhp2rwdtsdr", [{ amount: "1000000", denom: "upulse" }], "auto", "Sent from Vectis");

      setUserKey(key);
      setVectisClient(vectis);
      setClient(client);
      setAllowPermission(true);
    } catch (err) {
      console.log(err);
      toast.error(err as string);
    }
  };

  const queryTodos = async () => {
    if (!contractAddr || !client) return;
    const { todos } = await client.queryContractSmart(contractAddr, {
      get_todo_list: { addr: userKey?.address, limit: 30 },
    });
    setTodos(todos);
  };

  const execute = async (msg: Record<string, any>) => {
    if (!userKey?.address || !contractAddr || !client) return;
    await toast.promise(
      client.execute(userKey.address, contractAddr, msg, "auto"),
      {
        loading: "Loading...",
        success: "Successfully executed!",
        error: "Error when executed",
      },
      {
        success: {
          icon: "🔥",
        },
      }
    );
    await queryTodos();
  };

  const addTodo = async (description: string) => {
    await execute({ add_todo: { description } });
  };

  const deleteTodo = async (id: number) => {
    await execute({ delete_todo: { id } });
  };

  const updateTodoDescription = async (id: number, description: string) => {
    await execute({ update_todo: { id, description } });
  };

  const updateTodoStatus = async (id: number, status: TodoStatus) => {
    await execute({ update_todo: { id, status } });
  };

  useEffect(() => {
    if (allowPermission) connectWallet();
  }, [chain]);

  useEffect(() => {
    if (!vectisClient) return;
    vectisClient.onAccountChange(connectWallet);
    return () => vectisClient.offAccountChange(connectWallet);
  }, [vectisClient]);

  useEffect(() => {
    if (!contractAddr || !client) return;
    queryTodos();
  }, [client]);

  return (
    <AppContext.Provider
      value={{
        userKey,
        connectWallet,
        todos,
        addTodo,
        contractAddr,
        instantiateTodoContract,
        queryTodos,
        deleteTodo,
        updateTodoDescription,
        updateTodoStatus,
        chain,
        setChain,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) throw new Error("App Context Provider is not instanced");
  return context;
};

export default AppProvider;
