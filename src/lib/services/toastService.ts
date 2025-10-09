import { toast } from 'react-hot-toast';

const toastService = {
  success(message: string) {
    toast.success(message, {
      icon: '✅',
      style: {
        background: '#d4edda',
        color: '#155724',
      },
    });
  },
  error(message: string) {
    toast.error(message, {
      icon: '❌',
      style: {
        background: '#f8d7da',
        color: '#721c24',
      },
    });
  },
  warning(message: string) {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#fff3cd',
        color: '#856404',
      },
    });
  },
  info(message: string) {
    toast(message, {
      icon: 'ℹ️',
    });
  },
};

export default toastService;
