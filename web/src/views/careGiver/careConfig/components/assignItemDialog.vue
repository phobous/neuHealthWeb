<template>
  <el-dialog
      :title="`配置护理项目 - ${form.itemName}`"
      v-model="visible"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
      @close="onCancel"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="项目名称">
        <el-input v-model="form.itemName" disabled />
      </el-form-item>

      <el-form-item label="数量" prop="quantity">
        <el-input-number v-model="form.quantity" :min="1" />
      </el-form-item>

      <el-form-item label="到期日期" prop="endDate">
        <el-date-picker
            v-model="form.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onSubmit">确定</el-button>
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
  clientId: null,
  itemId: null,
  itemName: '',  // 直接传递名称
  quantity: 1,
  endDate: '',
});

const rules = {
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  endDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }],
};

const emit = defineEmits(['success']);

// 外部调用
function open(clientId, itemId, itemName) {
  form.clientId = clientId;
  form.itemId = itemId;
  form.itemName = itemName;  // 直接使用传入的名称
  form.quantity = 1;
  form.endDate = '';
  visible.value = true;
}

// 取消
function onCancel() {
  visible.value = false;
}

// 提交
async function onSubmit() {
  await formRef.value.validate();
  const res = await axios.post('http://localhost:8080/clientCareConfig/save', null, {
    params: {
      clientId: form.clientId,
      itemId: form.itemId,
      quantity: form.quantity,
      endDate: form.endDate,
    },
  });
  if (res.data.isOk) {
    ElMessage.success('项目配置成功');
    visible.value = false;
    emit('success');  // 发射成功事件，父组件中刷新列表
  } else {
    ElMessage.error(res.data.msg || '配置失败');
  }
}

defineExpose({ open });
</script>

<style scoped>
</style>
