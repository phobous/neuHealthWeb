<template>
  <DefinScrollbar height="100%" :showUpBt="true">
    <div class="page-container main-view">
      <div class="container">
        <h2>东软颐养中心 - 数据概览</h2>
        <p class="intro">
          这里展示养中心各模块的关键业务数据，包括客户管理、床位管理、护理模块、健康管家及用户管理等。通过图表实时掌握业务运行状态。
        </p>

        <!-- 业务模块入口 -->
        <div class="modules">
          <div class="module-card" @click="goTo('customer-management')">
            <h3>客户管理</h3>
            <p>入住登记 · 退住登记 · 外出登记</p>
          </div>
          <div class="module-card" @click="goTo('bed-management')">
            <h3>床位管理</h3>
            <p>床位示意图 · 调换 · 使用详情</p>
          </div>
          <div class="module-card" @click="goTo('nursing')">
            <h3>护理模块</h3>
            <p>护理项目 · 护理级别 · 护理记录</p>
          </div>
          <div class="module-card" @click="goTo('health-steward')">
            <h3>健康管家</h3>
            <p>服务对象 · 日常护理 · 服务关注</p>
          </div>
          <div class="module-card" @click="goTo('user-management')">
            <h3>用户管理</h3>
            <p>基础信息维护</p>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="echart-container">
          <div class="top-container">
            <div class="chart-box left">
              <EchartContainer ref="customerChart" />
              <h4>客户入住趋势（折线图）</h4>
            </div>
            <div class="chart-box right">
              <EchartContainer ref="bedChart" />
              <h4>床位使用分布（饼图）</h4>
            </div>
          </div>
          <div class="middle-container">
            <div class="chart-box">
              <EchartContainer ref="nursingChart" />
              <h4>护理项目统计（柱状图）</h4>
            </div>
          </div>
          <div class="bottom-container">
            <div class="chart-box left">
              <EchartContainer ref="healthChart" />
              <h4>健康管家服务录入（折线图）</h4>
            </div>
            <div class="chart-box right">
              <EchartContainer ref="userChart" />
              <h4>用户增长统计（柱状图）</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefinScrollbar>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import EchartContainer from '@/components/echartContainer.vue';
import DefinScrollbar from '@/components/definScrollbar.vue';
import * as echarts from 'echarts';
import { useRouter } from 'vue-router'; // ✅ 引入 useRouter

export default defineComponent({
  components: { EchartContainer, DefinScrollbar },
  setup() {
    const customerChart = ref(null);
    const bedChart = ref(null);
    const nursingChart = ref(null);
    const healthChart = ref(null);
    const userChart = ref(null);
    const router = useRouter(); // ✅ 获取 router 实例

    const moduleMap = {
        'customer-management': '/main/client/check-in', 
        'bed-management': '/main/client/check-in', // 暂无床位管理单独页面，可统一到入住
        'nursing': '/main/care-level', // 默认跳转到护理级别
        'health-steward': '/main/set-target', // 可跳转到健康管家 - 设置服务对象
        'user-management': '/main/user-manage', // 跳转到用户管理
    };

    const goTo = (module) => {
        const path = moduleMap[module];
        if (path) {
        router.push(path);
        } else {
        console.warn(`未知模块：${module}`);
        }
    };


    onMounted(() => {
      // 客户入住趋势折线图
      customerChart.value.initData({
        title: { text: '客户入住趋势', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
        },
        yAxis: { type: 'value', name: '人数' },
        series: [
          {
            name: '入住人数',
            type: 'line',
            smooth: true,
            data: [120, 132, 101, 134, 90, 230, 210],
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(58,123,213,0.7)' },
                { offset: 1, color: 'rgba(0,210,255,0.3)' },
              ]),
            },
            itemStyle: { color: '#3a7bd5' },
          },
        ],
      });

      // 床位使用分布饼图
      bedChart.value.initData({
        title: { text: '床位使用分布', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            name: '床位状态',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: { show: false, position: 'center' },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold',
              },
            },
            labelLine: { show: false },
            data: [
              { value: 335, name: '已使用' },
              { value: 310, name: '空闲' },
              { value: 234, name: '维修中' },
            ],
          },
        ],
      });

      // 护理项目柱状图
      nursingChart.value.initData({
        title: { text: '护理项目统计', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['基础护理', '康复护理', '医疗护理', '心理护理', '营养护理'],
        },
        yAxis: { type: 'value', name: '数量' },
        series: [
          {
            name: '项目数量',
            type: 'bar',
            data: [120, 200, 150, 80, 70],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#72c2ff' },
                { offset: 1, color: '#0050b3' },
              ]),
            },
            barMaxWidth: 40,
          },
        ],
      });

      // 健康管家服务录入折线图
      healthChart.value.initData({
        title: { text: '健康管家服务录入', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        },
        yAxis: { type: 'value', name: '次数' },
        series: [
          {
            name: '录入次数',
            type: 'line',
            smooth: true,
            data: [50, 62, 45, 70, 80, 90, 100],
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255,138,101,0.7)' },
                { offset: 1, color: 'rgba(255,194,130,0.3)' },
              ]),
            },
            itemStyle: { color: '#ff8a65' },
          },
        ],
      });

      // 用户增长柱状图
      userChart.value.initData({
        title: { text: '用户增长统计', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        },
        yAxis: { type: 'value', name: '新增用户' },
        series: [
          {
            name: '新增用户',
            type: 'bar',
            data: [20, 35, 40, 60, 70, 90],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#85d8ce' },
                { offset: 1, color: '#0d7377' },
              ]),
            },
            barMaxWidth: 40,
          },
        ],
      });
    });

    return {
        customerChart,
        bedChart,
        nursingChart,
        healthChart,
        userChart,
        goTo,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #f8f9fc;

  .container {
    background: #fff;
    border-radius: 10px;
    padding: 25px 30px;
    box-sizing: border-box;
    min-height: 900px;

    h2 {
      font-weight: 700;
      color: #2f3e8f;
      margin-bottom: 10px;
    }

    .intro {
      color: #555;
      margin-bottom: 30px;
      font-size: 14px;
      line-height: 1.6;
    }

    /* 业务模块卡片 */
    .modules {
      display: flex;
      gap: 20px;
      margin-bottom: 40px;

      .module-card {
        flex: 1;
        background: #f0f4ff;
        border-radius: 10px;
        padding: 20px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgb(63 81 181 / 0.15);
        transition: all 0.3s ease;

        h3 {
          margin-bottom: 8px;
          color: #3a4db7;
        }

        p {
          font-size: 13px;
          color: #6c7a93;
        }

        &:hover {
          background: #d3d8ff;
          box-shadow: 0 5px 15px rgb(63 81 181 / 0.3);
        }
      }
    }

    /* 图表布局 */
    .echart-container {
      width: 100%;

      .top-container,
      .bottom-container {
        display: flex;
        gap: 30px;
        margin-bottom: 40px;

        .chart-box {
          background: #fff;
          flex: 1;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 320px;

          h4 {
            margin-top: 15px;
            color: #1e293b;
            font-weight: 600;
          }

          /* 图表组件撑满空间 */
          .echart-container-inner {
            flex-grow: 1;
            width: 100%;
          }
        }
      }

      .middle-container {
        margin-bottom: 40px;
        display: flex;
        justify-content: center;

        .chart-box {
          width: 60%;
          background: #fff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 320px;

          h4 {
            margin-top: 15px;
            color: #1e293b;
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>
