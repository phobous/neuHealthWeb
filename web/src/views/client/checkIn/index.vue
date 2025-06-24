<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable @change="handleQuery">
          <el-option label="自理" value="自理" />
          <el-option label="护理" value="护理" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:clients:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:clients:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="clientsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="客户ID" align="center" prop="clientId" />
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="性别" align="center" prop="gender" />
      <el-table-column label="民族" align="center" prop="nation" />
      <el-table-column label="出生日期" align="center" prop="birthDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.birthDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="身份证号" width="200" align="center" prop="idCard" />
      <el-table-column label="楼号" align="center" prop="building" />
      <el-table-column label="床号" align="center" prop="bedNumber" />
      <el-table-column label="房间号" align="center" prop="roomNumber" />
      <el-table-column label="血型" align="center" prop="bloodType" />
      <!--<el-table-column label="膳食ID" align="center" prop="mealId" />-->
      <el-table-column label="入住时间" align="center" prop="checkInDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.checkInDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合同到期时间" align="center" prop="contractEndDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.contractEndDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="老人类型" align="center" prop="type" />
      <el-table-column label="家属" align="center" prop="contactName" />
      <el-table-column label="家属联系电话" align="center" prop="phone" width="180" />
      <el-table-column label="添加时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:clients:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:clients:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total"
      v-model:current-page="data.queryParams.pageNum" v-model:page-size="queryParams.pageSize" @current-change="getList"
      @size-change="getList" />


    <!-- 添加或修改客户/老人基本信息对话框 -->
    <el-dialog :title="title" v-model="open" width="750px" append-to-body>
      <div style="padding: 0 24px;">
        <el-form ref="clientsRef" :model="form" :rules="rules" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入姓名" :disabled="form.id != null" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="楼栋">
                <el-input value="606" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="民族" prop="nation">
                <el-input v-model="form.nation" placeholder="请输入民族" :disabled="form.id != null" />
              </el-form-item>
            </el-col>
            <template v-if="!form.id">
            <el-col :span="12">
              <el-form-item label="房间号" prop="roomNumber">
                <el-select v-model="form.roomNumber" placeholder="请选择房间号" @change="fetchBedOptions"
                  :disabled="form.id != null">
                  <el-option-group v-for="(rooms, floor) in roomOptions" :key="floor" :label="floor">
                    <el-option v-for="room in rooms" :key="room.id" :label="room.roomNumber" :value="room.roomNumber" />
                  </el-option-group>
                </el-select>
              </el-form-item>
            </el-col>
          </template>
            <el-col :span="12">
              <el-form-item label="身份证号" prop="idCard">
                <el-input v-model="form.idCard" @input="onIdCardChange" maxlength="18" placeholder="请输入身份证号"
                  :disabled="form.id != null" />
              </el-form-item>
            </el-col>
            <template v-if="!form.id">
            <el-col :span="12">
              <el-form-item label="床位号" prop="bedNumber">
                <el-select v-model="form.bedNumber" placeholder="请选择床位号" @change="onBedChange"
                  :disabled="form.id != null">
                  <el-option v-for="bed in bedOptions" :key="bed.id" :label="bed.bedNumber" :value="bed.bedNumber" />
                </el-select>
              </el-form-item>
            </el-col>
          </template>
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="form.gender" :disabled="form.id != null">
                  <el-radio label="男">男</el-radio>
                  <el-radio label="女">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <template v-if="!form.id">
            <el-col :span="12">
              <el-form-item label="出生日期" prop="birthDate">
                <el-input v-model="form.birthDate" placeholder="自动填入" disabled />
              </el-form-item>
            </el-col>
          </template>
            <el-col :span="12">
              <el-form-item label="老人类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择类型" :disabled="form.id != null">
                  <el-option label="自理" value="自理" />
                  <el-option label="护理" value="护理" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="血型" prop="bloodType">
                <el-input v-model="form.bloodType" placeholder="请输入血型" :disabled="form.id != null" />
              </el-form-item>
            </el-col>
            <template v-if="!form.id">
            <el-col :span="12">
              <el-form-item label="家属" prop="contactName">
                <el-input v-model="form.contactName" placeholder="请输入联系人" :disabled="form.id != null" />
              </el-form-item>
            </el-col>
          
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入联系电话" :disabled="form.id != null" />
              </el-form-item>
            </el-col>
          </template>
            <el-col :span="12">
              <el-form-item label="入住时间" prop="checkInDate">
                <el-date-picker v-model="form.checkInDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择入住时间"
                  :disabled="form.id != null" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同到期" prop="contractEndDate">
                <el-date-picker v-model="form.contractEndDate" type="date" value-format="YYYY-MM-DD"
                  placeholder="请选择合同到期时间" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="添加时间" prop="createdAt">
                <el-date-picker v-model="form.createdAt" type="date" value-format="YYYY-MM-DD" placeholder="请选择添加时间"
                  :disabled="form.id != null" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <div style="text-align: center; padding-top: 10px;">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="Clients">
