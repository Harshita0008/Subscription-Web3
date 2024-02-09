"use client";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { bsc, sepolia, polygonMumbai} from 'viem/chains'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '99aaa8abb4fc4ad14d307cb588a8d560'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [sepolia, polygonMumbai]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })

export function Web3Modal({ children } : {children : React.ReactNode}) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}