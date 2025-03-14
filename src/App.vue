

<template class="bg">
  <h1>欢迎使用效期管理系统2.0</h1>
  <Forms />
  <el-divider />
  <List />
</template>


<script setup>
import {onMounted} from 'vue'
import Forms from "./components/form.vue"
import List from "./components/list.vue"

function handleBeforeUnload(event) {
// 阻止默认行为并弹出确认对话框
event.preventDefault();
event.returnValue = '';
}


function beforeDestroy(){
window.removeEventListener('beforeunload',handleBeforeUnload)
}

onMounted(()=>{
  window.addEventListener('beforeunload',handleBeforeUnload);
})
</script>


<style>
h1{
  color:#303133;
  text-align:start;
  margin-bottom: 50px;
  margin-left: 40px;
}
</style>
