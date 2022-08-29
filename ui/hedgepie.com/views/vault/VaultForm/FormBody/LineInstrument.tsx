import { Image, Box, ThemeUICSSObject } from 'theme-ui'
import Select from 'react-select'
import { styles } from '../styles'

const LineInstrument = ({ items, onChangePoolIdx }) => {
  const handleSelect = (option) => {
    onChangePoolIdx(option.value)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 18,
      }}
    >
      <Box sx={styles.vault_instrument_logo_container as ThemeUICSSObject}>
        <Image src="/images/logo.png" sx={{ height: 44 }} />
      </Box>
      <Box sx={styles.vault_instrument_select as ThemeUICSSObject}>
        <Select
          instanceId="hp-instrument"
          classNamePrefix="select"
          name="color"
          isSearchable={false}
          options={items}
          placeholder=""
          // value={items[0]}
          getOptionLabel={(option: any) => option['name']}
          onChange={handleSelect}
          id="instrument-select"
        />
      </Box>
      {/* <Box
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
            return (
              <option key={item.value} value={item.value}>
                {item.name}
              </option>
            )
          })}
        </Select>
      </Box> */}
    </Box>
  )
}

export default LineInstrument
