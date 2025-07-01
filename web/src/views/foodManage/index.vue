<template>
  <div class="chat-container">
    <div class="chat-header">🍽 食尚 · AI膳食助手</div>

    <div class="chat-body" ref="chatBody">
      <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
        <div class="bubble">
          <span v-if="msg.role === 'assistant'">🤖 食尚：</span>
          <span v-else>🧑‍💻 你：</span>
          {{ msg.content }}
        </div>
      </div>
    </div>

    <div class="chat-footer">
      <el-input
        v-model="userInput"
        placeholder="请输入你的问题..."
        @keyup.enter="sendMessage"
        class="input-box"
        clearable
      ></el-input>
      <el-button type="primary" @click="sendMessage">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const userInput = ref('');
const messages = ref([
  { role: 'assistant', content: '你好啊，你想询问一些膳食搭配吗？' }
]);
const chatBody = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  const content = userInput.value.trim();
  if (!content) return;

  messages.value.push({ role: 'user', content });
  userInput.value = '';
  scrollToBottom();

  try {
    const res = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个名为“食尚”的AI膳食搭配小助手，请根据用户的提问，给出专业、温和、友好的建议。' },
        ...messages.value.slice(-10) // 限制上下文长度
      ],
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_DEEPSEEK_API_KEY`
      }
    });

    const reply = res.data.choices[0].message.content;
    messages.value.push({ role: 'assistant', content: reply });
    scrollToBottom();
  } catch (err) {
    console.error('请求出错:', err);
    ElMessage.error('食尚暂时无法回应，请稍后再试');
  }
};

onMounted(scrollToBottom);
</script>

<style scoped>
.chat-container {
  max-width: 1100px;
  margin: 20px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 90vh;
}

.chat-header {
  background-color: #409eff;
  color: white;
  font-size: 20px;
  font-weight: bold;
  padding: 16px;
  text-align: center;
}

.chat-body {
    max-height: 600px;
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f7f9fc;
}

.message {
  margin-bottom: 16px;
}

.message.user .bubble {
  background: #e0f3ff;
  align-self: flex-end;
}

.message.assistant .bubble {
  background: #f1f1f1;
  align-self: flex-start;
}

.bubble {
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
  display: inline-block;
  font-size: 15px;
  line-height: 1.5;
}

.chat-footer {
  display: flex;
  padding: 12px;
  border-top: 1px solid #ddd;
  background-color: #fff;
}

.input-box {
  flex: 1;
  margin-right: 12px;
}
</style>