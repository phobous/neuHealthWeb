<template>
      <el-dialog
      title="设置护理级别"
      v-model="visible"
      width="800px"
      :align-center="true"
      :modal-append-to-body="false"
      @close="handleClose"
      destroy-on-close>

    
    <el-form :model="form" label-width="100px" class="mb-4">
      <el-form-item label="护理级别">
        <el-select v-model="form.careLevelId" placeholder="请选择护理级别" @change="handleCareLevelChange">
          <el-option
            v-for="level in careLevels"
            :key="level.id"
            :label="level.name"
            :value="level.id" />
        </el-select>
      </el-form-item>
    </el-form>
<div class="dialog-body">
    <el-table :data="levelItems" height="300px" v-loading="loading" style="flex: 1;">
    <el-table-column type="index" label="序号" width="60" />
    <el-table-column prop="code" label="编号" width="60" />
    <el-table-column prop="name" label="名称" width="80"/>
    <el-table-column prop="price" label="价格" width="60" />
    <el-table-column prop="cycle" label="执行周次" width="80" />
    <el-table-column prop="times" label="执行次数" width="100" />

    <el-table-column label="服务购买日期" width="140">
      <template #default="scope">
        <el-date-picker
          v-model="buyInfoMap[scope.row.id].buyDate"
          type="date"
          disabled
          size="small"
          style="width: 130px;" />
      </template>
    </el-table-column>

    <el-table-column label="购买数量" width="100">
      <template #default="scope">
        <el-input-number
          v-model="buyInfoMap[scope.row.id].count"
          :min="1"
          size="small"
          style="width: 80px;" />
      </template>
    </el-table-column>

    <el-table-column label="服务到期日期" width="150">
      <template #default="scope">
        <el-date-picker
          v-model="buyInfoMap[scope.row.id].endDate"
          type="date"
          size="small"
          style="width: 130px;" />
      </template>
    </el-table-column>

    <el-table-column label="操作" width="100">
      <template #default="scope">
        <el-button
          type="primary"
          size="small"
          @click="addToClient(scope.row)"
          :disabled="addedItemIds.includes(scope.row.id)">
          添加
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</div>


    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const visible = ref(false)
const clientId = ref(null)

const careLevels = ref([])
const levelItems = ref([])
const addedItemIds = ref([]) // 已添加项目 id 列表

const loading = ref(false)

const form = ref({
  careLevelId: null,
})
const buyInfoMap = ref({})


/** 打开弹窗 */
const open = async (client) => {
  visible.value = true
  clientId.value = client.clientId
  form.value.careLevelId = null
  levelItems.value = []
  addedItemIds.value = []

  // 加载启用的护理级别
  const res = await axios.get('http://localhost:8080/careLevel/list')
  if (res.data.isOk) {
    careLevels.value = res.data.data
  } else {
    ElMessage.error('加载护理级别失败')
  }
}

const handleCareLevelChange = async (levelId) => {
  loading.value = true
  levelItems.value = []
  buyInfoMap.value = {}

  try {
    const res = await axios.get('http://localhost:8080/careLevelItem/bound', {
      params: { levelId }
    })
    if (res.data.isOk) {
      levelItems.value = res.data.items || []
      const today = dayjs().format('YYYY-MM-DD')
      const threeMonths = dayjs().add(3, 'month').format('YYYY-MM-DD')

      for (const item of levelItems.value) {
        buyInfoMap.value[item.id] = {
          count: 1,
          buyDate: today,
          endDate: threeMonths
        }
      }
    } else {
      ElMessage.error('加载护理项目失败')
    }
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

/** 添加项目到当前客户配置 */
const addToClient = (item) => {
  if (!addedItemIds.value.includes(item.id)) {
    addedItemIds.value.push(item.id)
  }
}

/** 提交设置 */
const submit = async () => {
  if (!form.value.careLevelId) {
    ElMessage.warning('请选择护理级别')
    return
  }
  if (addedItemIds.value.length === 0) {
    ElMessage.warning('请至少添加一个项目')
    return
  }

  const res = await axios.post('http://localhost:8080/clientCare/assign', addedItemIds.value, {
    params: {
      clientId: clientId.value,
      careLevelId: form.value.careLevelId
    }
  })

  if (res.data.isOk) {
    ElMessage.success('护理级别设置成功')
    handleClose()
  } else {
    ElMessage.error(res.data.msg || '设置失败')
  }
}

/** 关闭弹窗 */
const handleClose = () => {
  visible.value = false
  form.value.careLevelId = null
  levelItems.value = []
  addedItemIds.value = []
}

defineExpose({ open })
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.dialog-body {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;
}

/* 表格右侧拓展，比如给右侧操作列或表格加些 padding */
.el-table {
  flex: 1;
}

</style>
