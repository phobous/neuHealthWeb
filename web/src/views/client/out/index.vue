<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户姓名" prop="clientName">
        <el-input v-model="queryParams.clientName" placeholder="请输入客户姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!--
      <el-form-item label="外出时间" prop="outTime">
        <el-date-picker clearable v-model="queryParams.outTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择外出时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="预计回院时间" prop="expectedReturnTime">
        <el-date-picker clearable v-model="queryParams.expectedReturnTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择预计回院时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="实际回院时间" prop="actualReturnTime">
        <el-date-picker clearable v-model="queryParams.actualReturnTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择实际回院时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="审批人ID" prop="reviewerId">
        <el-input v-model="queryParams.reviewerId" placeholder="请输入审批人ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="审批时间" prop="reviewTime">
        <el-date-picker clearable v-model="queryParams.reviewTime" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择审批时间">
        </el-date-picker>
      </el-form-item>
      -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!--
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:out:add']">新增</el-button>
      </el-col>-->
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:out:export']">导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="outList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="申请ID" align="center" prop="id" />
      <el-table-column label="客户姓名" align="center" prop="clientName" />
      <el-table-column label="外出事由" align="center" prop="reason" />
      <el-table-column label="外出时间" align="center" prop="outTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.outTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预计回院时间" align="center" prop="expectedReturnTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expectedReturnTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际回院时间" align="center" prop="actualReturnTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.actualReturnTime, '{y}-{m}-{d}') }}</span>
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
          <el-button link type="primary" icon="Edit" @click="handleUpdateReview(scope.row)" v-hasPermi="['system:out:edit']">
            审批</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
      v-model:current-page="data.queryParams.pageNum" v-model:page-size="queryParams.pageSize" @current-change="getList"
      @size-change="getList" />

    <!-- 添加或修改外出申请对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="outRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户姓名" prop="clientName">
          <el-input v-model="form.clientName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="外出事由" prop="reason">
          <el-input v-model="form.reason" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="外出时间" prop="outTime">
          <el-date-picker clearable v-model="form.outTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择外出时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预计回院时间" prop="expectedReturnTime">
          <el-date-picker clearable v-model="form.expectedReturnTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择预计回院时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实际回院时间" prop="actualReturnTime">
          <el-date-picker clearable v-model="form.actualReturnTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择实际回院时间">
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
    <el-dialog v-model="dialogVisible" title="审批外出申请" width="500px">
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

<script setup name="Out">
import { getCurrentInstance,ref,reactive,toRefs } from 'vue'
  import {
    listOut,
    getOut,
    getOutPage,
    delOut,
    addOut,
    updateOut,
    review
  } from "@/api/system/out"
  import { parseTime } from '@/utils/clientTool.js'
  import * as XLSX from 'xlsx'
  import { saveAs } from 'file-saver'

  const {
    proxy
  } = getCurrentInstance()

  const outList = ref([])
  const open = ref(false)
  const loading = ref(true)
  const showSearch = ref(true)
  const ids = ref([])
  const single = ref(true)
  const multiple = ref(true)
  const total = ref(0)
  const title = ref("")
  const outRef = ref(null)
  const queryRef = ref(null)
  const dialogVisible = ref(false)

  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      clientId: null,
      clientName:null,
      reason: null,
      outTime: null,
      expectedReturnTime: null,
      actualReturnTime: null,
      status: null,
      reviewerId: null,
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
      reason: [{
        required: true,
        message: "外出事由不能为空",
        trigger: "blur"
      }],
      outTime: [{
        required: true,
        message: "外出时间不能为空",
        trigger: "blur"
      }],
      expectedReturnTime: [{
        required: true,
        message: "预计回院时间不能为空",
        trigger: "blur"
      }],
      actualReturnTime: [{
        required: true,
        message: "实际回院时间不能为空",
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
  reviewerId:'',
  status: '',
  detail: ''
  })
  const approveRules = {
  status: [
  { required: true, message: '请选择审批状态', trigger: 'change' }
  ]
  }

  /** 查询外出申请列表 */
  function getList() {
    loading.value = true
    console.log("当前页：", data.queryParams.pageNum)
    getOutPage({
    pageNum: data.queryParams.pageNum,
    pageSize: queryParams.pageSize,
    name: queryParams.name
    }).then(res => {
    console.log(res.records)
    outList.value = res.records
    total.value = res.total
    loading.value = false
    })
  }

  // 点击按钮时打开对话框，并填入当前行数据
  function handleUpdateReview(row) {
  approveForm.value.requestId = row.id
  approveForm.value.reviewerId = row.reviewerId
  approveForm.value.status = ''
  approveForm.value.detail = ''
  dialogVisible.value = true
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
      clientName:null,
      reason: null,
      outTime: null,
      expectedReturnTime: null,
      actualReturnTime: null,
      status: null,
      reviewerId: null,
      reviewTime: null
    }
    outRef.value?.resetFields()
    //proxy.resetForm("outRef")
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
  getOutbyName(); // 审批后刷新列表
  })
  .catch(err => {
  ElMessage.error("审批提交失败");
  console.error(err);
  });
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.value.pageNum = 1
    getOutbyName()
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

  /** 根据姓名查询客户/老人外出申请 */
  function getOutbyName() {
  loading.value = true
  console.log(queryParams)
  const { clientName } = queryParams.value
  console.log(clientName)
  getOut(clientName).then(response => {
  outList.value = response.out || []
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
    title.value = "添加外出申请"
  }

  /** 修改按钮操作 */
  function handleUpdate(row) {
    reset()
    const _name = row.clientName
    getOut(_name).then(response => {
      form.value = response.out[0]
      open.value = true
      title.value = "修改外出申请"
    })
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["outRef"].validate(valid => {
      if (valid) {
        if (form.value.id != null) {
          updateOut(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功")
            open.value = false
            getList()
          })
        } else {
          addOut(form.value).then(response => {
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
    proxy.$modal.confirm('是否确认删除外出申请编号为"' + _ids + '"的数据项？').then(function () {
      return delOut(_ids)
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {})
  }

  /** 导出按钮操作 
  function handleExport() {
    proxy.download('system/out/export', {
      ...queryParams.value
    }, `out_${new Date().getTime()}.xlsx`)
  }*/
  function handleExport() {
  if (!outList.value || outList.value.length === 0) {
  proxy.$message.warning('没有数据可导出')
  return
  }

  // 构造导出数据，映射成中文表头
  const exportData = outList.value.map(item => ({
  '申请ID': item.id,
  '客户姓名': item.clientName,
  '外出事由': item.reason,
  '外出时间': item.outTime ? item.outTime.slice(0, 10) : '',
  '预计回院时间': item.expectedReturnTime ? item.expectedReturnTime.slice(0, 10) : '',
  '实际回院时间': item.actualReturnTime ? item.actualReturnTime.slice(0, 10) : '',
  '审批状态': item.status,
  '审批人ID': item.reviewerId,
  '审批时间': item.reviewTime ? item.reviewTime.slice(0, 10) : ''
  }))

  // 使用xlsx构建工作表和工作簿
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '外出申请')

  // 生成二进制数据
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

  // 转成blob并保存
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `外出申请_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }
  getList()
</script>
