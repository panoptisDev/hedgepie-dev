/** @jsx jsx */
/** @jsxRuntime classic */

import { ThemeProvider, jsx, Flex, Image, Select, Box, Label } from 'theme-ui'

import { theme } from 'themes/theme'

type Props = {
  items: any[]
  onChangePoolIdx: (idx: string) => void
}

const HPSelect = (props: Props) => {
  const { items, onChangePoolIdx } = props

  const onSelect = (e) => {
    onChangePoolIdx(e.target.value)
  }

  return (
    <ThemeProvider theme={theme}>
      <Flex p={2} css={{ gap: '1rem', width: '100%' }}>
        <Image src="./images/tako.svg" css={{ width: '70px' }} />
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '60px',
            overflow: 'hidden',
            marginBottom: '10px',
            backgroundColor: '#fff',
            borderRadius: '31px',
          }}
        >
          <Label
            sx={{
              position: 'absolute',
              marginTop: 6,
              width: '2rem',
              padding: '0px 20px',
              lineHeight: '48px',
              fontSize: '18px',
              top: -4,
              fontWeight: '700',
              color: '#16103A',
              opacity: '0.8',
            }}
          >
            INSTRUMENT
          </Label>

          <Select
            sx={{
              borderRadius: '10rem',
              outline: 'none',
              border: 0,
              minHeight: '3rem',
              textAlign: 'right',
              paddingInlineEnd: '24px',
              marginInline: '5px',
              flex: 1,
              width: '24rem',
              fontSize: '16px',
              fontWeight: '600',
              color: '#8E8DA0',
              marginBottom: '2px',
              appearance: 'none',
              WebkitAppearance: 'none',
              marginTop: '2px',
            }}
            mb={3}
            onChange={onSelect}
          >
            {items?.map((item) => {
              return <option value={item.value}>{item.name}</option>
            })}
          </Select>
        </Box>
      </Flex>
    </ThemeProvider>
  )
}

export default HPSelect
