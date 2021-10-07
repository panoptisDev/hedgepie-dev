import React from 'react'
import { IWeb3Context } from './types'

const DefaultWeb3Context: IWeb3Context = {}

const Web3Context = React.createContext(DefaultWeb3Context)

const { Provider, Consumer } = Web3Context

export {
  Provider as Web3Provider,
  Consumer as Web3Consumer,
  DefaultWeb3Context
}

export default Web3Context