import { getCurrentInstance,ref,reactive,toRefs } from 'vue'
import { listClients, getClientPage, getClientsWithRoomPage, getBedByRoom, getClients, delClients, delClient, addClients,
updateClients
} from
"@/api/system/clients"
import { getAllRooms } from '@/api/system/room'
import { parseTime } from '@/utils/clientTool.js'
import { download } from '@/utils/download'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
const { proxy } = getCurrentInstance()

const clientsList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const queryRef = ref(null)
const clientsRef = ref(null)
const roomOptions = ref([])
const bedOptions = ref([])

const data = reactive({
  form: {
    idCard: '',
    birthDate: '',
    contactName:'',
    phone:''
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clientId:null,
    name: null,
    gender: null,
    nation: null,
    birthDate: null,
    idCard: null,
    bloodType: null,
    mealId: null,
    checkInDate: null,
    contractEndDate: null,
    type: '',
    isDeleted: null,
    createdAt: null,
    bedId: null,
    bedNumber:null,
    building:'606',
    floor:null,
    roomId:null,
    roomNumber:null,
    isAllocated:null
  },
  rules: {
  name: [
  { required: true, message: "姓名不能为空", trigger: "blur" }
  ],
  nation: [
  { required: true, message: "民族不能为空", trigger: "blur" }
  ],
  gender: [
  { required: true, message: "性别不能为空", trigger: "blur" }
  ],
  idCard: [
  { required: true, message: "身份证号不能为空", trigger: "blur" }
  ],
  contactName: [
  { required: true, message: "家属不能为空", trigger: "blur" }
  ],
  phone: [
  { required: true, message: "联系电话不能为空", trigger: "blur" }
  ],
  birthDate: [
  { required: true, message: "出生日期不能为空", trigger: "blur" }
  ],
  type: [
  { required: true, message: "老人类型不能为空", trigger: "change" }
  ],
  checkInDate: [
  { required: true, message: "入住时间不能为空", trigger: "change" }
  ],
  contractEndDate: [
  { required: true, message: "合同到期时间不能为空", trigger: "change" }
  ],
  bloodType: [
  { required: true, message: "血型不能为空", trigger: "blur" }
  ],
  createdAt: [
  { required: true, message: "添加时间不能为空", trigger: "change" }
  ],
  bedId: [
  { required: true, message: "床位ID不能为空", trigger: "blur" }
  ]
  }
})


const { queryParams, form, rules } = toRefs(data)
//
const fetchRoomOptions = async () => {
try {
const res = await getAllRooms()
roomOptions.value = res
} catch (error) {
console.error("加载房间列表失败:", error)
}
}
//
const fetchBedOptions = async (roomNumber) => {
try {
const selectedRoom = Object.values(roomOptions.value).flat().find(room => room.roomNumber === roomNumber)
if (!selectedRoom) {
bedOptions.value = []
return
}
const res = await getBedByRoom(selectedRoom.id)
bedOptions.value = res // 确保格式为 [{ bedNumber: "1" }, { bedNumber: "2" }]
} catch (error) {
console.error('加载床位失败:', error)
}
}
//
const onBedChange = (selectedBedNumber) => {
const selectedBed = bedOptions.value.find(bed => bed.bedNumber === selectedBedNumber)
if (selectedBed) {
form.value.bedId = selectedBed.id
} else {
form.value.bedId = null
}
}


