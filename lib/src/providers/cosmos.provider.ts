import {
  AccountData,
  AminoSignResponse,
  DirectSignResponse,
  OfflineSigner,
  OfflineAminoSigner,
  OfflineDirectSigner,
  SignDoc,
  StdSignDoc,
  StdSignature
} from '../types/cosmos';
import { ChainInfo, KeyInfo, CosmosProvider } from '../types';

export class VectisCosmosProvider {
  getClient(): CosmosProvider {
    if (window.vectis?.cosmos) return window.vectis.cosmos;
    throw new Error('Vectis is not installed');
  }

  async enable(chainIds: string | string[]): Promise<void> {
    await this.getClient().enable(chainIds);
  }

  async getKey(chainId: string): Promise<KeyInfo> {
    return await this.getClient().getKey(chainId);
  }

  async getAccount(chainId: string): Promise<AccountData[]> {
    return await this.getClient().getAccounts(chainId);
  }

  async getSupportedChains(): Promise<ChainInfo[]> {
    return await this.getClient().getSupportedChains();
  }

  async suggestChains(chainsInfo: ChainInfo[]): Promise<void> {
    await this.getClient().suggestChains(chainsInfo);
  }

  async isChainSupported(chainId: string): Promise<boolean> {
    const supportedChains = await this.getClient().getSupportedChains();
    return supportedChains.some((c) => c.chainId === chainId);
  }

  async signAmino(signerAddress: string, doc: StdSignDoc): Promise<AminoSignResponse> {
    return await this.getClient().signAmino(signerAddress, doc);
  }

  async signDirect(signerAddress: string, doc: SignDoc): Promise<DirectSignResponse> {
    return await this.getClient().signDirect(signerAddress, doc);
  }

  async signArbitrary(chainId: string, signerAddress: string, message: string | Uint8Array): Promise<AminoSignResponse> {
    return await this.getClient().signArbitrary(chainId, signerAddress, message);
  }

  async verifyArbitrary(chainId: string, signerAddress: string, message: string | Uint8Array, signature: StdSignature): Promise<boolean> {
    return await this.getClient().verifyArbitrary(chainId, signerAddress, message, signature);
  }

  async getOfflineSignerAuto(chainId: string): Promise<OfflineAminoSigner | OfflineDirectSigner> {
    return await this.getClient().getOfflineSignerAuto(chainId);
  }

  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return this.getClient().getOfflineSignerAmino(chainId);
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return this.getClient().getOfflineSignerDirect(chainId);
  }

  getOfflineSigner(chainId: string): OfflineSigner {
    return this.getClient().getOfflineSigner(chainId);
  }

  onAccountChange(handler: EventListener): void {
    window.addEventListener('vectis_accountChanged', handler);
  }

  offAccountChange(handler: EventListener): void {
    window.removeEventListener('vectis_accountChanged', handler);
  }
}
