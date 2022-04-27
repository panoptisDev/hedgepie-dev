import React, { ReactNode } from 'react'
import Head from 'next/head'
import { theme } from 'themes/theme'
import { ThemeProvider } from 'theme-ui'
import { Header } from 'components/Header'
import { TitleMast } from 'components/TitleMast'
import { Footer } from 'components/Footer'

import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

type Props = {
  title?: string
  children?: ReactNode
  dark?: boolean
  overlayHeader?: boolean
}

const HedgePieFinance = (props: Props) => {
  const { title, children } = props
  return (
    <ThemeProvider theme={theme}>
      <Header dark={props.dark} overlay={props.overlayHeader} />
      {title && <TitleMast title={title} />}
      <Head>
        <title>Hedge Pie</title>
        <meta name="description" content="Hedge Pie Finance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {children}
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        icon={false}
        closeButton={true}
      />
      <Footer />
    </ThemeProvider>
  )
}

export default HedgePieFinance
