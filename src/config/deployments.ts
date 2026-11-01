// Generated automatically by scripts/sync_deployments.mjs
// Source of truth: cover-genlayer (tag: cover-v1-final)
// ADDRESS_REGISTRY.md and scripts/deploy/deployments.json agreement verified.

export interface ContractDeployment {
  address: string;
  deployTx: string;
  sourceSha256: string;
  deployLatencySeconds?: string;
  explorerUrl: string;
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
  promptSha256: string;
} = {
  cover: {
    address: '0x4d12d00d527869a6a6f95358A11589ecf3C347e3',
    deployTx: '0x311652e1597eba4cb1d90581980c076c0ecb5708ab051756af3fbfa0db804b94',
    sourceSha256: 'a1f8ceb89f55db9aa6fe55fb60f4783643212eb127e9c2f76b59266c921d89cc',
    deployLatencySeconds: '10.62',
    explorerUrl: 'https://explorer-studio.genlayer.com/address/0x4d12d00d527869a6a6f95358A11589ecf3C347e3',
  },
  coverGuard: {
    address: '0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724',
    deployTx: '0xda046cfaaa78a30b40e226840e1032ee6b637307874b7704a92be72d44321b97',
    sourceSha256: 'b2682e9e48b67a0ac95148b25d0e10694fad671359144d2b79368f8b921f7d53',
    deployLatencySeconds: '9.53',
    explorerUrl: 'https://explorer-studio.genlayer.com/address/0x6Ad8554F4Ca7eA3681c6a06b822B0d5c59993724',
  },
  superseded: {
    cover: '0x41f8c399e2709333AEAD1F8Ac0B1E5248eC288Bd',
    coverGuard: '0x85C0F67F1Cd82aBcCfABb289E6c215c78D17b3eF',
  },
  promptSha256: '90be3b95dd867b8cc3a04f9464e3a1ab3b499343d3c4a40664042651092ecca1',
};