/** 查询客户/老人基本信息列表 */
function getList() {
  loading.value = true
  console.log("准备查询，参数：", queryParams.value.name, queryParams.value.type)
  console.log("当前页：", data.queryParams.pageNum)
  getClientsWithRoomPage({
  pageNum: data.queryParams.pageNum,
  pageSize: queryParams.pageSize,
  name: queryParams.value.name,
  type: queryParams.value.type
  }).then(res => {
  console.log(res.records)
  clientsList.value = res.records
  total.value = res.total
  loading.value = false
  })
  /*
  listClients(queryParams.value).then(response => {
    console.log(response)
    clientsList.value = response.clients
    total.value = response.total
    loading.value = false
  })*/
}
/** 根据姓名和类型查询客户/老人基本信息 */
function getClient() {
loading.value = true
getClientsWithRoomPage({
pageNum: data.queryParams.pageNum,
pageSize: queryParams.pageSize,
name: queryParams.name,
type: queryParams.type
}).then(response => {
console.log("查询到的信息："+response.records)
clientsList.value = response.records || []
total.value = response.total || 0 
loading.value = false
}).catch(() => {
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
    name: null,
    gender: null,
    nation: null,
    birthDate: null,
    idCard: null,
    bloodType: null,
    mealId: null,
    checkInDate: null,
    contractEndDate: null,
    type: null,
    isDeleted: null,
    createdAt: null,
    bedId: null
  }
  clientsRef.value?.resetFields()
  //proxy.resetForm("clientsRef")
}
//
function buildPayload(form) {
return {
client: {
name: form.name,
nation: form.nation,
gender: form.gender,
birthDate: form.birthDate,
idCard: form.idCard,
bloodType: form.bloodType,
checkInDate: form.checkInDate,
contractEndDate: form.contractEndDate,
type: form.type,
createdAt: form.createdAt,
bedId: form.bedId,
bedNumber: form.bedNumber,
building: form.building,
floor: form.floor,
roomId: form.roomId,
roomNumber: form.roomNumber
},
contact: {
contactName: form.contactName,
phone: form.phone
}
}
}


/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
  //getClient()
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

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "入住登记"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _name = row.name 
  const _type = row.type
  getClients(_name,_type).then(response => {
    form.value = response.client[0]
    console.log(form.value)
    open.value = true
    title.value = "修改合同到期时间"
  })
}

/** 提交按钮 */
async function submitForm() {
try {
if (form.value.id != null) {
await updateClients(form.value)
ElMessage.success("修改成功")
open.value = false
getList()
} else {
const payload = buildPayload(form.value)
console.log("拼接的新增表单是这样的：",payload)
const response = await addClients(payload)
if (response.isOk === true) {
ElMessage.success("新增成功")
open.value = false
getList()
} else {
ElMessage.warning(response.msg || '新增失败，请重试')
}
}
} catch (error) {
  console.error('提交表单错误:', error)
  const msg = error.response?.data?.message
  if (msg) {
  ElMessage.error(msg)
  } else {
  ElMessage.error('操作失败，请稍后重试')
  }
}
}

/** 删除按钮操作 */
function handleDelete(row) {
  console.log(row)
const _ids = row.clientId || ids.value
ElMessageBox.confirm(`是否确认删除客户/老人基本信息编号为"${_ids}"的数据项？`, '提示', {
confirmButtonText: '确定',
cancelButtonText: '取消',
type: 'warning'
}).then(() => {
return delClient(_ids)
}).then(() => {
getList()
ElMessage.success('删除成功')
}).catch(() => {
// 取消或出错时什么都不做
})
}
/*自动填写出生日期 */
function onIdCardChange(val) {
console.log(val)
if (val && val.length >= 14) {
// 取出7~14位，即索引6~13，格式为 YYYYMMDD
const birthStr = val.slice(6, 14)
console.log(birthStr)
const year = birthStr.slice(0, 4)
const month = birthStr.slice(4, 6)
const day = birthStr.slice(6, 8)
// 校验月份和日期合理性
if (
Number(month) >= 1 && Number(month) <= 12 && Number(day)>= 1 && Number(day) <= 31 ) {
    form.value.birthDate=`${year}-${month}-${day}` 
  } 
else { form.birthDate='' } } else { form.birthDate='' }
if(val.length>=18){
  // 性别自动填充
  form.value.gender = getGenderByIdCard(val)
}
console.log(form.birthDate)

}

/*性别自动填写 */
function getGenderByIdCard(idCard) {
if (!idCard || idCard.length < 2) return '' ; // 倒数第二位索引：length - 2
 const genderCode=idCard.charAt(idCard.length - 2);
  if (isNaN(genderCode)) return '' ; // 奇数为男，偶数为女
   return (parseInt(genderCode) % 2===1) ? '男' : '女' ; }



/** 导出按钮操作 
function handleExport() {
download('/system/clients/export', { ...queryParams.value }, `clients_${Date.now()}.xlsx`)
}*/
function handleExport() {
const exportData = clientsList.value.map(client => ({
姓名: client.name,
性别: client.gender,
民族: client.nation,
身份证号: client.idCard,
出生日期: client.birthDate,
楼号: client.building,
房间号: client.roomNumber,
床位号: client.bedNumber,
血型: client.bloodType,
入住时间: client.checkInDate,
合同到期时间: client.contractEndDate,
老人类型: client.type,
添加时间: client.createdAt
}))

const worksheet = XLSX.utils.json_to_sheet(exportData)
const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, worksheet, '客户信息')
const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
saveAs(blob, `客户信息_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

getList()
fetchRoomOptions()
</script>
