<template>
  <div class="client-care-management-page">
    <el-card class="card">
      <template #header>
        <div class="header">
          <span>客户护理项目管理</span>
        </div>
      </template>

      <div class="search-container">
        <!-- 已购买项目查询 -->
        <div class="search-box">
          <el-input v-model="purchasedSearchQuery" placeholder="请输入项目名称" />
          <el-button type="primary" @click="searchPurchasedItems">查找</el-button>
        </div>

        <!-- 未购买项目查询 -->
        <div class="search-box">
          <el-input v-model="availableSearchQuery" placeholder="请输入项目名称" />
          <el-button type="primary" @click="searchAvailableItems">查找</el-button>
        </div>
      </div>

      <div class="table-container">
        <!-- 已购买项目列表 -->
        <div class="table-box">
          <h4>已购买的护理项目</h4>
          <el-table :data="purchasedItems" border height="400px">
            <el-table-column prop="itemName" label="项目名称" />
            <el-table-column prop="quantity" label="数量" />
            <el-table-column prop="endDate" label="到期日期" />
            <el-table-column prop="status" label="状态" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="primary" size="small" @click="renewService(scope.row.id)">续费</el-button>
                <el-button type="danger" size="small" @click="removeItem(scope.row.id)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 未购买项目列表 -->
        <div class="table-box">
          <h4>未购买的护理项目</h4>
          <el-table :data="availableItems" border height="400px">
            <el-table-column prop="name" label="项目名称" />
            <el-table-column prop="price" label="价格" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" @click="assignItem(scope.row.id, scope.row.name)">配置</el-button>

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
  <RenewServiceDialog ref="renewDialogRef" @success="refreshAll" />
  <ConfirmRemoveDialog ref="removeDialogRef" @success="refreshAll" />
  <AssignItemDialog ref="assignDialogRef" @success="refreshAll"/>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { debounce } from 'lodash';
import RenewServiceDialog from "./components/renewServiceDialog.vue";
import ConfirmRemoveDialog from "./components/confirmRemoveDialog.vue";
import AssignItemDialog from './components/assignItemDialog.vue';
const assignDialogRef = ref();
const renewDialogRef = ref();
const removeDialogRef = ref();

const refreshAll = () => {
  fetchPurchasedItems();
  fetchAvailableItems();
};


// 获取 clientId
const router = useRouter();
const route = useRoute();
const clientId = ref(route.query.clientId);  // 从路由的 query 获取 clientId

// 客户数据
const purchasedItems = ref([]);
const availableItems = ref([]);

// 搜索查询条件
const purchasedSearchQuery = ref('');
const availableSearchQuery = ref('');

// 获取已购买的护理项目
const fetchPurchasedItems = async () => {
  if (!clientId.value) {
    ElMessage.error('未找到客户ID');
    return;
  }

  const res = await axios.get('http://localhost:8080/clientCareConfig/byClientId', {
    params: {
      clientId: clientId.value,
      name: purchasedSearchQuery.value,
    },
  });

  if (res.data.isOk) {
    purchasedItems.value = res.data.data;
  } else {
    ElMessage.error(res.data.msg || '查询失败');
  }
};

// 获取未购买的护理项目
const fetchAvailableItems = async () => {
  if (!clientId.value) {
    ElMessage.error('未找到客户ID');
    return;
  }

  const res = await axios.get(`http://localhost:8080/clientCareConfig/availableForClient/${clientId.value}`, {
    params: {
      name: availableSearchQuery.value,  // 如果为空，查询所有未购买的项目
    },
  });

  if (res.data) {
    availableItems.value = res.data;
  } else {
    ElMessage.error(res.data.msg || '查询失败');
  }
};

// 使用 debounce 函数优化查询请求
const searchPurchasedItems = debounce(() => {
  fetchPurchasedItems();
}, 500); // 500ms 延迟

const searchAvailableItems = debounce(() => {
  fetchAvailableItems();
}, 500); // 500ms 延迟

//续费
const renewService = (configId) => {
  const item = purchasedItems.value.find(i => i.id === configId);
  if (!item) return ElMessage.warning('未找到对应项目');

  renewDialogRef.value.open(item);
};


//移除
const removeItem = (configId) => {
  removeDialogRef.value.open(configId);
};


//配置
const assignItem = (itemId, itemName) => {
  assignDialogRef.value.open(clientId.value, itemId, itemName);
};



// 返回上一页
const goBack = () => {
  router.back();
};

// 页面加载时初始化数据
onMounted(() => {
  fetchPurchasedItems();
  fetchAvailableItems();
});
</script>

<style scoped>
.client-care-management-page {
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
