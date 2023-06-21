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
import { useAddChain, zoraTestnet, zoraMainnet } from './hooks/useAddChain'
import useDebounce from './hooks/useDebounce'
import { buildEtherscanLink, buildZoraExplorerLink } from './utils'

function App() {
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  const { switchNetwork: switchToGoerli, isLoading: isSwitchToGoerliLoading } =
    useSwitchNetwork({ chainId: 5 })
  const {
    switchNetwork: switchToHomestead,
    isLoading: isSwitchToHomesteadLoading,
  } = useSwitchNetwork({ chainId: 1 })

  const {
    addChain: addZoraTestnet,
    isLoading: addZoraTestnetIsLoading,
    isSuccess: _addZoraTestnetIsSuccess,
    isEnabled: isMetaMask,
  } = useAddChain(zoraTestnet)

  const {
    addChain: addZoraMainnet,
    isLoading: addZoraMainnetIsLoading,
    isSuccess: _addZoraMainnetIsSuccess,
  } = useAddChain(zoraMainnet)

  const [isTestnet, setIsTestnet] = useState(true)
  const [addZoraIsSuccess, setAddZoraIsSuccess] = useState(false)
  const [amountEth, setAmountEth] = useState<string>('')
  const debouncedEth = useDebounce(amountEth, 500)
  const numberRegex = /^\d*\.?\d*$/

  // make the default ETH amount lower on mainnet
  useEffect(() => {
    if (isTestnet) {
      setAmountEth('0.1')
    } else {
      setAmountEth('0.01')
    }
  }, [isTestnet])

  const isCorrectChain = chain?.id === (isTestnet ? 5 : 1)

  useEffect(() => {
    if (_addZoraTestnetIsSuccess || _addZoraMainnetIsSuccess) {
      setAddZoraIsSuccess(true)
    }
  }, [_addZoraTestnetIsSuccess, _addZoraMainnetIsSuccess])

  const prepare = usePrepareSendTransaction({
    chainId: isTestnet ? 5 : 1,
    to: isTestnet
      ? '0xDb9F51790365e7dc196e7D072728df39Be958ACe'
      : '0x1a0ad011913a150f69f6a19df447a0cfd9551054',
    value: numberRegex.test(debouncedEth)
      ? parseEther(`${Number(debouncedEth)}`, 'wei')
      : undefined,
    enabled: numberRegex.test(debouncedEth) && Number(debouncedEth) > 0,
  })

  const transaction = useSendTransaction(prepare.config)
  const receipt = useWaitForTransaction({ hash: transaction.data?.hash })

  useEffect(() => {
    if (receipt.isSuccess) {
      plausible.trackEvent('Bridge ETH', {
        props: {
          network: isTestnet ? 'testnet' : 'mainnet',
        },
      })
    }
  }, [isTestnet, receipt.isSuccess])

  return (
    <main>
      <h1>BRIDGE TO ZORA</h1>
      <div className="network-toggle">
        <button
          onClick={() => {
            setIsTestnet(true)

            // switch to goerli if not already on goerli
            if (chain?.id !== 5) {
              switchToGoerli?.()
            }
          }}
          disabled={!!transaction?.data?.hash}
          className={isTestnet ? '' : 'light'}
        >
          TESTNET
        </button>
        <span style={{ opacity: 0.5 }}>/</span>
        <button
          onClick={() => {
            setIsTestnet(false)

            // switch to homestead if not already on homestead
            if (chain?.id !== 1) {
              switchToHomestead?.()
            }
          }}
          disabled={!!transaction?.data?.hash}
          className={isTestnet ? 'light' : ''}
        >
          MAINNET
        </button>
      </div>

      {!isTestnet && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.3125rem 0.5rem',
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
          }}
        >
          <span>⚠︎ MAINNET IS BRAND NEW. CONTINUE AT YOUR OWN RISK ⚠︎</span>
        </div>
      )}

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
        ) : receipt.isError ? (
          <>
            <div className="button">TRANSACTION FAILED :/</div>
            <button onClick={() => window.location.reload()}>
              REFRESH AND TRY AGAIN
            </button>
          </>
        ) : receipt.isSuccess ? (
          <>
            {!isMetaMask || addZoraIsSuccess ? (
              <>
                <a
                  className="button"
                  target="_blank"
                  href={buildZoraExplorerLink(chain?.id, address)}
                >
                  VIEW ON ZORA EXPLORER
                </a>
                <p>OURS TRULY, ☾☼☽</p>
              </>
            ) : (
              <>
                <button
                  className="button"
                  onClick={() => {
                    if (isTestnet) {
                      addZoraTestnet?.()
                    } else {
                      addZoraMainnet?.()
                    }
                  }}
                >
                  <LoadingText
                    loading={addZoraTestnetIsLoading || addZoraMainnetIsLoading}
                  >
                    ADD NETWORK TO 🦊
                  </LoadingText>
                </button>
                <button onClick={() => setAddZoraIsSuccess(true)}>SKIP</button>
              </>
            )}
          </>
        ) : transaction.data?.hash ? (
          <>
            <div className="button">
              <LoadingText>BRIDGING</LoadingText>
            </div>
            <span>
              <a
                target="_blank"
                href={buildEtherscanLink(chain?.id, transaction.data?.hash)}
              >
                VIEW ON ETHERSCAN
              </a>
            </span>
          </>
        ) : (
          <>
            {chain?.id === 5 || chain?.id === 1 ? (
              <>
                <div className="input-wrapper">
                  <label htmlFor="input">ETH</label>
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
                    : !isCorrectChain
                    ? 'WRONG NETWORK'
                    : 'BRIDGE'}
                </button>
              </>
            ) : (
              <button className="button" onClick={() => switchToGoerli?.()}>
                SWITCH NETWORK
              </button>
            )}

            {!isCorrectChain ? (
              <button
                onClick={() => {
                  if (isTestnet) {
                    switchToGoerli?.()
                  } else {
                    switchToHomestead?.()
                  }
                }}
              >
                {isSwitchToGoerliLoading || isSwitchToHomesteadLoading ? (
                  <LoadingText>SWITCH NETWORK</LoadingText>
                ) : (
                  'SWITCH NETWORK'
                )}
              </button>
            ) : (
              <button onClick={() => disconnect?.()}>DISCONNECT</button>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default App
