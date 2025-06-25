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
          <!-- Username -->
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="dataContainer.form.username" placeholder="请输入用户名" clearable :disabled="configData.isShow" />
            </el-form-item>
          </el-col>

          <!-- Real Name -->
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="dataContainer.form.realName" placeholder="请输入真实姓名" clearable :disabled="configData.isShow"/>
            </el-form-item>
          </el-col>

          <!-- Phone -->
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="dataContainer.form.phone" placeholder="请输入手机号" clearable :disabled="configData.isShow"/>
            </el-form-item>
          </el-col>

          <!-- Gender -->
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="dataContainer.form.gender" placeholder="请选择性别" clearable :disabled="configData.isShow">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- Employee Type (Role) -->
          <el-col :span="12">
            <el-form-item label="员工类型" prop="roleId">
              <el-select v-model="dataContainer.form.roleId" placeholder="请选择员工类型" clearable :disabled="configData.isShow">
                <el-option
                  v-for="(role, index) in dataContainer.roles"
                  :key="role.id" 
                  :label="role.roleName"  
                  :value="role.roleName" 
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- Email -->
          <el-col :span="12">
            <el-form-item label="电子邮件" prop="email">
              <el-input v-model="dataContainer.form.email" placeholder="请输入电子邮件" clearable :disabled="configData.isShow" />
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
import { ref, reactive, nextTick, onMounted } from 'vue';
import axios from 'axios';
import { messageError, messageSuccess } from '@/action/messagePrompt.js';

const configData = reactive({
  open: false,
  title: '用户管理',
  afterTitle: '',
  isShow: false, // Whether the dialog is in view-only mode
});

const FormElRef = ref();

const dataContainer = reactive({
  closeType: 'close',
  resolve: null,
  reject: null,
  form: {
    id: null,  // User ID (only used for editing)
    username: '',
    realName: '',
    phone: '',
    gender: '男',  // Default gender
    roleId: null,  // Role ID from the backend
    email: '',     // New field for email
  },
  roles: [],  // To store the roles fetched from the backend
  rules: {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }], 
    realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^[1][3-9][0-9]{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    roleId: [{ required: true, message: '请选择员工类型', trigger: 'change' }],
    email: [
      { 
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 
        message: '请输入有效的邮箱地址', 
        trigger: 'blur' 
      },
    ],
  },
});

// Reset data to clear the form
function resetData() {
  dataContainer.form = {
    username: '',
    realName: '',
    phone: '',
    gender: '男',
    roleId: null,
    email: '',  // Reset email field
  };
}

// Initialize the dialog with either new or edit data
function initData(show = true, data = {}, option = {}) {
  configData.open = show;
  configData.afterTitle = option.afterTitle || (data?.id ? ' - 修改' : ' - 新增');
  configData.isShow = option.isShow || false;
  resetData();

  // Ensure that the roleName is set correctly
  if (data?.roleName) {
    // Set roleName here, but we will convert it to roleId before submission
    dataContainer.form.roleId = data.roleName; // Set roleName for display
  }

  nextTick(() => {
    Object.assign(dataContainer.form, data);
  });

  return new Promise((resolve, reject) => {
    dataContainer.resolve = resolve;
    dataContainer.reject = reject;
  });
}

// Handle form submission
async function handleSubmit() {
  if (!FormElRef.value) return;
  
  FormElRef.value.validate(async (valid) => {
    if (!valid) return;

    const isEdit = !!dataContainer.form.id;
    const url = isEdit ? 'http://localhost:8080/user/updateUser' : 'http://localhost:8080/user/addUser';
    
    // Convert roleName to roleId before submitting
    const selectedRole = dataContainer.roles.find(role => role.roleName === dataContainer.form.roleId);
    if (selectedRole) {
      dataContainer.form.roleId = selectedRole.id;  // Use roleId instead of roleName
    }

    try {
      // Use PUT method for updating the user
      const res = await axios.put(url, dataContainer.form);  
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

// Fetch roles from the backend
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/user/queryRoles');
    if (res.data.isOk) {
      dataContainer.roles = res.data.data;  // Store roles in the dataContainer
    } else {
      messageError(res.data.msg || '获取角色列表失败');
    }
  } catch (err) {
    messageError('请求失败');
  }
});

// Handle dialog close event
function handleClose() {
  if (dataContainer.closeType === 'confirm') {
    dataContainer.resolve();
  } else {
    dataContainer.reject(dataContainer.closeType);
  }
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
