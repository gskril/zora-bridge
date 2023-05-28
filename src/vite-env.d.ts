/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    isMetaMask?: true
    on?: (...args: any[]) => void
    removeListener?: (...args: any[]) => void
    request?: (...args: any[]) => any
    chainId?: string
    _state?: { isConnected?: boolean; isUnlocked?: boolean }
    selectedAddress: string | null
  }
}
