<template>
  <el-dialog
    title="护理记录"
    v-model="visible"
    width="900px"
    :align-center="true"
    :modal-append-to-body="false"
    @close="handleClose"
    destroy-on-close>

   <el-table :data="recordList" height="400px" v-loading="loading" border style="flex: 1;">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="itemCode" label="护理项目编号" width="100" />
      <el-table-column prop="itemName" label="护理项目名称" width="120" />
      <el-table-column prop="careQuantity" label="护理数量" width="60" />
      <el-table-column prop="careDescription" label="护理内容" width="150" />
      <el-table-column prop="caregiverName" label="护理人员" width="90" />
      <el-table-column prop="caregiverPhone" label="护理人员手机" width="120" />
      <el-table-column prop="careTime" label="护理时间" width="180">
        <template #default="scope">
          <span>{{ formatDate(scope.row.careTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button
            type="danger"
            size="small"
            @click="removeRecord(scope.row.id)">
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';

const visible = ref(false);
const clientId = ref(null);
const recordList = ref([]);
const loading = ref(false);

// 打开弹窗并加载护理记录
const open = async (client) => {
  visible.value = true;
  clientId.value = client.clientId;
  fetchRecords(clientId.value);
};

// 查询护理记录
const fetchRecords = async (clientId) => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:8080/careRecord/listByClient', {
      params: { clientId }
    });
    if (res.data.isOk) {
      recordList.value = res.data.data || [];
    } else {
      ElMessage.error(res.data.msg || '获取护理记录失败');
    }
  } catch (e) {
    ElMessage.error('请求出错');
  } finally {
    loading.value = false;
  }
};

// 移除护理记录（逻辑删除）
const removeRecord = (recordId) => {
  ElMessageBox.confirm('确定要移除该护理记录吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res = await axios.post('http://localhost:8080/careRecord/delete', null, {
        params: { recordId }
      });
      if (res.data.isOk) {
        ElMessage.success('移除成功');
        fetchRecords(clientId.value); // 重新加载
      } else {
        ElMessage.error(res.data.msg || '删除失败');
      }
    } catch (e) {
      ElMessage.error('删除请求出错');
    }
  }).catch(() => {});
};

const handleClose = () => {
  visible.value = false;
  recordList.value = [];
  clientId.value = null;
};

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

defineExpose({ open });
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
