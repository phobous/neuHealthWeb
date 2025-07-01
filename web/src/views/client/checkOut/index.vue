<template>
  <div class="page-container main-view">
     <!-- 搜索区域 -->
  <el-row :gutter="0" v-show="showSearch" class="page-query-box">
    <el-col :span="24" :xs="24">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-row :gutter="0">
          <el-col :span="6" :xs="6">
            <el-form-item label="客户姓名" prop="clientName">
              <el-input
                v-model="queryParams.clientName"
                placeholder="请输入客户姓名"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6" :xs="6" class="query-buttons">
            <el-form-item label=" ">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-col>
  </el-row>


    <!-- 表格区域 -->
 <div class="table-box content-container page-content-box">
    <div class="top-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['web:requests:export']">导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
   </div>
  
      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="requestsList"
        border
        @selection-change="handleSelectionChange"
        height="100%"
      >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="申请ID" align="center" prop="id" />
      <el-table-column label="客户姓名" align="center" prop="clientName" />
      <el-table-column label="类型" align="center" prop="type" />
      <el-table-column label="原因" align="center" prop="reason" />
      <el-table-column label="申请时间" align="center" prop="requestedAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.requestedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批状态" align="center" prop="status" />
      <el-table-column label="审批人ID" align="center" prop="reviewerId" />
      <el-table-column label="审批时间" align="center" prop="reviewTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.reviewTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['web:requests:edit']">审批</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
      v-model:current-page="data.queryParams.pageNum" v-model:page-size="queryParams.pageSize" @current-change="getList"
      @size-change="getList" />
