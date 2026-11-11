<script setup>
import { useToast } from './useToast';

const props = defineProps({
  visible: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'select']);
const { toast } = useToast();

const options = [
  { key: 'app', label: 'WhatsApp', icon: '/static/image/share/icon_app.png' },
  { key: 'copy', label: 'Copy link', icon: '/static/image/share/icon_Copylink.png' },
  { key: 'save', label: 'Save', icon: '/static/image/share/icon_Save.png' },
  { key: 'poster', label: 'Poster', icon: '/static/image/share/icon_Shareposter.png' },
];

function pick(opt) {
  emit('select', opt.key);
  toast(opt.label + ' selected');
  emit('close');
}
function close() {
  emit('close');
}
</script>

<template>
  <transition name="sheet">
    <div v-if="visible" class="share_mask" @click.self="close">
      <div class="share_sheet">
        <div class="share_title">Share with friends</div>
        <div class="share_grid">
          <div v-for="opt in options" :key="opt.key" class="share_item" @click="pick(opt)">
            <div class="share_icon"><img :src="opt.icon" :alt="opt.label" /></div>
            <div class="share_label">{{ opt.label }}</div>
          </div>
        </div>
        <div class="share_cancel" @click="close">Cancel</div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.share_mask { position: fixed; left: 0; top: 0; z-index: 99999; width: 100vw; height: 100vh; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; justify-content: center; }
.share_sheet { width: 100%; max-width: var(--maxw); background: #fff; border-radius: 16px 16px 0 0; padding: 18px 0 0; }
.share_title { text-align: center; font-size: 15px; font-weight: 700; color: #17273a; margin-bottom: 16px; }
.share_grid { display: flex; align-items: flex-start; justify-content: space-around; padding: 0 12px 18px; }
.share_item { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 72px; }
.share_icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
.share_icon img { width: 48px; height: 48px; object-fit: contain; }
.share_label { margin-top: 8px; font-size: 12px; color: #686868; text-align: center; }
.share_cancel { height: 50px; line-height: 50px; text-align: center; font-size: 15px; color: #b9b9b9; border-top: 1px solid #f0f0f0; }

.sheet-enter-active, .sheet-leave-active { transition: opacity 0.25s ease; }
.sheet-enter-active .share_sheet, .sheet-leave-active .share_sheet { transition: transform 0.28s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .share_sheet, .sheet-leave-to .share_sheet { transform: translateY(100%); }
</style>
