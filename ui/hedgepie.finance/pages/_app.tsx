/* eslint-disable no-use-before-define */
import React from 'react'
import type { AppProps } from 'next/app'
import { Web3ContextProvider } from '../contexts/web3Context'
import { Web3ReactProvider } from '@web3-react/core'
import { getLibrary } from 'utils/web3React'
import { Provider } from 'react-redux'
import store from 'state'
import { ModalProvider } from 'widgets/Modal'
import '../styles/globals.css'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Provider store={store}>
        <ModalProvider>
          <Component {...pageProps} />
        </ModalProvider>
      </Provider>
    </Web3ReactProvider>
  )
}

export default MyApp
