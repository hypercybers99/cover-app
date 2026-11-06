// Generated automatically by scripts/sync_deployments.mjs
// Source of truth: cover-genlayer (tag: cover-v2)
// ADDRESS_REGISTRY.md and scripts/deploy/deployments_v2.json agreement verified.

export interface ContractDeployment {
  address: string;
  deployTx: string;
  sourceSha256: string;
  deployLatencySeconds?: string;
  explorerUrl: string;
}

export interface SupersededPair {
  version: string;
  cover: string;
  coverGuard: string;
  reason: string;
  explorerUrlCover: string;
  explorerUrlGuard: string;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
}

export const NETWORK: NetworkConfig = {
  name: 'GenLayer Studionet',
  chainId: 61999,
  rpcUrl: 'https://studio.genlayer.com/api',
  explorerUrl: 'https://explorer-studio.genlayer.com',
};

export const DEPLOYMENTS: {
  cover: ContractDeployment;
  coverGuard: ContractDeployment;
  superseded: {
    cover: string;
    coverGuard: string;
  };
  supersededList: SupersededPair[];
  promptSha256: string;
  parseExtractionSha256: string;
} = {
  cover: {
    address: '0x3d2698cED9292689f68b401e888fbA1d18CBfdE3',
    deployTx: '0x3f4ef296da9e609ba83dc5ed5c866910e26fd7eb9055273142683618b5e8a8a8',
    sourceSha256: '0b2f91d2b64dee1dce4aa13c15c19c274546dd64fff8b738325067c37a12b296',
    deployLatencySeconds: '8.78',
    explorerUrl: 'https://explorer-studio.genlayer.com/address/0x3d2698cED9292689f68b401e888fbA1d18CBfdE3',
  },
  coverGuard: {
    address: '0xfEebb7147Dd65b5EbEa7C6634ed4549B45993A1A',
    deployTx: '0xdecd58ff74a091ed5b1e7ddb8f188402d1e06ebf92517147cb92199e14fd0b3e',
    sourceSha256: 'e0546c62266e7ab13b0aaa70489ada2625849742f004cb21732aaef03cd901a1',
    deployLatencySeconds: '5.83',
    explorerUrl: 'https://explorer-studio.genlayer.com/address/0xfEebb7147Dd65b5EbEa7C6634ed4549B45993A1A',
  },
  superseded: {
    cover: '0x4d12d00d527869a6a6f95358A11589ecf3C347e3',
    coverGuard: '0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724',
  },
  supersededList: [
    {
      version: 'V1',
      cover: '0x4d12d00d527869a6a6f95358A11589ecf3C347e3',
      coverGuard: '0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724',
      reason: 'Superseded by V2 following reviewer alignment on purchase-time term binding and CoverGuard signature alignment.',
      explorerUrlCover: 'https://explorer-studio.genlayer.com/address/0x4d12d00d527869a6a6f95358A11589ecf3C347e3',
      explorerUrlGuard: 'https://explorer-studio.genlayer.com/address/0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724',
    },
    {
      version: 'V0',
      cover: '0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd',
      coverGuard: '0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF',
      reason: 'Initial Milestone 4 deployment, superseded by V1.',
      explorerUrlCover: 'https://explorer-studio.genlayer.com/address/0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd',
      explorerUrlGuard: 'https://explorer-studio.genlayer.com/address/0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF',
    },
  ],
  promptSha256: '5a8c842c53e4329313d349afa6932672980dd1e8466af75118eeb8df010daa1d',
  parseExtractionSha256: 'c44e054a7af6a9abb30fbc536895ce61532bf2edf016497d23a53ab094370978',
};

export const ACTIVE_DEPLOYMENTS = DEPLOYMENTS;
export const GENLAYER_STUDIONET = NETWORK;
