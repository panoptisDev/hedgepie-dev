import styled from 'styled-components'
import { flexbox } from 'styled-system'
import { FlexProps } from './types'

const Flex = styled.div<FlexProps>`
  display: flex;
  ${flexbox}
`

export default Flex
