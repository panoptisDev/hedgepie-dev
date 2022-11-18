import MintContextProvider from './MintContextProvider'
import MintWizardContainer from './MintWizardContainer'

const MintWizard = (props: { tokenId?: number }) => {
  return (
    <MintContextProvider>
      <MintWizardContainer />
    </MintContextProvider>
  )
}

export default MintWizard
