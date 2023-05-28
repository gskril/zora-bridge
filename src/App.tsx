import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import {
  useAccount,
  useNetwork,
  useDisconnect,
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
  useSwitchNetwork,
} from 'wagmi'
import { parseEther } from 'viem'

import { LoadingText } from './components/LoadingText'
import { plausible } from './plausible'
import { useAddChain, zoraChain } from './hooks/useAddChain'
import useDebounce from './hooks/useDebounce'

function App() {
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  const { switchNetwork } = useSwitchNetwork({ chainId: 5 })
  const {
    addChain,
    isLoading: addNetworkIsLoading,
    isSuccess: addNetworkIsSuccess,
    isEnabled: isMetaMask,
  } = useAddChain(zoraChain)

  const [amountEth, setAmountEth] = useState<string>('0.1')
  const debouncedEth = useDebounce(amountEth, 500)
  const numberRegex = /^\d*\.?\d*$/

  const prepare = usePrepareSendTransaction({
    chainId: 5,
    to: '0x7cc09ac2452d6555d5e0c213ab9e2d44efbfc956',
    value: numberRegex.test(debouncedEth)
      ? parseEther(`${Number(debouncedEth)}`, 'wei')
      : undefined,
    enabled: numberRegex.test(debouncedEth) && Number(debouncedEth) > 0,
  })

  const transaction = useSendTransaction(prepare.config)
  const receipt = useWaitForTransaction({ hash: transaction.data?.hash })

  useEffect(() => {
    if (receipt.isSuccess) {
      plausible.trackEvent('Bridge ETH')
    }
  }, [receipt.isSuccess])

  return (
    <main>
      <h1>BRIDGE TO ZORA</h1>
      <h2>
        <a href="https://youtu.be/T2TDSEG57hI?t=101" target="_blank">
          "CLOSE YOUR EYES
          <br />
          BUT KEEP YOUR MIND WIDE OPEN"
        </a>
      </h2>

      <div className="input-group">
        {!address ? (
          <button className="button" onClick={() => openConnectModal?.()}>
            CONNECT
          </button>
        ) : receipt.isSuccess ? (
          <>
            {!isMetaMask || addNetworkIsSuccess ? (
              <a
                className="button"
                target="_blank"
                href={`https://goerli.etherscan.io/tx/${receipt.data?.transactionHash}`}
              >
                SUCCESS
              </a>
            ) : (
              <button className="button" onClick={() => addChain?.()}>
                <LoadingText loading={addNetworkIsLoading}>
                  ADD NETWORK TO 🦊
                </LoadingText>
              </button>
            )}

            <p>OURS TRULY, ☾☼☽</p>
          </>
        ) : transaction.data?.hash ? (
          <>
            <a
              className="button"
              target="_blank"
              href={`https://goerli.etherscan.io/tx/${transaction.data.hash}`}
            >
              <LoadingText>BRIDGING</LoadingText>
            </a>
            <button onClick={() => disconnect?.()}>DISCONNECT</button>
          </>
        ) : (
          <>
            {chain?.id === 5 ? (
              <>
                <div className="input-wrapper">
                  <label
                    htmlFor="input"
                    style={{
                      letterSpacing: 'initial',
                    }}
                  >
                    ETH
                  </label>
                  <input
                    className="input"
                    id="input"
                    type="text"
                    inputMode="decimal"
                    value={amountEth}
                    disabled={transaction.isLoading}
                    onChange={(e) => setAmountEth(e.target.value)}
                  />
                </div>

                <button
                  className="button"
                  disabled={
                    !transaction.sendTransaction ||
                    amountEth !== debouncedEth ||
                    Number(debouncedEth) <= 0 ||
                    !numberRegex.test(debouncedEth)
                  }
                  onClick={() => transaction.sendTransaction?.()}
                >
                  {transaction.isLoading
                    ? 'CONFIRM IN WALLET'
                    : prepare.error?.name === 'EstimateGasExecutionError'
                    ? 'INSUFFICIENT FUNDS'
                    : 'BRIDGE'}
                </button>
              </>
            ) : (
              <button className="button" onClick={() => switchNetwork?.()}>
                SWITCH NETWORK
              </button>
            )}
            <button onClick={() => disconnect?.()}>DISCONNECT</button>
          </>
        )}
      </div>
    </main>
  )
}

export default App
