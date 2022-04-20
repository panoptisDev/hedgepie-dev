import { Image, Box } from 'theme-ui'
import Select from 'react-select'

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
      <Box
        sx={{
          display: 'none',
          [`@media screen and (min-width: 600px)`]: {
            width: 62,
            height: 62,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            flexShrink: 0,
            borderRadius: '50%',
          },
        }}
      >
        <Image src="/images/logo.png" sx={{ height: 44 }} />
      </Box>
      <Box
        sx={{
          width: '100%',
          '& .select__control::before': {
            content: "'INSTRUMENT'",
            paddingLeft: '8px',
            fontWeight: 700,
            color: '#16103A',
          },
          '& .select__control': {
            height: 62,
            border: 'none',
            borderRadius: 62,
            padding: '0 24px',
          },
          '& .select__single-value': {
            color: '#8E8DA0',
            fontWeight: 700,
            textAlign: 'right',
          },
          '& .select__indicator-separator': {
            display: 'none',
          },
        }}
      >
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
