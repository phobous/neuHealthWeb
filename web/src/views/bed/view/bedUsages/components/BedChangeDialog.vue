<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="550px"
    @close="handleClose"
    class="custom-change-dialog"
    :close-on-click-modal="false"
  >
    <el-form
      ref="changeForm"
      :model="formData"
      label-width="120px"
      size="default"
      class="custom-change-form"
    >
    
        <el-form-item label="客户姓名" prop="name">
          <el-input
            v-model="formData.name"
            disabled
            class="custom-input custom-disabled-input"
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-input
            v-model="formData.gender"
            disabled
            class="custom-input custom-disabled-input"
          />
        </el-form-item>

        <el-form-item label="旧床位信息" prop="oldBed">
          <el-input
            :model-value="formatBedDetail(formData.oldBed)"
            disabled
            class="custom-input custom-disabled-input"
          />
        </el-form-item>
        <el-form-item label="新楼号" prop="newFloor">
          <el-select
            v-model="formData.newFloor"
            placeholder="请选择新楼号"
            clearable
            class="custom-input custom-enabled-select"
          >
            <el-option label="606" value="606"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="新房号" prop="newRoom">
          <el-select
            v-model="formData.newRoom"
            placeholder="请选择新房号"
            clearable
            class="custom-input custom-enabled-select"
            @change="handleRoomChange"
          >
            <!-- 使用计算属性生成格式化的房间号标签 -->
            <el-option
              v-for="roomOption in formattedRoomList"
              :key="roomOption.value"
              :label="roomOption.label"
              :value="roomOption.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="新床号" prop="newBedNo">
          <el-select
           @change="handleBedChange"
            v-model="formData.newBedNo"
            placeholder="请选择新床号"
            clearable
            class="custom-input custom-enabled-select"
          >
            <el-option
              v-for="bed in bedList"
              :key="bed.id"
              :label="bed.bedNumber"
              :value="bed.bedNumber"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="起始日期" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            disabled
            class="custom-input custom-disabled-picker"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            disabled
            class="custom-input custom-disabled-picker"
          />
        </el-form-item>
    </el-form>
    <template #footer>
      <div class="custom-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定调换</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineEmits, nextTick, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const emit = defineEmits(['confirm', 'close']);

const dialogVisible = ref(false);
const dialogTitle = ref('床位调换');
const formData = reactive({
  id: '',
  name: '',
  oldBed: '',
  oldBedId: '',
  clientId: '',
  gender: '',
  newFloor: '606',
  newBedId: '',
  newRoom: '',
  newBedNo: '',
  startTime: null,
  endTime: null,
});

// 房间和床位选项
const roomList = ref([]);
const bedList = ref([]);
const allBeds = ref([]);
const loadingBeds = ref(false);

// 计算属性：生成格式化的房间号选项（核心修改点）
const formattedRoomList = computed(() => {
  return roomList.value.map(room => {
    const roomNum = parseInt(room);
    let formattedLabel = '';
    
    // 根据房间号范围生成不同格式的显示值（1-10→1001-1010，11-20→2001-2010，21-30→3001-3010）
    if (roomNum >= 1 && roomNum <= 10) {
      formattedLabel = `10${roomNum < 10 ? '0' + roomNum : roomNum}`; // 1→1001，10→1010
    } else if (roomNum >= 11 && roomNum <= 20) {
      formattedLabel = `20${roomNum - 10 < 10 ? '0' + (roomNum - 10) : roomNum - 10}`; // 11→2001，20→2010
    } else if (roomNum >= 21 && roomNum <= 30) {
      formattedLabel = `30${roomNum - 20 < 10 ? '0' + (roomNum - 20) : roomNum - 20}`; // 21→3001，30→3010
    } else {
      // 超出范围的房间号保持原值显示
      formattedLabel = room;
    }
    
    return {
      value: room,    // 实际存储的值仍为原始房间号
      label: formattedLabel  // 显示为四位数格式
    };
  });
});

// 组件挂载时获取所有床位数据
onMounted(async () => {
  loadingBeds.value = true;
  try {
    const response = await axios.get('http://localhost:8080/bed/getAllBeds');
    if (response.data.if === 1) {
      allBeds.value = response.data.beds;
      initRoomList();
      console.log("房间表"+response.data.beds);
    } else {
      ElMessage.warning('未找到可用床位信息');
    }
  } catch (error) {
    ElMessage.error('加载床位数据失败');
    console.error('获取床位数据错误:', error);
  } finally {
    loadingBeds.value = false;
  }
});

