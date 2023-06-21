export function buildEtherscanLink(
  chainId: number | undefined,
  txHash: string
) {
  return `https://${chainId === 5 ? 'goerli.' : ''}etherscan.io/tx/${txHash}`
}

export function buildZoraExplorerLink(
  chainId: number | undefined,
  address: string
) {
  return `https://${
    chainId === 5 ? 'testnet.' : ''
  }explorer.zora.co/address/${address}`
}
