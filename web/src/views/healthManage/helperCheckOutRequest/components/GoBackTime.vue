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
            <!-- 预计回院时间（用户输入） -->
          <el-col :span="24">
            <el-form-item label="预计回院时间" prop="outTime">
              <el-date-picker
                v-model="dataContainer.form.careTime"
                type="datetime"
                placeholder="请选择预计回院时间"
                style="width: 100%;"
                :disabled="configData.isShow"
                :disabled-date="disabledReturnDate"  
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
    id: null,
    outTime: null,  // ⬅ 新增字段：外出时间
  },
  rules: {
    outTime: [{ required: true, message: '请选择预计回院时间', trigger: 'change' }],
  },
});

function resetData() {
  dataContainer.form = {
    id: null,         // 必填
    outTime: null,
  };
}

function disabledReturnDate(time) {
  if (!dataContainer.form.outTime) return false;
  return time.getTime() <= new Date(dataContainer.form.outTime).setHours(23, 59, 59, 999);
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
      id: data.id || null,
      outTime: data.outTime || null, // ⬅ 添加这一行
    });
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

          try {
            // POST 请求体为空，参数放 params
            const res = await axios.post(
              'http://localhost:8080/helpGiver/registerReturnTime',
              null, // 请求体为空
              {
                params: {
                  id: dataContainer.form.id,
                  actualReturnTime: new Date(dataContainer.form.careTime).getTime(),
                },
              }
            );

            if (res.data.isOk) {
              messageSuccess('回院时间登记成功');
              dataContainer.closeType = 'confirm';
              configData.open = false;
            } else {
              messageError(res.data.msg || '登记失败');
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
