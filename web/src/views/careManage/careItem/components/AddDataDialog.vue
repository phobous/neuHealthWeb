<template>
  <el-dialog
    :title="configData.title + configData.afterTitle"
    v-model="configData.open"
    width="600px"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @close="handleClose"
    class="edit-data-dialog"
  >
    <div class="dialog-container">
      <el-form
        :model="dataContainer.form"
        ref="FormElRef"
        :rules="dataContainer.rules"
        label-width="100px"
      >
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="编号" prop="code">
              <el-input v-model="dataContainer.form.code" placeholder="请输入编号" clearable :disabled="configData.isShow" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="dataContainer.form.name" placeholder="请输入名称" clearable :disabled="configData.isShow"/>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input v-model="dataContainer.form.price" placeholder="请输入价格" type="number" clearable :disabled="configData.isShow"/>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="执行周期" prop="cycle">
              <el-input v-model="dataContainer.form.cycle" placeholder="例如：每天、每周" clearable :disabled="configData.isShow"/>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="执行次数" prop="times">
              <el-input v-model="dataContainer.form.times" placeholder="请输入执行次数" type="number" clearable :disabled="configData.isShow"/>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="dataContainer.form.status" placeholder="请选择状态" clearable :disabled="configData.isShow">
                <el-option label="启用" value="启用" />
                <el-option label="停用" value="停用" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="dataContainer.form.description" type="textarea" :rows="3" placeholder="请输入描述" clearable :disabled="configData.isShow"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="() => { dataContainer.closeType = 'cancel'; configData.open = false; }">取消</el-button>
        <el-button type="primary" @click="handleSubmit" v-if="!configData.isShow">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>


<script setup>
import { ref, reactive, nextTick } from 'vue';
import axios from 'axios';
import { messageError, messageSuccess } from '@/action/messagePrompt.js';

const configData = reactive({
  open: false,
  title: '护理项目',
  afterTitle: '',
  isShow: false, // ✅ 新增：是否为只读查看模式
});

const FormElRef = ref();

const dataContainer = reactive({
  closeType: 'close',
  resolve: null,
  reject: null,
  form: {
    id: null, // ➕ 增加此项用于判断是否是修改
    code: '',
    name: '',
    price: 0,
    cycle: '',
    times: 0,
    description: '',
    status: '启用'
  },
  rules: {
    rules: {
      code: [{ required: true, message: '请输入编号', trigger: 'blur' }],
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
      cycle: [{ required: true, message: '请输入执行周期', trigger: 'blur' }],
      times: [{ required: true, message: '请输入执行次数', trigger: 'blur' }],
      status: [{ required: true, message: '请选择状态', trigger: 'change' }],
},

  },
});

function resetData() {
  dataContainer.form = {
    code: '',
    name: '',
    price: 0,
    cycle: '',
    times: 0,
    description: '',
    status: '启用',
  };
}

function handleClose() {
  if (dataContainer.closeType === 'confirm') {
    dataContainer.resolve();
  } else {
    dataContainer.reject(dataContainer.closeType);
  }
}

function initData(show = true, data = {}, option = {}) {
  configData.open = show;
  configData.afterTitle = option.afterTitle || (data?.id ? ' - 修改' : ' - 新增');
  configData.isShow = option.isShow || false;
  resetData();
  nextTick(() => {
    Object.assign(dataContainer.form, data);
  });
  return new Promise((resolve, reject) => {
    dataContainer.resolve = resolve;
    dataContainer.reject = reject;
  });
}


async function handleSubmit() {
  if (!FormElRef.value) return;
  FormElRef.value.validate(async (valid) => {
    if (!valid) return;

    const isEdit = !!dataContainer.form.id;
    const url = isEdit ? 'http://localhost:8080/careItem/update' : 'http://localhost:8080/careItem/add';

    try {
      const res = await axios.post(url, dataContainer.form);
      if (res.data.isOk) {
        messageSuccess(isEdit ? '修改成功' : '添加成功');
        dataContainer.closeType = 'confirm';
        configData.open = false;
      } else {
        messageError(res.data.msg || (isEdit ? '修改失败' : '添加失败'));
      }
    } catch (err) {
      console.error(err);
      messageError('请求失败');
    }
  });
}

// 暴露方法
defineExpose({
  resetData,
  initData,
});
</script>


<style scoped lang="scss">
.edit-data-dialog {
  .dialog-container {
    padding: 15px 15px 0 15px;
    box-sizing: border-box;
  }
}
</style>
