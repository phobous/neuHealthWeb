<template>
  <div class="project-config-page">
    <el-card class="card">
      <template #header>
        <div class="header">
          <span>护理项目配置</span>
          <el-select v-model="levelId" placeholder="选择护理级别" @change="fetchItems">
            <el-option
              v-for="level in levelOptions"
              :key="level.id"
              :label="level.name"
              :value="level.id"
            />
          </el-select>
        </div>
      </template>

      <div class="table-container">
        <div class="table-box">
          <h4>已配置项目</h4>
          <el-table :data="boundItems" border height="400px">
            <el-table-column prop="name" label="项目名称" />
            <el-table-column prop="code" label="编号" />
            <el-table-column prop="price" label="价格" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="danger" size="small" @click="removeItem(scope.row.id)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="table-box">
          <h4>可添加项目</h4>
          <el-table :data="availableItems" border height="400px">
            <el-table-column prop="name" label="项目名称" />
            <el-table-column prop="code" label="编号" />
            <el-table-column prop="price" label="价格" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" @click="addItem(scope.row.id)">添加</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="btn-area">
        <el-button type="primary" @click="confirm">确认</el-button>
        <el-button @click="goBack">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();

const levelId = ref(null);
const levelOptions = ref([]);
const boundItems = ref([]);
const availableItems = ref([]);
const selectedToAdd = ref([]);
const selectedToRemove = ref([]);

const fetchLevels = async () => {
  const res = await axios.get('http://localhost:8080/careLevel/listAll');
  if (res.data.isOk) {
    levelOptions.value = res.data.care_levels;
    if (!levelId.value && route.query.levelId) {
      levelId.value = parseInt(route.query.levelId);
    }
    if (levelId.value) fetchItems();
  }
};

const fetchItems = async () => {
  if (!levelId.value) return;
  const [boundRes, availableRes] = await Promise.all([
    axios.get(`http://localhost:8080/careLevelItem/bound?levelId=${levelId.value}`),
    axios.get(`http://localhost:8080/careLevelItem/available?levelId=${levelId.value}`)
  ]);
  if (boundRes.data.isOk) boundItems.value = boundRes.data.items;
  if (availableRes.data.isOk) availableItems.value = availableRes.data.items;
};

const addItem = async (itemId) => {
  const res = await axios.post('http://localhost:8080/careLevelItem/add', {
    levelId: levelId.value,
    itemIds: [itemId],
  });
  if (res.data.isOk) {
    ElMessage.success('添加成功');
    fetchItems();
  } else {
    ElMessage.error(res.data.msg);
  }
};

const removeItem = async (itemId) => {
  const res = await axios.delete('http://localhost:8080/careLevelItem/remove', {
    params: { levelId: levelId.value, itemId }
  });
  if (res.data.isOk) {
    ElMessage.success('移除成功');
    fetchItems();
  } else {
    ElMessage.error(res.data.msg);
  }
};

const confirm = () => {
  ElMessage.success('配置已保存');
  router.push({ name: 'care-level' });  // 使用命名路由
};


const goBack = () => {
  router.back();
};

onMounted(fetchLevels);
</script>

<style scoped>
.project-config-page {
  padding: 20px;
}
.card {
  padding: 20px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.table-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
}
.table-box {
  width: 48%;
}
.btn-area {
  margin-top: 20px;
  text-align: right;
}
</style>
