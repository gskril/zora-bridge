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
import useDebounce from './hooks/useDebounce'

function App() {
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  const { switchNetwork } = useSwitchNetwork({ chainId: 5 })

  const [amountEth, setAmountEth] = useState<number>(0.1)
  const debouncedAmountEth = useDebounce(amountEth, 500)

  const prepare = usePrepareSendTransaction({
    chainId: 5,
    to: '0x7cc09ac2452d6555d5e0c213ab9e2d44efbfc956',
    value: parseEther(`${debouncedAmountEth}`, 'wei'),
    enabled: debouncedAmountEth > 0,
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
            <a
              className="button"
              target="_blank"
              href={`https://goerli.etherscan.io/tx/${receipt.data?.transactionHash}`}
            >
              SUCCESS
            </a>
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
                <input
                  className="input"
                  type="number"
                  placeholder="Amount"
                  value={amountEth}
                  step={0.05}
                  min={0}
                  disabled={transaction.isLoading}
                  onChange={(e) => setAmountEth(Number(e.target.value))}
                />

                <button
                  className="button"
                  disabled={
                    !transaction.sendTransaction ||
                    debouncedAmountEth <= 0 ||
                    amountEth !== debouncedAmountEth
                  }
                  onClick={() => transaction.sendTransaction?.()}
                >
                  {transaction.isLoading ? 'CONFIRM IN WALLET' : 'BRIDGE'}
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