// 初始化房间列表
const initRoomList = () => {
  // 从所有床位数据中提取房间号并去重
  const rooms = [...new Set(allBeds.value.map(bed => bed.roomId))];
  roomList.value = rooms.sort((a, b) => a - b); // 按房间号排序
};

// 处理房间号变化，更新床号列表
const handleRoomChange = () => {
  formData.newBedNo = '';
  formData.newBedId = '';
  if (!formData.newRoom) {
    bedList.value = [];
    formData.newBedId = '';
    return;
  }
  
  // 筛选当前房间的可用床位
  const beds = allBeds.value
    .filter(bed => bed.roomId === formData.newRoom && !bed.isDeleted && bed.status === '空闲');
    
  bedList.value = beds.sort((a, b) => a.bedNumber - b.bedNumber);
};

const initData = (row) => {
  return new Promise((resolve, reject) => {
    formData.id = row.id;
    formData.clientId = row.clientId || '';
    formData.name = row.clientName || '';
    formData.oldBed = row.bedNumber || '';
    formData.oldBedId = row.bedId || '';  
    formData.gender = row.clientGender || '';
    formData.startTime = row.checkInDate ? new Date(row.checkInDate) : null;
    formData.endTime = row.checkOutDate ? new Date(row.checkOutDate) : null;

    // 重置新床位选择
    formData.newRoom = '';
    formData.newBedNo = '';
    bedList.value = [];

    dialogVisible.value = true;
    nextTick(resolve);
  });
};

// 处理床号变化
const handleBedChange = () => {
  if (!formData.newBedNo) {
    formData.newBedId = '';
    return;
  }
  
  // 查找选中床号对应的ID
  const selectedBed = bedList.value.find(
    bed => bed.bedNumber === formData.newBedNo
  );
  
  if (selectedBed) {
    formData.newBedId = selectedBed.id;
  } else {
    formData.newBedId = '';
  }
};

const handleConfirm = async () => {
  if (!formData.newRoom || !formData.newBedNo) {
    ElMessage.warning('请选择新房号和新床号');
    return;
  }

  try {
    const newBedDetail = `${formData.newFloor}#${formData.newRoom}-${formData.newBedNo}`;
    console.log('提交的数据:', {
      id: formData.id,
      newBedId: formData.newBedId,
      oldBedId: formData.oldBedId,
      clientId: formData.clientId,
    });
    const response = await axios.post('http://localhost:8080/bedUsageRecord/swapBed', {
      id: formData.id,
      newBedId: formData.newBedId,
      oldBedId: formData.oldBedId,
      clientId: formData.clientId,
    });
    
    if (response.data.if) {
      ElMessage.success('床位调换成功！');
      dialogVisible.value = false;
      emit('confirm');
    } else {
      ElMessage.error(response.data.msg || '调换失败，请重试');
    }
  } catch (error) {
    ElMessage.error('网络异常或服务器错误');
  }
};

const formatBedDetail = (bedDetail) => {
  return bedDetail ? `606#${bedDetail}` : '';
};

const handleClose = () => {
  dialogVisible.value = false;
  emit('close');
};

defineExpose({
  initData
});
</script>

<style scoped>
/* 弹窗整体样式 */
.custom-change-dialog {
  --el-dialog-background-color: #fff;
  --el-dialog-border-radius: 12px;
  --el-dialog-title-font-size: 18px;
  --el-dialog-title-font-weight: 600;
  padding: 24px 20px;
}

/* 标题样式 */
.custom-change-dialog .el-dialog__header {
  padding-bottom: 16px;
}

/* 表单容器 */
.custom-change-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 表单分区样式 */
.form-section {
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f9fafb;
}

.section-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

/* 统一控制输入框/日期选择器/选择器宽度 */
.custom-input {
  width: 260px; /* 增加宽度，使输入框不顶到右侧边界 */
}
.custom-input .el-input__inner,
.custom-input .el-date-editor .el-input__inner,
.custom-input .el-select__input {
  width: 100%;
  border-radius: 6px;
}

/* 禁用状态样式 */
.custom-disabled-input .el-input__inner,
.custom-disabled-picker .el-input__inner,
.custom-disabled-select .el-select__input {
  background-color: #f8f9fa;
  color: #6c757d;
  border-color: #e9ecef;
  cursor: not-allowed;
}

/* 可编辑状态样式 */
.custom-enabled-input .el-input__inner,
.custom-enabled-select .el-select__input {
  border-color: #dcdfe6;
  transition: border-color 0.2s;
}
.custom-enabled-input .el-input__inner:focus,
.custom-enabled-select .el-select__input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 表单项间距统一 */
.el-form-item {
  margin-bottom: 12px; 
}

/* 底部按钮区 */
.custom-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 20px;
}
.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}
.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
</style>