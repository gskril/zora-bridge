import { useCallback, useMemo, useState } from 'react'

interface AddChain {
  chainId: string
  chainName: string
  nativeCurrency: {
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

export const zoraTestnet: AddChain = {
  chainId: '0x3e7', // 999
  chainName: 'Zora Testnet',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://testnet.rpc.zora.co'],
  blockExplorerUrls: ['https://testnet.explorer.zora.co'],
}

export const zoraMainnet: AddChain = {
  chainId: '0x76adf1', // 7777777
  chainName: 'Zora',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.zora.co'],
  blockExplorerUrls: ['https://explorer.zora.co'],
}

export function useAddChain(chain: AddChain) {
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>()
  const provider = useInjectedProvider()

  const addChain = useCallback(async () => {
    if (provider && provider.request) {
      setError(undefined)

      try {
        setIsLoading(true)
        const response = await provider.request({
          method: 'wallet_addEthereumChain',
          params: [chain],
        })

        setIsLoading(false)
        if (response !== null) {
          return setError('Failed to Switch Network')
        }

        setIsSuccess(true)
      } catch (e) {
        console.log(e)
        setIsLoading(false)
        setError('Failed to Switch Network')
      }
    }
  }, [chain, provider])

  return {
    error,
    addChain,
    isLoading,
    isSuccess,
    isEnabled:
      provider?.isMetaMask &&
      provider?._state?.isUnlocked &&
      provider.selectedAddress,
  }
}

function useInjectedProvider() {
  const { ethereum: library } = window
  return useMemo(() => library, [library])
}
