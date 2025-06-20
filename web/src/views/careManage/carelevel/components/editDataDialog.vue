<template>
  <el-dialog
    :title="configData.title + configData.afterTitle"
    v-model="configData.open"
    width="500px"
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
        :inline="true"
        :rules="dataContainer.rules"
        label-width="100px"
      >
        <el-row :gutter="0">
          <el-col :span="24">
            <el-form-item label="级别名称" prop="name">
              <el-input
                v-model="dataContainer.form.name"
                placeholder="请输入"
                :disabled="true"          
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="dataContainer.form.status"
                :disabled="configData.isShow"  
                active-text="启用"
                inactive-text="停用"
                active-value="启用"
                inactive-value="停用"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="() => { dataContainer.closeType = 'cancel'; configData.open = false; }">
          取消
        </el-button>
        <el-button v-if="!configData.isShow" type="primary" @click="handleSubmit">
          提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, ref, reactive, nextTick } from 'vue';
import { initDataByConfig } from '@/common/otherTools';
import { verifiedData } from '@/common/verifiedTools';
import { messageError } from '@/action/messagePrompt.js';
import axios from 'axios';

const configMap = {
  open: { default: false },
  title: { default: '护理级别数据' },
  afterTitle: { default: '' },
  isShow: { default: false }, // 是否只是展示
};

export default defineComponent({
  name: 'EditDataDialog',
  setup() {
    const configData = reactive({});
    const FormElRef = ref(null);
    const dataContainer = reactive({
      loading: false,
      closeType: 'close',
      resolve: undefined,
      reject: undefined,
      form: {},
      rules: {
        name: [{ required: true, message: '请输入护理级别名称', trigger: 'blur' }],
      },
    });
    const otherDataContainer = { castParams: {} };

    initDataByConfig(configData, {}, configMap);

    function resetData() {
      dataContainer.form = {
        id: null,
        name: '',
        status: '',
      };
    }

    function handleClose() {
      if (dataContainer.closeType === 'confirm') {
        dataContainer.resolve(otherDataContainer.castParams);
      } else {
        dataContainer.reject(dataContainer.closeType, otherDataContainer.castParams);
      }
    }

    function initData(show = true, data = {}, option = {}) {
      initDataByConfig(configData, option, configMap);
      dataContainer.closeType = 'close';
      dataContainer.loading = false;
      dataContainer.form = {};
      otherDataContainer.castParams = {};
      configData.open = show;
      nextTick(() => {
        dataContainer.form = data;
      });
      return new Promise((r, j) => {
        dataContainer.resolve = r;
        dataContainer.reject = j;
      });
    }

    function handleSubmit() {
      if (!FormElRef.value) return;
      FormElRef.value.validate((valid, e) => {
        if (e) {
          const msg = e[Object.keys(e)[0]][0].message;
          messageError(msg);
        }
        if (!valid) return;

        axios.post('http://localhost:8080/careLevel/updateStatus', dataContainer.form)
          .then(res => {
            if (res.data.isOk) {
              otherDataContainer.castParams = { name: '修改成功' };
              dataContainer.closeType = 'confirm';
              configData.open = false;
            } else {
              messageError(res.data.msg || '修改失败');
            }
          })
          .catch(err => {
            console.error(err);
            messageError('请求失败');
          });
      });
    }

    function validData(data) {
      return verifiedData(data, {
        name: {
          msg: '名称 不能为空',
          validate(value) {
            return !!(value || value === 0);
          },
        },
      });
    }

    return {
      configData,
      initData,
      resetData,
      dataContainer,
      handleClose,
      handleSubmit,
      FormElRef,
      validData,
    };
  },
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
