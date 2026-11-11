<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import { useToast } from '../components/useToast';

const router = useRouter();
const { toast } = useToast();
const { t } = useI18n({ useScope: 'local', messages: {
  en: {
    navTitle: 'Post a Single',
    shopTitle: 'Show off your winning product and inspire others to join!',
    titlePh: 'Add a title',
    contentPh: 'Share how you won and what you think...',
    tipsBefore: 'Add up to',
    tipsAfter: 'photos',
    addPhoto: 'Add photo',
    submit: 'Submit',
    promptShare: 'Write something to share',
    submitted: 'Submitted for review',
  },
  hi: {
    navTitle: 'एक पोस्ट करें',
    shopTitle: 'अपना जीता हुआ प्रोडक्ट दिखाएँ और दूसरों को शामिल होने के लिए प्रेरित करें!',
    titlePh: 'टाइटल जोड़ें',
    contentPh: 'बताएँ कि आपने कैसे जीता और आपकी क्या राय है...',
    tipsBefore: 'ज़्यादा से ज़्यादा',
    tipsAfter: 'फ़ोटो जोड़ें',
    addPhoto: 'फ़ोटो जोड़ें',
    submit: 'सबमिट करें',
    promptShare: 'शेयर करने के लिए कुछ लिखें',
    submitted: 'समीक्षा के लिए सबमिट किया गया',
  },
} });
const title = ref('');
const content = ref('');
const images = ref([]);
const busy = ref(false);

function pick(e) {
  const files = Array.from(e.target.files || []);
  for (const f of files) {
    if (images.value.length >= 6) break;
    images.value.push(URL.createObjectURL(f));
  }
  e.target.value = '';
}
function remove(i) { images.value.splice(i, 1); }

function submit() {
  if (!content.value.trim()) return toast(t('promptShare'));
  busy.value = true;
  toast(t('submitted'));
  setTimeout(() => { busy.value = false; router.back(); }, 700);
}
</script>

<!-- Faithful rebuild of the real pages/bask/index (.bask) "post a win" form + scoped CSS. -->
<template>
  <div class="bask">
    <NavBar :title="t('navTitle')" />

    <div class="content_middle">
      <div class="goods">
        <div class="shop_img"><img src="/static/image/goods/goods1.png" alt="" /></div>
        <div class="shop_title">{{ t('shopTitle') }}</div>
      </div>
    </div>

    <div class="content">
      <div class="content-title">
        <input v-model="title" :placeholder="t('titlePh')" style="flex:1;border:none;outline:none;background:transparent;font-size:14px;" />
      </div>
      <div class="content-main">
        <textarea v-model="content" :placeholder="t('contentPh')" style="flex:1;border:none;outline:none;background:transparent;font-size:14px;resize:none;height:100%;padding:12px 0;"></textarea>
      </div>

      <div class="tips">{{ t('tipsBefore') }}<span>6</span>{{ t('tipsAfter') }}</div>

      <div class="upload_file">
        <div v-for="(img, i) in images" :key="i" class="upload-item">
          <img :src="img" alt="" />
          <img class="del" src="/static/image/icon_Delete.png" alt="" @click="remove(i)" />
        </div>
        <label v-if="images.length < 6" class="btn">
          <span>+</span>
          <span>{{ t('addPhoto') }}</span>
          <input type="file" accept="image/*" multiple style="display:none" @change="pick" />
        </label>
      </div>
    </div>

    <button class="success_btn" :disabled="busy" @click="submit">{{ t('submit') }}</button>
  </div>
</template>

<style scoped>
.bask { position: relative; min-height: 100vh; background-color: #f9f9f9; padding-bottom: 100px; }
.content_middle { width: 100%; padding: 0 15px; padding-top: 20px; padding-bottom: 18px; background-color: #fff; }
.goods { display: flex; flex-direction: row; align-items: center; justify-content: center; }
.goods .shop_img { width: 90px; height: 90px; margin-right: 15px; background: #f5f5f5; border-radius: 4px; flex-shrink: 0; }
.goods .shop_img img { width: 100%; height: 100%; border-radius: 4px; object-fit: cover; }
.goods .shop_title { flex: 1; font-size: 14px; font-family: Roboto, Roboto-Medium; font-weight: 700; text-align: left; color: #17273a; }
.content { padding: 0 15px; }
.content .content-title { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 345px; height: 42px; padding: 0 23px; margin-top: 21px; border: 0.50px solid #b9b9b9; border-radius: 4.50px; }
.content .content-main { display: flex; flex-direction: row; align-items: flex-start; justify-content: center; width: 345px; height: 77px; padding: 0 23px; margin-top: 8px; border: 0.50px solid #b9b9b9; border-radius: 4.50px; }
.tips { margin-top: 13px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: left; color: #b9b9b9; }
.tips span { padding: 0 5px; color: #ff5c5c; }
.upload_file { display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; justify-content: flex-start; gap: 13px; margin-top: 18px; }
.upload_file .upload-item { position: relative; width: 96px; height: 96px; margin-bottom: 10px; opacity: 1; background: hsla(0, 0%, 76.9%, .15); border: 0.50px solid #b9b9b9; border-radius: 8.50px; }
.upload_file .upload-item img { width: 100%; height: 100%; border-radius: 8.50px; object-fit: cover; }
.upload_file .upload-item .del { position: absolute; right: -10px; top: -10px; z-index: 999; width: 26px; height: 26px; opacity: .8; }
.upload_file .btn { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; width: 96px; height: 96px; margin-bottom: 10px; background: hsla(0, 0%, 76.9%, .15); border: 0.50px dashed #b9b9b9; border-radius: 8.50px; font-size: 13px; font-family: PingFang SC, PingFang SC-Medium; font-weight: 700; color: #b9b9b9; }
.upload_file .btn span:first-child { font-size: 26px; line-height: 1; margin-bottom: 4px; }
.success_btn { position: fixed; left: 50%; transform: translateX(-50%); bottom: 23px; width: 300px; height: 45px; background: #ee5016; color: #fff; border-radius: 4px; font-size: 16px; font-weight: 700; }
.success_btn:disabled { opacity: 0.6; }
</style>
