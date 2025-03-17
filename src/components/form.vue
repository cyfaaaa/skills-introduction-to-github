<template>
 <el-form :inline="true" :model="formDate" class="demo-form-inline">

    <el-form-item label="产品">
      <!-- 自动补全输入框 -->
      <el-autocomplete
        v-model="formDate.notes"
        :fetch-suggestions="querySearch"
        clearable
        class="inline-input w-50"
        placeholder="Please Input"
      />
    </el-form-item>

    <el-form-item label="设置到期时间">
    <!-- 时间选择器 -->
    <el-time-picker
    :editable="false"
    value-format="x"
    v-model="formDate.id"
    
    placeholder="Arbitrary time"
    />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submit">Query</el-button>
    </el-form-item>
    
    <!-- 音频上传及播放 -->
    <input type="file" ref="fileInput" accept="audio/*" @change="handleFileUpload" />
    <audio class="audioer" @ended="handlePlayEnd" ref="audioPlayer" :src="audioSrc" controls></audio>

    <el-button type="primary" @click="uploadButton">
      Upload<el-icon class="el-icon--right"><Upload /></el-icon>
    </el-button>
    <el-button text>{{ fileName }}</el-button>


    <!-- Dialog  -->
    <el-dialog @close="" v-model="dialogTableVisible" title="oi~ 小鬼! 有产品要到期咯." width="800">
      <el-table :data="filterExpiredData" style="width:100%" border>


      <el-table-column label="到期时间" style="width:25%" height="350px">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-icon><timer /></el-icon>
            <span style="margin-left: 10px">{{ scope.row.targetFormatTime }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="产品名称" style="width:25%">
        <template #default="scope">
          <el-tag>{{ scope.row.notes }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="剩余时间" style="width:44%">
        <template #default="scope">
          <el-col :span="8">
          <el-countdown :value="scope.row.id" />
          </el-col>
        </template>
      </el-table-column>


    </el-table>

    <el-button class="receiveButton" @click="receive" type="primary" plain>Yes,Sir!</el-button>

  </el-dialog>

  </el-form>
</template>






<script lang="ts" setup>
import { onBeforeUnmount,computed,onMounted,reactive,ref } from 'vue'
import alarmData from "@/stores/alarmData";
import { ElMessageBox,ElMessage, ListCache } from 'element-plus'
import dayjs from 'dayjs';
import { Timer,Upload } from '@element-plus/icons-vue'

const STORAGE_KEY = 'my_times_data'
const restaurants = ref([])
const teaName = ref('')
const formDate = reactive({
  id:null,                //target时间戳
  notes:teaName.value,    //产品名称
  targetFormatTime:'',    //targe格式化后的时间
  ider:null,              //id
  showBox:true,           //控制table里修改时间的样式
})
const listData = alarmData()
//音频相关数据
const audioSrc = ref(null);
const audioPlayer = ref()
const fileName = ref('');
const fileInput = ref(null)

//定时器相关数据
const playAlarm = ref()
const currentTime = ref(Date.now())

//alert提示框相关数据
const dialogTableVisible = ref(false)


//1.先从本地存储中拿数据,看看有没有
const loadFromlocalStorage = () => {
    try{
      const timesData = localStorage.getItem(STORAGE_KEY)
      if(timesData){
        listData.timesData = JSON.parse(timesData)
      }
    }catch{
      listData.timesData = []
    }
}

//2.提交一次就把数据更新一次,重新把数据存到本地
const saveTolocalStorage = () => {
    try{
        localStorage.setItem(STORAGE_KEY,JSON.stringify(listData.timesData))
    }catch{
      //保存失败
    }
}

//提交按钮将数据保存并且存到本地存储
function submit(){
  
    if(formDate.id && formDate.notes){
      if(formDate.id - new Date().getTime() > 0){
        if(audioSrc.value){
          formDate.targetFormatTime = dayjs(formDate.id).format('HH:mm:ss')
          formDate.ider = Date.now()
          //将数据推到Stores仓库listData.timesData里
          listData.timesData.push(JSON.parse(JSON.stringify(formDate)))
          //将listData.timesData里的数据存到本地
          saveTolocalStorage()
          //成功添加数据给个添加成功的提示
          ElMessage({
          showClose: true,
          message: 'OK, 你已成功添加一条数据!',
          type: 'success',
          })
        }else{
          ElMessage({
        showClose: true,
        message: '要上传音频文件哦~, 小子!',
        type: 'warning',
        })
        }
          
      }else{
        ElMessage({
        showClose: true,
        message: '你小子! 偷奸耍滑! 输入时间不能小于当前时间!',
        type: 'warning',
        })
      }
    }else{
      ElMessage({
        showClose: true,
        message: '你小子! 看看什么有什么数据没录!',
        type: 'warning',
      })
     
    }
    formDate.notes = ''
    listDataSort()
}

// 处理音频文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        if(base64 == 'string'){
          localStorage.setItem('audioFile',base64);
        } // 存储 Base64
        audioSrc.value = base64; // 更新 audioUrl
      };
      reader.readAsDataURL(file); // 将文件转换为 Base64
      fileName.value = file.name;
};

