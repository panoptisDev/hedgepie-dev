import React from 'react'
import styled from 'styled-components'
import { InjectedProps } from './types'

interface Props extends InjectedProps {
  title: string
  hideCloseButton?: boolean
  onBack?: () => void
  bodyPadding?: string
}

const StyledModal = styled.div`
  background: #000000;
  box-shadow: 0px 20px 36px -8px rgba(14, 14, 44, 0.1), 0px 1px 1px rgba(0, 0, 0, 0.05);
  border: 1px solid #ffffff;
  border-radius: 32px;
  width: 100%;
  z-index: 99;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 24px;
`

const ModalTitle = styled.div`
  align-items: center;
  flex: 1;
`

const Modal: React.FC<Props> = ({
  title,
  onDismiss,
  onBack,
  children,
  hideCloseButton = false,
  bodyPadding = '24px',
}) => (
  <StyledModal>
    <ModalHeader>
      <ModalTitle>
        {onBack && <> {`Back `}</>}
        {`Title`}
      </ModalTitle>
      {!hideCloseButton && <> {`Close icon `}</>}
    </ModalHeader>
    <div>{children}</div>
  </StyledModal>
)

export default Modal
