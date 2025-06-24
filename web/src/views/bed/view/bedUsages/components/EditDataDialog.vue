<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="550px"
    @close="handleClose"
    class="custom-edit-dialog"
    :close-on-click-modal="false"
  >
    <el-form
      ref="editForm"
      :model="formData"
      label-width="120px"
      size="default"
      class="custom-edit-form"
    >
      <el-form-item label="客户姓名" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入客户姓名"
          clearable
          disabled
          class="custom-input"
        />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-input
          v-model="formData.gender"
          placeholder="请输入性别"
          clearable
          disabled
          class="custom-input"
        />
      </el-form-item>
      <el-form-item label="起始日期" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="date"
          placeholder="请选择日期"
          clearable
          disabled
          class="custom-input"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          type="date"
          placeholder="请选择日期"
          clearable
          class="custom-input"
        />
      </el-form-item>
      <!-- <el-form-item label="床位详情" prop="bedDetail">
        <el-input
          @model="formatBedDetail(formData.bedDetail)" 
          placeholder="请输入床位详情（如 606#1001-1）"
          clearable
          disabled
          class="custom-input"
        />
      </el-form-item> -->
    <el-form-item label="床位详情" prop="bedDetail">
        <el-input
          :model-value="formatBedDetail(formData.bedDetail)" 
          placeholder="请输入床位详情（如 606#1001-1）"
          clearable
          disabled
          class="custom-input"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="custom-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineEmits, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios'; 

const emit = defineEmits(['confirm', 'close']);

const dialogVisible = ref(false);
const dialogTitle = ref('修改信息');
const formData = reactive({
  id: '',
  name: '',
  gender: '',
  startTime: null,
  endTime: null,
  bedDetail: '',
});

const initData = (row) => {
  return new Promise((resolve, reject) => {
    formData.id = row.id;
    formData.name = row.clientName || ''; 
    formData.gender = row.clientGender || '';
    formData.startTime = row.checkInDate ? new Date(row.checkInDate) : null;
    formData.endTime = row.checkOutDate ? new Date(row.checkOutDate) : null;
    formData.bedDetail = row.bedNumber || ''; 

    dialogVisible.value = true;
    nextTick(resolve);
  });
};

const handleConfirm = async () => {
  if (!formData.endTime) {
    ElMessage.warning('请选择结束日期');
    return;
  }
  if (formData.startTime && formData.endTime < formData.startTime) {
    ElMessage.warning('结束日期不能早于开始日期');
    return;
  }
  try {

    console.log('提交的数据:', {
          recordId: formData.id,
          checkOutDate: formData.endTime.getTime(),
          checktime:formData.endTime,
        });
    const response = await axios.post('http://localhost:8080/bedUsageRecord/updateCheckOutDate', {
                        recordId: formData.id,
                        checkOutDate: formData.endTime.getTime()
                });
    if (response.data.if) {
      ElMessage.success('修改成功！');
      dialogVisible.value = false;
      emit('confirm'); 
    } else {
      ElMessage.error(response.data.msg || '修改失败，请重试');
    }
  } catch (error) {
    ElMessage.error('网络异常或服务器错误');
  }
};
const formatBedDetail = (bedDetail) => {
  return bedDetail ? `606#${bedDetail}` : '';
};
const handleClose = () => {
  dialogVisible.value = false;
  emit('close');
};

defineExpose({
  initData
});
</script>

<style scoped>
/* 弹窗整体样式 */
.custom-edit-dialog {
  --el-dialog-background-color: #fff;
  --el-dialog-border-radius: 12px;
  --el-dialog-title-font-size: 18px;
  --el-dialog-title-font-weight: 600;
  
  /* 增加弹窗高度和内边距 */
  min-height: 420px; /* 增加最小高度 */
  padding: 24px 20px; /* 增加上下内边距 */
}

/* 标题样式 */
.custom-edit-dialog .el-dialog__header {
  padding-bottom: 16px; /* 增加标题与内容区间距 */
}

/* 表单容器 */
.custom-edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0; /* 增加表单上下间距 */
}

/* 统一控制输入框/日期选择器宽度 */
.custom-input {
  width: 240px;
}
.custom-input .el-input__inner,
.custom-input .el-date-editor .el-input__inner {
  width: 100%;
  border-radius: 6px;
}

/* 禁用状态输入框样式 */
.custom-input.is-disabled .el-input__inner {
  background-color: #f8f9fa;
  color: #6c757d;
  border-color: #e9ecef;
  cursor: not-allowed;
}

/* 表单项间距统一 */
.el-form-item {
  margin-bottom: 0; 
  display: flex;
  align-items: center;
}

/* 底部按钮区 */
.custom-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px; /* 增加按钮区与表单间距 */
}

/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 20px;
}
.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}
.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
</style>