import { HardhatUserConfig } from 'hardhat/config'
import { NetworkUserConfig } from 'hardhat/types'
// hardhat plugin
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomicfoundation/hardhat-toolbox'

import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

dotenvConfig({ path: resolve(__dirname, './.env') })

const chainIds = {
  mainnet: 1,
  goerli: 5,
  hardhat: 31337,
  'chiado-testnet': 10200,
  'mantle-testnet': 5001,
  'polygon-mumbai': 80001,
  'scroll-alpha': 534353,
  'celo-alfajores': 44787,
}

// Ensure that we have all the environment variables we need.
const pk: string | undefined = process.env.PRIVATE_KEY
if (!pk) {
  throw new Error('Please set your pk in a .env file')
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY
if (!infuraApiKey) {
  throw new Error('Please set your INFURA_API_KEY in a .env file')
}

function getChainConfig (chain: keyof typeof chainIds): NetworkUserConfig {
  let jsonRpcUrl: string
  switch (chain) {
    case 'chiado-testnet':
      jsonRpcUrl = 'https://rpc.chiado.gnosis.gateway.fm'
      break
    case 'mantle-testnet':
      jsonRpcUrl = 'https://rpc.testnet.mantle.xyz'
      break
    case 'polygon-mumbai':
      jsonRpcUrl = `http://${process.env.QUORUM_URL}:8545`
      break
    case 'scroll-alpha':
      jsonRpcUrl = `https://alpha-rpc.scroll.io/12`
      break
    default:
      jsonRpcUrl = `https://${chain}.infura.io/v3/${infuraApiKey}`
  }
  return {
    accounts: [`0x${pk}`],
    chainId: chainIds[chain],
    url: jsonRpcUrl,
  }
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: chainIds.hardhat,
    },
    local: {
      url: 'http://127.0.0.1:8545',
    },
    mainnet: getChainConfig('mainnet'),
    goerli: getChainConfig('goerli'),
    'chiado-testnet': getChainConfig('chiado-testnet'),
    'mantle-testnet': getChainConfig('mantle-testnet'),
    'polygon-mumbai': getChainConfig('polygon-mumbai'),
    'scroll-alpha': getChainConfig('scroll-alpha'),
    'celo-alfajores': getChainConfig('celo-alfajores')
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  solidity: {
    version: '0.8.17',
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/hardhat-template/issues/31
        bytecodeHash: 'none',
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || '',
      goerli: process.env.GOERLISCAN_API_KEY || '',
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || '',
      chiadoTestnet: process.env.CHIADOSCAN_API_KEY || '',
      mantleTestnet: process.env.MANTLESCAN_API_KEY || '',
      scrollAlpha: process.env.SCROLLSCAN_API_KEY || '',
      celoAlfajores: process.env.CELOSCAN_API_KEY || '',
    },
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 100,
    enabled: process.env.REPORT_GAS as string === 'true',
    excludeContracts: [],
    src: './contracts',
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
}

export default config
