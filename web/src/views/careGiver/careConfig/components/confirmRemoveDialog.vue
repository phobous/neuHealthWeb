<template>
  <el-dialog
      title="提示"
      v-model="visible"
      width="480px"
      :close-on-click-modal="false"
      append-to-body
      @close="onCancel"
      class="custom-dialog"
  >
    <div class="dialog-content">
      确认移除该护理服务项目？
    </div>

    <template #footer>
      <el-button @click="onCancel" class="cancel-btn">取消</el-button>
      <el-button type="danger" @click="onConfirm" class="confirm-btn">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const visible = ref(false);
let configId = null;

const emit = defineEmits(['success']);

// 打开弹窗
function open(id) {
  configId = id;
  visible.value = true;
}

// 取消
function onCancel() {
  visible.value = false;
}

// 确认移除
async function onConfirm() {
  const res = await axios.delete(`http://localhost:8080/clientCareConfig/${configId}`);
  if (res.data.isOk) {
    ElMessage.success('项目移除成功');
    visible.value = false;
    emit('success');  // 发射成功事件，父组件中刷新列表
  } else {
    ElMessage.error(res.data.msg || '移除失败');
  }
}

defineExpose({ open });
</script>

<style scoped>
.custom-dialog {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  font-family: 'Arial', sans-serif;
}

.dialog-content {
  font-size: 16px;
  color: #333;
  text-align: center; /* 水平居中 */
  display: flex;
  justify-content: center; /* 使内容居中对齐 */
  align-items: center; /* 垂直居中对齐 */
  height: 80px; /* 设置一个固定高度来确保居中效果 */
}

.cancel-btn, .confirm-btn {
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
  border-color: #ccc;
}

.confirm-btn {
  background-color: #f56c6c;
  color: #fff;
  border: 1px solid #f56c6c;
}

.confirm-btn:hover {
  background-color: #e04a4a;
  border-color: #e04a4a;
}

.el-dialog__header {
  background-color: #f6f6f6;
  color: #333;
  font-size: 18px;
  padding: 16px;
  font-weight: 600;
  border-radius: 12px 12px 0 0;
}

.el-dialog__body {
  padding: 24px;
}
</style>
