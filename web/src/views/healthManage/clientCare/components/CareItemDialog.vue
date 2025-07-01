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
        label-width="120px"
      >
        <el-row :gutter="10">
          <!-- 显示客户姓名（只读） -->
          <el-col :span="24">
            <el-form-item label="客户姓名">
              <el-input v-model="dataContainer.form.clientName" disabled />
            </el-form-item>
          </el-col>

          <!-- 显示护理项目编号（只读） -->
          <el-col :span="12">
            <el-form-item label="护理项目编号">
              <el-input v-model="dataContainer.form.itemCode" disabled />
            </el-form-item>
          </el-col>

          <!-- 显示护理项目名称（只读） -->
          <el-col :span="12">
            <el-form-item label="护理项目名称">
              <el-input v-model="dataContainer.form.itemName" disabled />
            </el-form-item>
          </el-col>

          <!-- 护理时间（用户输入） -->
          <el-col :span="24">
            <el-form-item label="护理时间" prop="careTime">
              <el-date-picker
                v-model="dataContainer.form.careTime"
                type="datetime"
                placeholder="请选择护理时间"
                style="width: 100%;"
                :disabled="configData.isShow"
              />
            </el-form-item>
          </el-col>

          <!-- 护理数量（用户输入） -->
          <el-col :span="12">
            <el-form-item label="护理数量" prop="careQuantity">
              <el-input-number
                v-model="dataContainer.form.careQuantity"
                :min="1"
                style="width: 100%;"
                :disabled="configData.isShow"
              />
            </el-form-item>
          </el-col>

          <!-- 护理内容（用户输入） -->
          <el-col :span="24">
            <el-form-item label="护理内容" prop="careContent">
              <el-input
                type="textarea"
                v-model="dataContainer.form.careContent"
                placeholder="请输入护理内容"
                :rows="3"
                :disabled="configData.isShow"
              />
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
  title: '护理记录',
  afterTitle: '',
  isShow: false,
});

const FormElRef = ref();

const dataContainer = reactive({
  closeType: 'close',
  resolve: null,
  reject: null,
  form: {
     clientId: null,         // 后端需要
      itemId: null,           // 后端需要
      caregiverId: null,      // 可选，登录用户ID或护士ID
      careTime: '',
      careQuantity: 1,
      careContent: '',
      clientName: '',         // 仅用于显示
      itemCode: '',           // 仅用于显示
      itemName: '',           // 仅用于显示
  },
  rules: {
    careTime: [{ required: true, message: '请选择护理时间', trigger: 'change' }],
    careQuantity: [{ required: true, message: '请输入护理数量', trigger: 'blur' }],
    careContent: [{ required: true, message: '请输入护理内容', trigger: 'blur' }],
  },
});

function resetData() {
  dataContainer.form = {
    clientId: null,         // 必填
    itemId: null,           // 必填
    caregiverId: null,      // 可选
    clientName: '',         // 仅展示
    itemCode: '',           // 仅展示
    itemName: '',           // 仅展示
    careTime: '',
    careQuantity: 1,
    careContent: '',
  };
}


function handleClose() {
  if (dataContainer.closeType === 'confirm') {
    dataContainer.resolve();
  } else {
    dataContainer.reject(dataContainer.closeType);
  }
}

/**
 * 打开弹窗并初始化数据
 * @param {Boolean} show 是否显示弹窗
 * @param {Object} data 传入初始化数据，至少包含客户姓名、项目编号、项目名称
 */
function initData(show = true, data = {}) {
  configData.open = show;
  configData.afterTitle = ' - 新增护理记录';
  configData.isShow = false;
  resetData();
  nextTick(() => {
    Object.assign(dataContainer.form, {
      clientId: data.clientId || null,
      itemId: data.itemId || null,
      caregiverId: data.caregiverId || null,
      clientName: data.clientName || '',
      itemCode: data.itemCode || '',
      itemName: data.itemName || '',
    });
  });
  return new Promise((resolve, reject) => {
    dataContainer.resolve = resolve;
    dataContainer.reject = reject;
  });
}

  async function handleSubmit() {
    console.log('准备提交护理记录：', dataContainer.form);

    if (!FormElRef.value) return;
    FormElRef.value.validate(async (valid) => {
      if (!valid) return;

      try {
        // 构建要提交的 CareRecord 对象
        const record = {
          clientId: dataContainer.form.clientId,
          itemId: dataContainer.form.itemId,
          caregiverId: dataContainer.form.caregiverId,  // 如果需要
          careTime: dataContainer.form.careTime,
          careQuantity: dataContainer.form.careQuantity,
          deleted: false,
          careContent: dataContainer.form.careContent,
        };

        const res = await axios.post('http://localhost:8080/helpGiver/addRecord', record);

        if (res.data.success) {
          messageSuccess('护理记录添加成功');
          dataContainer.closeType = 'confirm';
          configData.open = false;
        } else {
          messageError(res.data.message || '添加失败');
        }
      } catch (err) {
        console.error(err);
        messageError('请求失败');
      }
    });
  }

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
