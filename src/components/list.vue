<template>
<el-scrollbar max-height="400px">
    <!-- <p  v-for="(item,i) in listData.timesData" :key="i" class="scrollbar-demo-item">
      {{ item.notes }}

        <span>{{ item.targetFormatTime }}</span>

        <el-col :span="8">
        <el-countdown  :value="item.id" />
        </el-col>

        <el-popconfirm title="你确定要删除此条数据吗?" @confirm="deteleInSure(item.id)">
            <template #reference>
              <el-button type="danger" plain>Delete</el-button>
            </template>
        </el-popconfirm>
    </p> -->



    <el-table :data="listData.timesData" style="width:100%" stripe>


    <el-table-column label="到期时间" style="width:25%">
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

    <el-table-column label="剩余时间" style="width:25%">
      <template #default="scope">
        <el-col :span="8">
        <el-countdown  :value="scope.row.id" />
        </el-col>
      </template>
    </el-table-column>

    <el-table-column label="DETELE" style="width:25%">
      <template #default="scope" #reference>
        <el-popconfirm title="你确定要删除此条数据吗?" @confirm="deteleInSure(scope.$index, scope.row)">
    <template #reference>
      <el-button type="danger" round>删除</el-button>
    </template>
  </el-popconfirm>
      </template>

      
    </el-table-column>


  </el-table>

  </el-scrollbar>
  
</template>

<script lang="ts" setup>
import { reactive,ref } from 'vue'
import alarmData from "@/stores/alarmData"
import { Timer } from '@element-plus/icons-vue'

const STORAGE_KEY = 'my_times_data'
let listData = alarmData()



//点击删除按钮删除指定额数据
const deteleInSure = (ide,value)=>{

  console.log(ide,value.ider);

    listData.timesData.forEach((v,i)=>{
        if(v.ider === value.ider){
            listData.timesData.splice(i,1)
            localStorage.removeItem(STORAGE_KEY)
            localStorage.setItem(STORAGE_KEY,JSON.stringify(listData.timesData))
        }
    })

    
    
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
