import React from 'react'
import { Box } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'

const SummaryLegend = () => {

  const { formData } = React.useContext(MintWizardContext)
  const [data, setData] = React.useState<any>([])

  React.useEffect(() => {
    const allocated = Math.min(100, parseInt(formData.allocated || 0))
    let legendData = formData.order === 2 ? [
      {
        key: 'summary-artwork',
        title: 'Artwork',
        status: formData.artWorkUrl ? 'Set' : 'Not set'
      }
    ] : []
    legendData.push({
      key: 'summary-allocated',
      title: `${allocated}%`,
      status: 'Allocated'
    })
    if (allocated > 0 && allocated < 100) {
      legendData.push({
        key: 'summary-unallocated',
        title: `${100 - allocated}%`,
        status: 'Unallocated'
      })
    }
    setData(legendData)
  }, [formData.allocated])

  return (
    <Box as="table">
      <Box as="tbody">
        {data.map(d =>
          <Box as="tr" key={d.status}>
            <Box
              as="td"
              className={`${d.key}-title`}
              sx={{
                paddingRight: 12,
                color: '#0A3F5C',
                fontSize: 14,
                fontWeight: 700,
                [`@media screen and (min-width: 400px)`]: {
                  paddingRight: 24,
                  fontSize: 20,
                }
              }}
            >
              {d.title}
            </Box>
            <Box
              as="td"
              className={`${d.key}-status`}
              sx={{
                color: '#DF4886',
                fontSize: 14,
                fontWeight: 700,
                [`@media screen and (min-width: 400px)`]: {
                  fontSize: 20,
                }
              }}
            >
              {d.status}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default SummaryLegend