<template>
  <div class="bed-map-container">
    <!-- 头部：楼层选择 + 床位状态统计 -->
    <div class="header-section">
      <div class="floor-select-group">
        <label for="floor-select" class="floor-label">楼层：</label>
        <select 
          id="floor-select" 
          v-model="selectedFloor" 
          @change="onFloorChange" 
          class="floor-select"
        >
          <option 
            v-for="floor in floors" 
            :key="floor" 
            :value="floor"
          >{{ floor }}</option>
        </select>
      </div>

      <div class="bed-status-row">
        <div 
          class="bed-status-group" 
          v-for="status in bedStatusList" 
          :key="status.label"
        >
          <i class="iconfont big-icon" :class="status.class">&#xe626;</i>
          <span class="count-label">{{ status.label }}：{{ status.count }}</span>
        </div>
      </div>
    </div>

    <!-- 楼层地图区域 -->
    <div class="floor-map-area" v-if="currentFloor">
      <div class="floor-header">
        <div class="floor-title">{{ currentFloor.name }}</div>
      </div>

      <div class="rooms-grid">
        <!-- 遍历当前楼层房间 -->
        <div 
          v-for="room in currentFloor.rooms" 
          :key="room.roomNumber" 
          class="room-block"
          :class="{ 'special-room': room.type === 'special' }"
        >
          <!-- 房间号 + 特殊房间标签（如活动中心） -->
          <div class="room-number-wrapper">
            <span class="room-number">{{ room.roomNumber }}</span>
            <span 
              v-if="room.type === 'special'" 
              class="room-type-tag"
            >{{ room.label }}</span>
          </div>

          <!-- 普通房间：渲染床位 -->
          <div v-if="room.type === 'normal'" class="beds-in-room-vertical">
            <div 
              v-for="bed in room.beds" 
              :key="bed.bedNumber" 
              class="bed-icon-wrap-vertical"
              :class="{ 'occupied': bed.status === '有人' }"
              :title="`床位号：${bed.bedNumber} - 状态：${bed.status}`"
            >
              <i class="iconfont bed-icon" :class="bed.statusClass">&#xe626;</i>
              <div class="bed-label">{{ bed.bedNumber }}</div>
            </div>
          </div>

          <!-- 特殊房间：渲染功能图标 -->
          <div v-else class="special-room-content">
            <template v-if="specialIcons[room.label]">
              <i class="iconfont special-icon" v-html="specialIcons[room.label]"></i>
            </template>
            <span class="special-room-label">{{ room.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'

// 楼层选择：和后端 floor 映射（一层=1、二层=2...）
const floors = ['一层', '二层', '三层']
const floorMap = { '一层': 1, '二层': 2, '三层': 3 }
const selectedFloor = ref('一层')

// 床位状态统计（添加状态图标）
const bedStatusList = ref([
  { label: '总床位', count: 0, class: 'gray', icon: '&#xe626;' },
  { label: '空闲', count: 0, class: 'green', icon: '&#xe626;' },
  { label: '有人', count: 0, class: 'red', icon: '&#xe626;' },
  { label: '外出', count: 0, class: 'blue', icon: '&#xe626;' }
])

// 特殊房间图标映射（和 rooms 里的 label 对应）
const specialIcons = {
  '活动中心': '&#xe807;',
  '电梯厅': '&#xe625;',
  '厕所': '&#xe7b6;',
  '卫生室': '&#xe616;',
  '微机室': '&#xeb49;',
  '食堂': '&#xe63a;',
  '住院室': '&#xe689;',
  '演播室': '&#xe8ae;'
}

// 床位状态图标映射
const bedStatusIcons = {
  '有人': '&#xe617;', // 有人图标（示例：用户图标）
  '空闲': '&#xe619;', // 空闲图标（示例：空床图标）
  '外出': '&#xe627;', // 外出图标（示例：箭头图标）
  '默认': '&#xe626;'  // 默认图标
}

// 楼层数据结构：区分普通房间（normal）和特殊房间（special）
const floorsData = ref([
  {
    name: '一层',
    rooms: [
      { roomNumber: '1001', type: 'normal', beds: [] },
      { roomNumber: '1002', type: 'special', label: '活动中心' },
      { roomNumber: '1003', type: 'special', label: '电梯厅' },
      { roomNumber: '1004', type: 'special', label: '厕所' },
      { roomNumber: '1005', type: 'normal', beds: [] },
      { roomNumber: '1006', type: 'normal', beds: [] },
      { roomNumber: '1007', type: 'normal', beds: [] },
      { roomNumber: '1008', type: 'normal', beds: [] },
      { roomNumber: '1009', type: 'normal', beds: [] },
      { roomNumber: '1010', type: 'normal', beds: [] },
    ]
  },
  {
    name: '二层',
    rooms: [
      { roomNumber: '2001', type: 'normal', beds: [] },
      { roomNumber: '2002', type: 'normal', beds: [] },
      { roomNumber: '2003', type: 'normal', beds: [] },
      { roomNumber: '2004', type: 'normal', beds: [] },
      { roomNumber: '2005', type: 'normal', beds: [] },
      { roomNumber: '2006', type: 'normal', beds: [] },
      { roomNumber: '2007', type: 'normal', beds: [] },
      { roomNumber: '2008', type: 'normal', beds: [] },
      { roomNumber: '2009', type: 'normal', beds: [] },
      { roomNumber: '2010', type: 'normal', beds: [] },
    ]
  },
  {
    name: '三层',
    rooms: [
      { roomNumber: '3001', type: 'normal', beds: [] },
      { roomNumber: '3002', type: 'normal', beds: [] },
      { roomNumber: '3003', type: 'normal', beds: [] },
      { roomNumber: '3004', type: 'normal', beds: [] },
      { roomNumber: '3005', type: 'normal', beds: [] },
      { roomNumber: '3006', type: 'normal', beds: [] },
      { roomNumber: '3007', type: 'normal', beds: [] },
      { roomNumber: '3008', type: 'normal', beds: [] },
      { roomNumber: '3009', type: 'normal', beds: [] },
      { roomNumber: '3010', type: 'normal', beds: [] },
    ]
  }
])

// 当前选中楼层的计算属性
const currentFloor = computed(() => 
  floorsData.value.find(f => f.name === selectedFloor.value)
)

// ------------------- 接口请求 & 数据处理 ------------------- 
// 获取床位统计（总床位、空闲等）
function getStatusCount() {
  const floorNum = floorMap[selectedFloor.value]
  axios.get("http://localhost:8080/bed/getBedStatistics")
    .then(response => {
      const data = response.data.beds[0];
      bedStatusList.value = [
        { label: '总床位', count: data.total || 0, class: 'gray', icon: '&#xe626;' },
        { label: '空闲', count: data.idle || 0, class: 'green', icon: '&#xe619;' },
        { label: '有人', count: data.occupied || 0, class: 'red', icon: '&#xe617;' },
        { label: '外出', count: data.out_count || 0, class: 'blue', icon: '&#xe627;' },
      ];
    })
    .catch(error => {
      console.error("获取床位统计失败:", error);
    });
}

// 获取房间 & 床位信息，适配后端返回格式
function getRoomsAndBeds() {
  const floorNum = floorMap[selectedFloor.value];
  axios.get("http://localhost:8080/bed/getAllBeds")
    .then(response => {
      const beds = response.data.beds || [];
      const floorObj = floorsData.value.find(f => f.name === selectedFloor.value);
      
      if (floorObj) {
        floorObj.rooms.forEach(room => {
          if (room.type === 'normal') {
            const roomBeds = beds.filter(bed => 
              bed.bedNumber.startsWith(room.roomNumber)
            );
            
            room.beds = roomBeds.map(bed => ({
              ...bed,
              statusClass: bed.status === '有人' 
                ? 'red' 
                : bed.status === '空闲' 
                  ? 'green' 
                  : bed.status === '外出' 
                    ? 'blue' 
                    : 'gray',
              statusIcon: bedStatusIcons[bed.status] || bedStatusIcons['默认']
            }));
          }
        });
      }
    })
    .catch(error => {
      console.error("获取房间床位失败:", error);
    });
}

// 楼层切换时重新请求数据
function onFloorChange() {
  getStatusCount();
  getRoomsAndBeds();
}

// 组件挂载时初始化
onMounted(() => {
  getStatusCount();
  getRoomsAndBeds();
});
</script>

<style scoped>
/* 基础容器：保持宽适配，增加背景与内边距呼应设计 */
.bed-map-container {
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1920px;
  margin: 0 auto;
  background: #f8f9fb; /* 浅灰背景更贴近图示 */
}

/* 头部区域：拆分楼层选择 + 统计行，用 Flex 让排版更紧凑 */
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.floor-select-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.floor-label {
  font-size: 18px; /* 加大楼层选择文字 */
  color: #333;
}
.floor-select {
  padding: 8px 14px; /* 适配字号，加宽内边距 */
  font-size: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

/* 床位统计行：图标 + 文字横向排列，和设计稿对齐 */
.bed-status-row {
  display: flex;
  align-items: center;
  gap: 24px;
}
.bed-status-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
.big-icon {
  font-size: 24px; /* 放大统计图标 */
}
.count-label {
  font-size: 16px; /* 加大统计文字 */
  color: #666;
}

/* 楼层地图标题：突出显示，和设计稿层级一致 */
.floor-header {
  margin-bottom: 16px;
}
.floor-title {
  font-size: 28px; /* 大幅加大楼层标题 */
  font-weight: 700; /* 加粗增强视觉 */
  color: #1890ff;
}

/* 房间网格：关键调整！改成 5 列固定 + 间距，贴合设计稿排版 */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 强制 5 列，和设计稿一致 */
  gap: 20px; 
  margin: 0; /* 去掉默认负边距，避免错位 */
}

/* 房间卡片：优化背景、边框、内边距，贴近设计稿样式 */
.room-block {
  background: #e6f7ff; /* 浅蓝背景，特殊房间和普通房间区分开 */
  border: none; 
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  padding: 20px; /* 加大内边距适配大字体 */
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  min-height: 220px; /* 压缩高度，更贴近设计稿 */
  position: relative;
}
/* 普通房间单独改背景，和特殊房间区分 */
.room-block[type="normal"] {
  background: #fff; 
}

/* 房间号 + 标签：排版和设计稿对齐，调整字体大小 */
.room-number-wrapper {
  width: 100%;
  display: flex;
  justify-content: center; /* 居中显示房间号 */
  align-items: center;
  margin-bottom: 16px;
}
.room-number {
  font-size: 24px; /* 大幅加大房间号 */
  font-weight: 700; /* 加粗 */
  color: #1890ff;
}
.room-type-tag {
  font-size: 14px;
  background: #fff; 
  color: #1890ff;
  padding: 4px 8px; /* 适配字号，加宽内边距 */
  border-radius: 4px;
  font-weight: 500;
  position: absolute; 
  top: 12px; 
  right: 12px; 
}

/* 普通房间 - 床位垂直排列：简化样式，贴近设计稿“空白占位” */
.beds-in-room-vertical {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: center;
}
.bed-icon-wrap-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px; /* 加大内边距 */
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 80px; /* 固定宽度，让空白更规整 */
  height: 80px; /* 固定高度 */
  justify-content: center;
}
/* 床位默认显示空白（设计稿里空闲房间无图标，仅占位），可根据实际需求加状态 */
.bed-icon {
  font-size: 32px; /* 放大床位占位图标 */
  color: #d9d9d9; /* 浅灰占位 */
}
.bed-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

/* 特殊房间 - 功能图标 & 标签：放大图标，居中排版 */
.special-room-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex-grow: 1;
  justify-content: center;
  gap: 12px;
}
.special-icon {
  font-size: 48px; /* 大幅放大功能图标 */
  color: #1890ff;
}
.special-room-label {
  font-size: 20px; /* 加大特殊房间标签 */
  color: #333;
  font-weight: 600;
  text-align: center;
}

/* 状态颜色：和设计稿保持一致 */
.green { color: limegreen; }
.red { color: #ff4d4f; }
.gray { color: gray; }
.blue { color: #1890ff; }

/* 响应式：小屏幕适配，优先保证 5 列排版，极限宽度再换行 */
@media (max-width: 1200px) {
  .rooms-grid {
    grid-template-columns: repeat(5, minmax(120px, 1fr));
  }
}
@media (max-width: 768px) {
  .rooms-grid {
    grid-template-columns: repeat(2, 1fr); 
  }
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  /* 小屏幕时适当缩小标题，避免溢出 */
  .floor-title {
    font-size: 24px;
  }
  .room-number {
    font-size: 20px;
  }
  .special-room-label {
    font-size: 16px;
  }
}
</style>