</div>


    <!-- 添加或修改退住申请对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="requestsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户姓名" prop="clientName">
          <el-input v-model="form.clientName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="原因" prop="reason">
          <el-input v-model="form.reason" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="申请时间" prop="requestedAt">
          <el-date-picker clearable v-model="form.requestedAt" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择申请时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="审批人ID" prop="reviewerId">
          <el-input v-model="form.reviewerId" placeholder="请输入审批人ID" />
        </el-form-item>
        <el-form-item label="审批时间" prop="reviewTime">
          <el-date-picker clearable v-model="form.reviewTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择审批时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 审批对话框-->
    <el-dialog v-model="dialogVisible" title="审批退住申请" width="500px">
      <el-form :model="approveForm" :rules="approveRules" label-width="80px">
        <el-form-item label="审批员">
          <el-input v-model="approveForm.reviewerId" disabled />
        </el-form-item>
        <el-form-item label="审批状态" prop="status">
          <el-radio-group v-model="approveForm.status">
            <el-radio label="通过">通过</el-radio>
            <el-radio label="不通过">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批备注" prop="detail">
          <el-input v-model="approveForm.detail" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApproval">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Requests">
  import { getCurrentInstance,ref,reactive,toRefs } from 'vue'
  import {
    listRequests,
    getCheckout,
    getCheckoutPage,
    delRequests,
    addRequests,
    updateRequests,
    review
  } from "@/api/system/checkout"
  import { parseTime } from '@/utils/clientTool.js'
  import * as XLSX from 'xlsx'
  import { saveAs } from 'file-saver'
  import { userDataStore } from '@/store/user';
  const {
    proxy
  } = getCurrentInstance()

  const requestsList = ref([])
  const open = ref(false)
  const loading = ref(true)
  const showSearch = ref(true)
  const ids = ref([])
  const single = ref(true)
  const multiple = ref(true)
  const total = ref(0)
  const title = ref("")
  const requestsRef = ref(null)
  const queryRef = ref(null)
  const dialogVisible = ref(false)

  const userStore = userDataStore(); // ✅ 正确调用 defineStore 实例化
  const reviewerId = userStore.reviewerId;
  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      clientId: null,
      clientName:null,
      type: null,
      reason: null,
      requestedAt: null,
      status: null,
      reviewerId: reviewerId,
      reviewTime: null
    },
    rules: {
      id: [{
        required: true,
        message: "申请ID不能为空",
        trigger: "blur"
      }],
      clientName: [{
        required: true,
        message: "客户姓名不能为空",
        trigger: "blur"
      }],
      type: [{
        required: true,
        message: "类型不能为空",
        trigger: "change"
      }],
      reason: [{
        required: true,
        message: "原因不能为空",
        trigger: "blur"
      }],
      requestedAt: [{
        required: true,
        message: "申请时间不能为空",
        trigger: "blur"
      }],
      status: [{
        required: true,
        message: "审批状态不能为空",
        trigger: "change"
      }],
      reviewerId: [{
        required: true,
        message: "审批人ID不能为空",
        trigger: "blur"
      }],
      reviewTime: [{
        required: true,
        message: "审批时间不能为空",
        trigger: "blur"
      }]
    }
  })

  const {
    queryParams,
    form,
    rules
  } = toRefs(data)

  // 审批表单数据
  const approveForm = ref({
  requestId:null,
  reviewerId:reviewerId,
  status: '',
  detail: ''
  })
  const approveRules = {
  status: [
  { required: true, message: '请选择审批状态', trigger: 'change' }
  ]
  }

  /** 查询退住申请列表 */
  function getList() {
    loading.value = true
    console.log("当前页：", data.queryParams.pageNum)
    getCheckoutPage({
    pageNum: data.queryParams.pageNum,
    pageSize: queryParams.pageSize,
    name: queryParams.name
    }).then(res => {
    console.log(res.records)
    requestsList.value = res.records
    total.value = res.total
    loading.value = false
    })
  }

  // 取消按钮
  function cancel() {
    open.value = false
    reset()
  }

  // 表单重置
  function reset() {
    form.value = {
      id: null,
      clientId: null,
      type: null,
      reason: null,
      requestedAt: null,
      status: null,
      reviewerId: null,
      reviewTime: null
    }
    requestsRef.value?.resetFields()
    //proxy.resetForm("requestsRef")
  }

  // 提交审批表单
  function submitApproval() {
  if (!approveForm.value.status) {
  ElMessage.warning("请选择审批状态");
  return;
  }
  console.log(approveForm.value)
  review(approveForm.value)
  .then(res => {
  ElMessage.success("审批提交成功");
  dialogVisible.value = false;
  getList(); 
  })
  .catch(err => {
  ElMessage.error("审批提交失败");
  console.error(err);
  });
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.value.pageNum = 1
    getCheckoutByName()
  }

  /** 重置按钮操作 */
  function resetQuery() {
  queryRef.value?.resetFields()
  getList()
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 根据姓名查询客户/老人退住申请 */
  function getCheckoutByName() {
  loading.value = true
  console.log(queryParams)
  const { clientName } = queryParams.value
  console.log(clientName)
  getCheckout(clientName).then(response => {
  requestsList.value = response.checkout || []
  total.value = response.total || 0
  loading.value = false
  }).catch(() => {
  loading.value = false
  })
  }

  /** 新增按钮操作 */
  function handleAdd() {
    reset()
    open.value = true
    title.value = "添加退住申请"
  }

  /** 修改按钮操作 
  function handleUpdate(row) {
    reset()
    const _name = row.name
    const _type = row.type
    getRequests(_name,_type).then(response => {
      form.value = response.data
      open.value = true
      title.value = "修改退住申请"
    })
  }*/

  // 点击按钮时打开对话框，并填入当前行数据
  function handleUpdate(row) {
  approveForm.value.requestId = row.id
  approveForm.value.reviewerId = reviewerId
  approveForm.value.status = ''
  approveForm.value.detail = ''
  dialogVisible.value = true
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["requestsRef"].validate(valid => {
      if (valid) {
        if (form.value.id != null) {
          updateRequests(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功")
            open.value = false
            getList()
          })
        } else {
          addRequests(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功")
            open.value = false
            getList()
          })
        }
      }
    })
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const _ids = row.id || ids.value
    proxy.$modal.confirm('是否确认删除退住申请编号为"' + _ids + '"的数据项？').then(function () {
      return delRequests(_ids)
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {})
  }

  /** 导出按钮操作 
  function handleExport() {
    proxy.download('web/requests/export', {
      ...queryParams.value
    }, `requests_${new Date().getTime()}.xlsx`)
  }*/
  function handleExport() {
  if (!requestsList.value || requestsList.value.length === 0) {
  proxy.$message.warning('没有数据可导出')
  return
  }

  // 组装导出数据，映射中文表头
  const exportData = requestsList.value.map(item => ({
  '申请ID': item.id,
  '客户姓名': item.clientName,
  '类型': item.type,
  '原因': item.reason,
  '申请时间': item.requestedAt ? item.requestedAt.slice(0, 10) : '',
  '审批状态': item.status,
  '审批人ID': item.reviewerId,
  '审批时间': item.reviewTime ? item.reviewTime.slice(0, 10) : ''
  }))

  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // 创建工作簿并添加工作表
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '退住申请')

  // 写出二进制数据
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

  // 生成blob对象
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })

  // 保存文件，文件名带日期
  saveAs(blob, `退住申请_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  getList()
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-query-box {
  margin: 0 0 10px 0 !important;
  padding: 10px 10px 0 10px;
  background: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  :deep(.el-form-item) {
    margin-bottom: 10px !important;
  }
  :deep(.el-form-item--default) {
    width: 100%;
    margin-right: 0;
  }
  .el-form {
    width: 100%;
  }
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.page-content-box {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .left {
    display: flex;
    gap: 10px;
  }
  .right {
    display: flex;
    gap: 10px;
  }
}

.table-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.el-table {
  flex: 1;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}
</style>