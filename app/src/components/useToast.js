import { ref } from 'vue';

const message = ref('');
let timer = null;

export function useToast() {
  function toast(msg, ms = 1800) {
    message.value = msg;
    clearTimeout(timer);
    timer = setTimeout(() => (message.value = ''), ms);
  }
  return { message, toast };
}
