<template>
<!-- <el-scrollbar max-height="400px"> -->


    <el-table :data="listData.timesData" style="width:100%" stripe height="450px" >
      <!-- :header-cell-style="{'text-align':'center'}" :cell-style="{'text-align': 'center'}" -->

    <el-table-column label="到期时间" style="width:20%">
      <template #default="scope">

        <div v-if="scope.row.showBox" style="display: flex; align-items: center">
          <el-icon><timer /></el-icon>
          <span style="margin-left: 10px">{{ scope.row.targetFormatTime }}</span>
        </div>
        
        <el-time-picker
        v-if="!scope.row.showBox"
        :editable="false"
        value-format="x"
        v-model="tempTimeStamp"
        placeholder="Arbitrary time"
        />
      </template>

      
    </el-table-column>

    <el-table-column label="产品名称" style="width:20%">
      <template #default="scope">
        <el-tag>{{ scope.row.notes }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column label="剩余时间" style="width:20%">
      <template #default="scope">
        <el-col :span="8">
        <el-countdown  :value="scope.row.id" />
        </el-col>
      </template>
    </el-table-column>

    <el-table-column label="CHENGE" style="width:20%">
      <template #default="scope" #reference>


        <el-popconfirm v-if="scope.row.showBox" title="你确定要修改此条数据吗?" @confirm="tiemChangeInSure(scope.$index, scope.row)">
          <template #reference>
            <el-button type="warning" round>修改</el-button>
          </template>
        </el-popconfirm>

        <el-popconfirm v-if="!scope.row.showBox" title="你确定要保存修改后的数据吗?" @confirm="tiemChangeSaveInSure(scope.$index, scope.row)">
          <template #reference>
            <el-button type="primary" round>保存</el-button>
          </template>
        </el-popconfirm>


      </template>
    </el-table-column>

    <el-table-column label="DETELE" style="width:20%">
      <template #default="scope" #reference>
        <el-popconfirm title="你确定要删除此条数据吗?" @confirm="deteleInSure(scope.$index, scope.row)">
          <template #reference>
            <el-button type="danger" round>删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>


  </el-table>

  <!-- </el-scrollbar> -->
  
</template>

<script lang="ts" setup>
import { reactive,ref } from 'vue'
import alarmData from "@/stores/alarmData"
import { Timer } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const STORAGE_KEY = 'my_times_data'
let listData = alarmData()
//设置一个用于修改时间戳的变量
let tempTimeStamp = ref()


//点击删除按钮删除指定额数据
const deteleInSure = (ide,value)=>{
    listData.timesData.forEach((v,i)=>{
        if(v.ider === value.ider){
            listData.timesData.splice(i,1)
            localStorage.removeItem(STORAGE_KEY)
            localStorage.setItem(STORAGE_KEY,JSON.stringify(listData.timesData))
        }
    })
}

//点击修改按钮切换样式,并把这条数据的时间戳传到tempTiemStamp里
const tiemChangeInSure = (index,item) => {
  if(item.ider === listData.timesData[index].ider){
    //开始修改改变样式
    listData.timesData[index].showBox = false
    //重置其他按钮样式
    listData.timesData.forEach((value,i) => {
      if(i === index) return
      value.showBox = true
    })

    tempTimeStamp.value = item.id
  }else{
    //修改失败
  }
}

//点击保存按钮改变listData.timesData里指定的值并且切换样式
const tiemChangeSaveInSure = (index,item) => {
  if(item.ider === listData.timesData[index].ider){
    //把修改后的值赋给listData.timesData
    listData.timesData[index].id = tempTimeStamp.value 
    listData.timesData[index].targetFormatTime = dayjs(tempTimeStamp.value).format('HH:mm:ss')
    //改变样式
    listData.timesData.forEach((value,i) => value.showBox = true)
    //保存到本地
    localStorage.removeItem(STORAGE_KEY)
    localStorage.setItem(STORAGE_KEY,JSON.stringify(listData.timesData))
    //对数据排序
    listDataSort() 
    //修改成功提示
    ElMessage({
    message: `产品: ${item.notes} 修改成功`,
    type: 'success',
    plain: true,
  })
  }
}








//对listData数据进行排序
const listDataSort = () => {
  listData.timesData = [...listData.timesData].sort((a, b) => a.id - b.id);
}
</script>






































<style scoped>
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
</style>
