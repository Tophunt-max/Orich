<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { api } from '../api/client';
import { useToast } from '../components/useToast';

const router = useRouter();
const { toast } = useToast();
const list = ref([]);

async function load() {
  try { list.value = (await api.addressList()).list || []; } catch (e) { toast(e.message); }
}
onMounted(load);

async function del(id) {
  try { await api.addressDel(id); toast('Removed'); load(); } catch (e) { toast(e.message); }
}

async function setDefault(a) {
  if (!a || a.isDefault) return;
  try { await api.addressSetDefault(a.id); toast('Default updated'); load(); } catch (e) { toast(e.message); }
}
</script>

<!-- Faithful rebuild of the real pages/address/address (.address) + scoped CSS. -->
<template>
  <div class="address">
    <NavBar title="Addresses" />

    <div v-if="!list.length" class="empty2">
      <img src="/static/image/nodata.png" alt="" />
      <div>No address yet</div>
    </div>

    <div v-for="a in list" :key="a.id" class="content">
      <div class="top">
        <span class="top_name">{{ a.name }}</span>
        <span class="top_number">{{ a.phone }}</span>
        <img src="/static/image/address/icon_Delete.png" alt="" @click="del(a.id)" />
      </div>
      <div class="middle">
        <div class="middle_content">{{ a.line }}</div>
      </div>
      <div class="bottom">
        <div class="bottom-radio" :class="{ 'bottom-select': a.isDefault }" @click="setDefault(a)">
          <div class="bottom-circle"></div>
          <span>Default address</span>
        </div>
        <span class="delete" @click="del(a.id)">Delete</span>
      </div>
    </div>

    <button class="addbtn" @click="router.push('/address/add')">+ Add new address</button>
  </div>
</template>

<style scoped>
.address { min-height: 100vh; padding-bottom: 75px; background-color: #f8f8f8; }
.address_title { margin-top: 56px; padding-left: 19px; background-color: #fff; }
.address_title .title-right { display: inline-block; margin-left: 113px; margin-bottom: 10px; vertical-align: middle; color: #000; font-family: Roboto, Roboto-Bold; font-weight: 700; font-size: 16px; line-height: 24px; }
.content { box-sizing: border-box; margin: 11px 14px 8px 15px; width: 345px; padding: 0 0 10px 0; background: #fff; border-radius: 8px; }
.top { position: relative; padding: 12px 15px 0 17px; }
.top .top_name { width: 45px; height: 24px; font-size: 16px; font-family: Roboto, Roboto-Medium; font-weight: 700; text-align: center; color: #17273a; line-height: 24px; }
.top .top_number { margin-left: 8px; margin-bottom: 3px; width: 95px; height: 24px; font-size: 14px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: center; color: #b9b9b9; line-height: 24px; }
.top img { position: absolute; right: 14.50px; width: 20px; }
.middle { margin: 3px 15px 0 17px; margin-bottom: 17px; }
.middle .middle_content { width: 305px; font-size: 12px; font-family: Roboto, Roboto-Regular; font-weight: 400; text-align: left; color: #b9b9b9; }
.bottom { display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 0 17px; padding-top: 10px; border-top: 0.50px solid #ececec; }
.bottom-radio { display: flex; flex-direction: row; align-items: center; justify-content: flex-start; font-size: 14px; font-family: Roboto, Roboto-Regular; color: #b9b9b9; }
.bottom-radio .bottom-circle { width: 17px; height: 17px; margin-right: 6px; border: 1px solid #b9b9b9; border-radius: 50%; }
.bottom-select { color: #ee5016; }
.bottom-select .bottom-circle { background: #ee5016; border: 1px solid #ee5016; border-radius: 50%; }
.delete { font-size: 14px; font-weight: 400; color: #17273a; }
.addbtn { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 300px; height: 45px; background: #ee5016; color: #fff; border-radius: 4px; font-size: 16px; font-weight: 700; }
</style>
