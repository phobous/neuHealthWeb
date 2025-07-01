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
            <el-form-item label="客户姓名" prop="clientName" >
              <el-input v-model="dataContainer.form.clientName" disabled />
            </el-form-item>
          </el-col>

          <!-- 外出事由（必填） -->
          <el-col :span="24">
            <el-form-item label="外出事由" prop="reason">
              <el-input
                v-model="dataContainer.form.reason"
                placeholder="请输入外出事由"
                :disabled="configData.isShow"
              />
            </el-form-item>
          </el-col>

          <!-- 外出时间（必填） -->
          <el-col :span="24">
            <el-form-item label="外出时间" prop="outTime">
              <el-date-picker
                v-model="dataContainer.form.outTime"
                type="datetime"
                placeholder="请选择外出时间"
                style="width: 100%"
                :disabled="configData.isShow"
                :picker-options="outTimePickerOptions"
              />
            </el-form-item>
          </el-col>

          <!-- 预计回院时间（必填，不能早于外出时间） -->
          <el-col :span="24">
            <el-form-item label="预计回院时间" prop="expectedReturnTime">
              <el-date-picker
                v-model="dataContainer.form.expectedReturnTime"
                type="datetime"
                placeholder="请选择预计回院时间"
                style="width: 100%"
                :disabled="configData.isShow"
                :picker-options="expectedReturnTimePickerOptions"
              />
            </el-form-item>
          </el-col>

          <!-- 陪同人（选填） -->
          <el-col :span="24">
            <el-form-item label="陪同人" prop="contactName">
              <el-input
                v-model="dataContainer.form.contactName"
                placeholder="请输入陪同人"
                :disabled="configData.isShow"
              />
            </el-form-item>
          </el-col>

          <!-- 陪同人电话（选填） -->
          <el-col :span="24">
            <el-form-item label="陪同人电话" prop="contactPhone">
              <el-input
                v-model="dataContainer.form.contactPhone"
                placeholder="请输入陪同人电话"
                :disabled="configData.isShow"
              />
            </el-form-item>
          </el-col>

          <!-- 审批状态（默认已提交，不显示） -->
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
  title: "外出申请",
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
    outTime: "", // 必填，日期时间
    expectedReturnTime: "", // 必填，且 >= outTime
    contactName: "", // 选填
    contactPhone: "", // 选填
    status: "已提交", // 默认已提交，提交时传给后台
  },
  rules: {
    clientName: [{ required: true, message: "客户姓名不能为空", trigger: "blur" }],
    reason: [{ required: true, message: "外出事由不能为空", trigger: "blur" }],
    outTime: [{ required: true, message: "请选择外出时间", trigger: "change" }],
    expectedReturnTime: [
        {
        validator(rule, value) {
            if (!value) return true;
            if (!dataContainer.form.outTime) return true;
            return new Date(value) >= new Date(dataContainer.form.outTime);
        },
        message: "预计回院时间不得早于外出时间",
        trigger: "change",
        },
    ],
  },
});

// 限制预计回院时间不能早于外出时间
const outTimePickerOptions = {};
const expectedReturnTimePickerOptions = computed(() => {
  if (!dataContainer.form.outTime) {
    return {};
  }
  return {
    disabledDate(time) {
      return time.getTime() < new Date(dataContainer.form.outTime).getTime();
    },
  };
});

function resetData() {
  dataContainer.form = {
    clientId: null,
    clientName: "",
    reason: "",
    outTime: "",
    expectedReturnTime: "",
    contactName: "",
    contactPhone: "",
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
 * @param {Object} data 初始化数据，至少包括 clientId, clientName
 */
function initData(show = true, data = {}) {
  configData.open = show;
  configData.afterTitle = " - 新增外出申请";
  configData.isShow = false;
  resetData();
  nextTick(() => {
    Object.assign(dataContainer.form, {
      clientId: data.clientId || null,
      clientName: data.clientName || "",
      // 其他字段可选，视具体场景
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
        outTime: dataContainer.form.outTime,
        expectedReturnTime: dataContainer.form.expectedReturnTime,
        detail: `陪同人：${dataContainer.form.contactName || '无'}，电话：${dataContainer.form.contactPhone || '无'}`,
        actualReturnTime: null,
        status: dataContainer.form.status,
      };

      const res = await axios.post("http://localhost:8080/helpGiver/add", payload);

      if (res.data.isOk) {
        messageSuccess("添加成功");
        dataContainer.closeType = "confirm";
        configData.open = false;
      } else {
        messageError(res.data.msg || "添加失败");
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
