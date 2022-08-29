import { toast as Toastify } from 'react-toastify'

const toast = (message: string, type?: string) => {
  Toastify(message, {
    position: Toastify.POSITION.BOTTOM_RIGHT,
    style: {
      backgroundColor: type == 'success' ? '#1799DE' : type === 'warning' ? '#de588e' : '#1799DE',
      borderRadius: '10px',
      padding: '10px',
      fontFamily: 'Noto Sans',
      color: '#FFF',
      fontSize: '16px',
      width: 'fit-content',
    },
  })
}

export default toast
