<template>
  <div class="client-management-page">
    <el-card class="card">
      <template #header>
        <div class="header">
          <span>客户管理</span>
        </div>
      </template>

      <div class="search-container">
        <!-- 已分配管家的客户查询 -->
        <div class="search-box">
          <el-input v-model="assignedSearchQuery" placeholder="请输入客户姓名" />
          <el-button type="primary" @click="searchAssignedClients">查找</el-button>
        </div>

        <!-- 未分配管家的客户查询 -->
        <div class="search-box">
          <el-input v-model="unassignedSearchQuery" placeholder="请输入客户姓名" />
          <el-button type="primary" @click="searchUnassignedClients">查找</el-button>
        </div>
      </div>

      <div class="table-container">
        <div class="table-box">
          <h4>已分配管家的客户</h4>
          <el-table :data="assignedClients" border height="400px">
            <el-table-column prop="name" label="客户姓名" />
            <el-table-column prop="gender" label="性别" />
            <el-table-column prop="age" label="年龄" />
            <el-table-column prop="bedId" label="床号" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="danger" size="small" @click="removeClient(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="table-box">
          <h4>未分配管家的客户</h4>
          <el-table :data="unassignedClients" border height="400px">
            <el-table-column prop="name" label="客户姓名" />
            <el-table-column prop="gender" label="性别" />
            <el-table-column prop="age" label="年龄" />
            <el-table-column prop="bedId" label="床号" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" @click="assignCaregiver(scope.row.id)">添加</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>

    <div class="btn-area">
      <el-button type="primary" @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { debounce } from 'lodash';

// 获取caregiverId
const router = useRouter();
const route = useRoute();
const caregiverId = ref(route.query.caregiverId);  // 从路由的 query 获取 caregiverId

// 客户数据
const assignedClients = ref([]);
const unassignedClients = ref([]);

// 搜索查询条件
const assignedSearchQuery = ref('');
const unassignedSearchQuery = ref('');

// 获取已分配管家的客户
const fetchAssignedClients = async () => {
  if (!caregiverId.value) {
    ElMessage.error('未找到护理人员ID');
    return;
  }

  const res = await axios.get('http://localhost:8080/caregiver/clients/byCaregiver', {
    params: {
      caregiverId: caregiverId.value,
      name: assignedSearchQuery.value,
    },
  });

  if (res.data.isOk) {
    assignedClients.value = res.data.data;
  } else {
    ElMessage.error(res.data.msg || '查询失败');
  }
};

// 获取未分配管家的客户
const fetchUnassignedClients = async () => {
  const res = await axios.get('http://localhost:8080/caregiver/clients/unassigned', {
    params: {
      name: unassignedSearchQuery.value,  // 如果为空，查询所有未分配的客户
    },
  });
  if (res.data.isOk) {
    unassignedClients.value = res.data.data;
  } else {
    ElMessage.error(res.data.msg || '查询失败');
  }
};

// 使用 debounce 函数优化查询请求
const searchAssignedClients = debounce(() => {
  fetchAssignedClients();
}, 500); // 500ms 延迟

const searchUnassignedClients = debounce(() => {
  fetchUnassignedClients();
}, 500); // 500ms 延迟

// 分配管家
const assignCaregiver = async (clientId) => {
  if (!caregiverId.value) {
    ElMessage.error('未找到护理人员ID');
    return;
  }

  const res = await axios.post(`http://localhost:8080/caregiver/${caregiverId.value}/clients/${clientId}/assign`);
  if (res.data.isOk) {
    ElMessage.success('客户分配成功');
    fetchAssignedClients();
    fetchUnassignedClients();
  } else {
    ElMessage.error(res.data.msg || '分配失败');
  }
};

// 移除客户
const removeClient = async (clientId) => {
  if (!caregiverId.value) {
    ElMessage.error('未找到护理人员ID');
    return;
  }

  const res = await axios.delete(`http://localhost:8080/caregiver/${caregiverId.value}/clients/${clientId}/remove`);
  if (res.data.isOk) {
    ElMessage.success('客户移除成功');
    fetchAssignedClients();
    fetchUnassignedClients();
  } else {
    ElMessage.error(res.data.msg || '移除失败');
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 页面加载时初始化数据
onMounted(() => {
  fetchAssignedClients();
  fetchUnassignedClients();
});
</script>

<style scoped>
.client-management-page {
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

.search-container {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.search-box {
  display: flex;
  align-items: center;
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
