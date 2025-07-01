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
          <!-- 客户姓名（只读） -->
          <el-col :span="24">
            <el-form-item label="客户姓名" prop="clientName">
              <el-input v-model="dataContainer.form.clientName" disabled />
            </el-form-item>
          </el-col>

          <!-- 退住类型（必填） -->
          <el-col :span="24">
            <el-form-item label="退住类型" prop="type">
              <el-select
                v-model="dataContainer.form.type"
                placeholder="请选择退住类型"
                :disabled="configData.isShow"
              >
                <el-option label="正常退住" value="正常退住" />
                <el-option label="死亡退住" value="死亡退住" />
                <el-option label="保留床位" value="保留床位" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 退住原因（必填） -->
          <el-col :span="24">
            <el-form-item label="退住原因" prop="reason">
              <el-input
                v-model="dataContainer.form.reason"
                placeholder="请输入退住原因"
                :disabled="configData.isShow"
              />
            </el-form-item>
          </el-col>

          <!-- 退住时间（必填） -->
          <el-col :span="24">
            <el-form-item label="退住时间" prop="checkOutDate">
              <el-date-picker
                v-model="dataContainer.form.checkOutDate"
                type="datetime"
                placeholder="请选择退住时间"
                style="width: 100%"
                :disabled="configData.isShow"
                :picker-options="checkOutTimePickerOptions"
              />
            </el-form-item>
          </el-col>

          <!-- 细节（选填） -->
          <el-col :span="24">
            <el-form-item label="细节" prop="detail">
              <el-input
                v-model="dataContainer.form.detail"
                placeholder="请输入退住细节"
                :disabled="configData.isShow"
              />
            </el-form-item>
          </el-col>

          <!-- 入住时间（只读） -->
          <el-col :span="24">
            <el-form-item label="入住时间" prop="checkInDate">
              <el-input v-model="dataContainer.form.checkInDate" disabled />
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
        <el-button
          type="primary"
          @click="handleSubmit"
          v-if="!configData.isShow"
        >
          提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick, computed } from "vue";
import axios from "axios";
import { messageError, messageSuccess } from "@/action/messagePrompt.js";

const configData = reactive({
  open: false,
  title: "退住申请",
  afterTitle: "",
  isShow: false,
});

const FormElRef = ref();

const dataContainer = reactive({
  closeType: "close",
  resolve: null,
  reject: null,
  form: {
    clientId: null, // 必填，后台需要
    clientName: "", // 只读显示
    reason: "", // 必填
    checkOutDate: "", // 退住时间（必填）
    type: "", // 退住类型（必填）
    detail: "", // 细节（选填）
    checkInDate: "", // 入住时间（只读）
    status: "已提交", // 默认已提交，提交时传给后台
  },
  rules: {
    clientName: [{ required: true, message: "客户姓名不能为空", trigger: "blur" }],
    reason: [{ required: true, message: "退住原因不能为空", trigger: "blur" }],
    checkOutDate: [{ required: true, message: "请选择退住时间", trigger: "change" }],
    type: [{ required: true, message: "请选择退住类型", trigger: "change" }],
  },
});

// 限制退住时间的选择
const checkOutTimePickerOptions = {};

function resetData() {
  dataContainer.form = {
    clientId: null,
    clientName: "",
    reason: "",
    checkOutDate: "",
    type: "",
    detail: "",
    checkInDate: "",
    status: "已提交",
  };
}

function handleClose() {
  if (dataContainer.closeType === "confirm") {
    dataContainer.resolve();
  } else {
    dataContainer.reject(dataContainer.closeType);
  }
}

/**
 * 初始化弹窗数据
 * @param {Boolean} show 是否显示弹窗
 * @param {Object} data 初始化数据，至少包括 clientId, clientName, checkInDate
 */
function initData(show = true, data = {}) {
  configData.open = show;
  configData.afterTitle = " - 新增退住申请";
  configData.isShow = false;
  resetData();
  nextTick(() => {
    Object.assign(dataContainer.form, {
      clientId: data.clientId || null,
      clientName: data.clientName || "",
      checkInDate: data.checkInDate || "", // 自动填充入住时间
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
      const payload = {
        clientId: dataContainer.form.clientId,
        reason: dataContainer.form.reason,
        checkOutDate: dataContainer.form.checkOutDate,
        type: dataContainer.form.type,
        detail: dataContainer.form.detail,
        status: dataContainer.form.status,
        checkInDate: dataContainer.form.checkInDate,
        reviewerId: 15,  
        reviewTime: null,    
      };

      const res = await axios.post("http://localhost:8080/helpGiver/addOutRoom", payload);
      console.log('Response:', res.data); // 查看返回的数据
      if (res.data.isOk) {
        messageSuccess("退住申请提交成功");
        dataContainer.closeType = "confirm";
        configData.open = false;
      } else {
        messageError(res.data.msg || "提交失败");
      }
    } catch (error) {
      console.error(error);
      messageError("请求失败");
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
