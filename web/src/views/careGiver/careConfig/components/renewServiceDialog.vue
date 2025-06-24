<!-- src/components/RenewServiceDialog.vue -->
<template>
  <el-dialog
      :title="`服务续费 - ${form.serviceName}`"
      v-model="visible"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
      @close="onCancel"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="服务名称">
        <el-input v-model="form.serviceName" disabled />
      </el-form-item>

      <el-form-item label="新增数量" prop="addQuantity">
        <el-input-number v-model="form.addQuantity" :min="1" />
      </el-form-item>

      <el-form-item label="到期时间" prop="newEndDate">
        <el-date-picker
            v-model="form.newEndDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const visible = ref(false);
const formRef = ref();
const form = reactive({
  configId: null,
  serviceName: '',
  addQuantity: 1,
  newEndDate: '',
});

const rules = {
  addQuantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  newEndDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
};

const emit = defineEmits(['success']);

// 外部调用
function open(data) {
  form.configId = data.id;
  form.serviceName = data.itemName;
  form.addQuantity = 1;
  form.newEndDate = '';
  visible.value = true;
}

// 取消
function onCancel() {
  visible.value = false;
}

// 提交
async function onSubmit() {
  await formRef.value.validate();
  const res = await axios.put('http://localhost:8080/clientCareConfig/renew', null, {
    params: {
      configId: form.configId,
      addQuantity: form.addQuantity,
      newEndDate: form.newEndDate,
    },
  });
  if (res.data.isOk) {
    ElMessage.success('续费成功');
    visible.value = false;
    emit('success');
  } else {
    ElMessage.error(res.data.msg || '续费失败');
  }
}

defineExpose({ open });
</script>