//把将要到期的数据提取出来
const filterExpiredData = computed(() => 
  listData.timesData.filter((item,i)=>{
    if(item.id - currentTime.value <= 600000){
      return item
    }
})
);

//删除过期数据并将新的数据存到本地
const filterDidDidData = () => {
  listData.timesData.forEach((item,i) => {
    if(item.id - Date.now() <= 0){
      listData.timesData.splice(i,1)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_KEY,JSON.stringify(listData.timesData))
    }
  })
}

//设置定时器,每隔一定时间执行一次代码
 playAlarm.value = setInterval(() => {
  console.log(currentTime.value);
  currentTime.value = Date.now()
  //先将快要到期的数据展示出来并且循环播放音频
  if(filterExpiredData.value.length != 0){
    //show expire data
    dialogTableVisible.value = true;
    //play audio
    audioPlayer.value.play();
  }
  //删除已经过期数据
  filterDidDidData()
},3000)

//阻止定时器重复调用play函数,等音频播放完后才重新调用
const handlePlayEnd = () => {
}

//Dialog内的收到按钮,点击后删除即将过期的数据,关闭音频播放
const receive = () => {
  ElMessageBox.confirm(
    '你确定把即将到期的产品清理并且报损了?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {  //这里是即将到期数据处理成功流程
      const idsToRemove = filterExpiredData.value.map((item => item.ider))
     
      for(let i = listData.timesData.length -1; i >= 0; i--){
        if(idsToRemove.includes(listData.timesData[i].ider)){
          listData.timesData.splice(i,1)
          localStorage.removeItem(STORAGE_KEY)
          localStorage.setItem(STORAGE_KEY,JSON.stringify(listData.timesData))
        }
      }

      // 处理成功后暂停音频播放
      audioPlayer.value.pause();
      
      ElMessage({
        type: 'success',
        message: '你是zhui棒的 ,你是zhui棒的!',
      })
      //关闭蒙层
      dialogTableVisible.value = false
    })
    .catch(() => {   //这里是即将到期数据处理失败流程
      console.log(222);
      ElMessage({
        type: 'warning',
        message: '哎呦~你干嘛,AAAAAAA!',
      })
    })
 
}


//对listData数据进行排序
const listDataSort = () => {
  listData.timesData = [...listData.timesData].sort((a, b) => a.id - b.id);
}

const querySearch = (queryString,cb) => {
  const results = queryString
    ? restaurants.value.filter(createFilter(queryString))
    : restaurants.value
  // call callback function to return suggestions
  cb(results)
}

const createFilter = (queryString) => {
  return (restaurant) => {
    return (
      restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

const loadAll = () => {
  return [
    { value: '青柑普洱'},
    { value: '玫瑰普洱'},
    { value: '锡兰红茶'},
    { value: '大红袍'},
    { value: '谷香黄茶'},
    { value: '栀香绿茶'},
    { value: '珑珠绿茶'},
    { value: '玫瑰水仙'},
    { value: '桂花乌龙'},
    { value: '蜜桃乌龙'},
    { value: '茉莉雪芽'},
    { value: '龙井'},
    
  ]
}

const uploadButton = () => {
  fileInput.value.click()
}


onMounted(() => {
  restaurants.value = loadAll()
  //数据初始化
  loadFromlocalStorage()
  //数据初始排序
  listDataSort()
  //删除已经过期的数据
  filterDidDidData()

  const storedAudio = localStorage.getItem('audioFile'); // 读取 Base64
      if (storedAudio) {
        audioSrc.value = storedAudio; // 设置 audioUrl
      }

})

onBeforeUnmount(() => {
  //清理定时器
  clearInterval(playAlarm.value)
  //删除已经过期的数据
  filterDidDidData()
})











interface RestaurantItem {
  value: string
  link: string
}

</script>


<style>
.example-basic .el-date-editor {
  margin: 8px;
}
/* 
.audioer{
  display: none;
} */

</style>


















<style>
.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

.receiveButton{
  margin-top: 20px;
  margin-left: 85%;
}

.audioer{
  display: none;
}
.el-statistic__number,.el-statistic__content,.el-statistic,.el-col{
  width: 200px;
  font-size: 16px;
  color: #F56C6C;
  display: block;
}
.demo-form-inline{
  display: flex;
  justify-content: center;
}

/* 基础样式重置 */
input[type="file"] {
  opacity: 0;
  position: absolute;
  z-index: -1;
}

.clearExpierButton{
  margin-top: 20px;
}

</style>