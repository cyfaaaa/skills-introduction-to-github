import { defineStore } from "pinia";
import { reactive } from "vue";

export default defineStore('alarmDemo',()=>{
    let timesData = reactive([])


    return {timesData}
})


