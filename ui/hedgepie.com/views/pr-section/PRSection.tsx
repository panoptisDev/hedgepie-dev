import axios from 'axios'
import React, { useState } from 'react'
import { Box, Button, Input, Text } from 'theme-ui'
import toast from 'utils/toast'

function PRSection() {
  const [email, setEmail] = useState('')

  const validateEmail = (mail) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true
    }
    return false
  }

  const onEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const sendEmail = async () => {
    toast(`Sending introductory Email to ${email} !!`)
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
      service_id: 'hedgepie-web',
      template_id: 'hedgepie_template',
      user_id: 'sxQK7Nf5z8UIGWMat',
    })

    toast(`Sent introductory Email to ${email} !!`)
    console.log('HIHI' + JSON.stringify(response))
  }

  return (
    <Box sx={{ background: 'url(/images/top-banner.svg)', width: '100%', height: '7em' }}>
      <Box
        sx={{
          display: 'flex',
          gap: ['0.25rem', '0.25rem', '3rem'],
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: ['column', 'column', 'row'],
          height: '100%',
        }}
      >
        <Text sx={{ color: '#fff', fontFamily: 'Noto Sans', fontSize: '36px', fontWeight: '700' }}>
          Get a slice of the DeFi Pie
        </Text>
        <Text
          sx={{
            color: '#fff',
            fontFamily: 'Noto Sans',
            fontSize: '18px',
            fontWeight: '500',
            width: '16rem',
            overflow: 'initial',
            display: ['none', 'none', 'block'],
          }}
        >
          We're not yet live, but be the first to know when we do!
        </Text>
        <Box
          sx={{
            flexDirection: 'row',
            gap: '10px',
            display: ['flex', 'flex', 'flex'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Input
            placeholder="Enter your best email here"
            sx={{
              textAlign: 'left',
              color: '#8988A5',
              background: '#fff',
              fontSize: '14px',
              width: '20rem',
              height: ['2.5rem', '2.5rem', '3rem'],
              marginLeft: '10px',
            }}
            onChange={onEmailChange}
          />
          <Button
            sx={{
              cursor: 'pointer',
              background: '#1799DE',
              borderRadius: 62,
              width: ['5rem', '5rem', '8rem'],
              height: ['2rem', '2rem', '3rem'],
            }}
            onClick={sendEmail}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default PRSection
