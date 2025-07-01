<script>
/**
 * 登录页面
 *  */
import { defineComponent, ref, reactive, onMounted } from 'vue';
import publicApi from '@/http/public.js'; // 如果不再用验证码接口可删除
import { messageSuccess, messageError } from '@/action/messagePrompt';
import { useRoute, useRouter } from 'vue-router';
import { throttleFn_1 as throttleFn } from '@/common/debounceAndThrottle';
import { verifiedData } from '@/common/verifiedTools';
import { Select, ArrowRightBold, SemiSelect } from '@element-plus/icons-vue';
import { userDataStore } from '@/store/user';
import img_1 from '@/assets/login-imgs/img-1.gif';
import img_2 from '@/assets/login-imgs/login-bg.svg';
import img_3 from '@/assets/login-imgs/code.svg';
import img_4 from '@/assets/login-imgs/login-bg-1.svg';
import img_5 from '@/assets/login-imgs/login-bg-2.svg';
import img_6 from '@/assets/login-imgs/login-bg-3.svg';
import img_7 from '@/assets/login-imgs/login-bg-4.png';
import axios from 'axios';  // Import axios for API requests
import allApi from '../../http/User';

export default defineComponent({
    name: 'LoginView',
    components: {
        Select,
        ArrowRightBold,
        SemiSelect,
    },
    setup() {
        const userData = userDataStore();
        const router = useRouter();
        const route = useRoute();

        const dataContainer = reactive({
            form: {
                username: '',
                password: '',
                captchaText: '',
            },
            loading: false,
            loading_1: false,
            img: {
                img_1,
                img_2,
                img_3,
                img_4,
                img_5,
                img_6,
                img_7,
            },
        });

        // 验证码相关
        const canvasRef = ref(null);
        const generatedCode = ref('');

        // 生成随机验证码字符串
        function generateCode(length = 5) {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
            let code = '';
            for (let i = 0; i < length; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            generatedCode.value = code;
            drawCaptcha(code);
        }

        // 绘制验证码到canvas
        function drawCaptcha(code) {
            const canvas = canvasRef.value;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 背景色
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 文字
            ctx.font = '24px Arial';
            ctx.fillStyle = '#333';
            ctx.textBaseline = 'middle';
            ctx.fillText(code, 10, canvas.height / 2);

            // 干扰线
            for (let i = 0; i < 3; i++) {
                ctx.strokeStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
                ctx.beginPath();
                ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.stroke();
            }
        }

        // 验证基础数据
        function validBase(data) {
            const failData = verifiedData(data, {
                username: {
                    label: '账号 : 不能为空 && 长度1-150',
                    validate(value) {
                        if (!value && value !== 0) return false;
                        value = String(value);
                        if (value.length < 1) return false;
                        if (value.length > 150) return false;
                        return true;
                    },
                },
                password: {
                    label: '密码 : 不能为空 && 长度1-150',
                    validate(value) {
                        if (!value && value !== 0) return false;
                        value = String(value);
                        if (value.length < 1) return false;
                        if (value.length > 150) return false;
                        return true;
                    },
                },
                captchaText: {
                    label: '验证码 : 不能为空 && 长度1-7',
                    validate(value) {
                        if (!value && value !== 0) return false;
                        value = String(value);
                        if (value.length < 1) return false;
                        if (value.length > 7) return false;
                        return true;
                    },
                },
            });
            return failData;
        }

        // 登录函数
        const onLogin = throttleFn(async function (otherParams) {
            if (dataContainer.loading) return;

            // 验证参数
            const failData = validBase(dataContainer.form);
            if (failData) {
                messageError('参数错误！' + failData[0].label);
                return;
            }

            // 校验前端验证码
            if (dataContainer.form.captchaText.toLowerCase() !== generatedCode.value.toLowerCase()) {
                messageError('验证码错误，请重新输入');
                generateCode(); // 重新生成验证码
                dataContainer.form.captchaText = '';
                return;
            }

            dataContainer.loading = true;
            const params = {
                ...dataContainer.form,
                ...otherParams,
            };

            try {
                console.log('请求参数:', params);
                const res = await axios.post('http://localhost:8080/user/login', params, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                let data = res.data || {};

                if (data.isOk) {
                    console.log("嘿嘿输出一行" + res.data.user.username);
                    // 保存 roleId 和 token
                    const loginData = await allApi.login();
                    const token = loginData.token || '';
                    const roleId = res.data.user.roleId;
                    const caregiverId = res.data.user.caregiverId;
                    const reviewerId = res.data.user.id;
                    userData.setUserInfo({ token, roleId, caregiverId, reviewerId });

                    localStorage.setItem('user_type', res.data.user.type);
                    dataContainer.form.password = '';

                    messageSuccess('登录成功');

                    let routeParams = route.query || {};
                    if (routeParams.from) {
                        router.push(decodeURIComponent(routeParams.from));
                    } else {
                        router.push('/');
                    }
                } else {
                    messageError('登录失败：' + data.msg);
                }
            } catch (err) {
                messageError('登录失败：' + err.message);
            } finally {
                dataContainer.loading = false;
                generateCode(); // 登录失败或完成后，刷新验证码
                dataContainer.form.captchaText = '';
            }
        }, 700);

        /** 去除首尾空格 */
        function toTrim(data, p) {
            let str = data[p];
            str = (str || '').replace(/^\s+|\s+$/g, '');
            data[p] = str;
        }

        /** 去除特殊符号 */
        function palindrome(data, p) {
            let str = data[p];
            str = (str || '').replace(
                /[:~!#$%^&*() \+ =<>?"{}|, \/ ;' \\ [ \] ~！#￥%……&*（） \+ ={}|《》？：“”【】、；‘’，。、]/g,
                '',
            );
            data[p] = str;
        }

        // 初始化，页面加载时生成验证码
        onMounted(() => {
            generateCode();
            // 1分钟刷新一次验证码
            setInterval(() => {
                generateCode();
            }, 60000);
        });

        return {
            dataContainer,
            onLogin,
            toTrim,
            palindrome,
            canvasRef,
            generatedCode,
            generateCode,
        };
    },
});
</script>

<template>
    <div
        class="login-view"
        :style="{
            '--bg-img-1': `url(${dataContainer.img.img_1})`,
            '--bg-img-2': `url(${dataContainer.img.img_2})`,
        }"
    >
        <div class="img-bg">
            <el-image class="img" :src="dataContainer.img.img_4" fit="contain" />
        </div>
        <div class="container">
            <div class="left">
                <el-carousel :interval="7000" arrow="never">
                    <el-carousel-item>
                        <div class="item">
                            <el-image class="img" :src="dataContainer.img.img_7" fit="contain" />
                            <div class="title">简洁明了</div>
                            <div class="content">代码结构统一，清晰</div>
                        </div>
                    </el-carousel-item>
                    <el-carousel-item>
                        <div class="item">
                            <el-image
                                class="img img-1"
                                :src="dataContainer.img.img_5"
                                fit="contain"
                            />
                            <div class="title">东软颐养中心</div>
                            <div class="content">老吾老以及人之老</div>
                        </div>
                    </el-carousel-item>
                    <el-carousel-item>
                        <div class="item">
                            <el-image
                                class="img img-2"
                                :src="dataContainer.img.img_6"
                                fit="contain"
                            />
                            <div class="title">界面</div>
                            <div class="content">清新小巧，布局合理</div>
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
            <div class="right">
                <div class="container">
                    <div class="title">登 录</div>
                    <div class="other-login-bt">
                        <div class="item">
                            <SvgIcon :style="'width:20px;height:20px;'" name="svg:g.svg"></SvgIcon>
                        </div>
                        <div class="item">
                            <SvgIcon :style="'width:20px;height:20px;'" name="svg:f.svg"></SvgIcon>
                        </div>
                        <div class="item">
                            <SvgIcon
                                :style="'width:20px;height:20px;'"
                                name="svg:weixin.svg"
                            ></SvgIcon>
                        </div>
                    </div>
                    <div class="content-1">或使用您的账号</div>
                    <div class="input-container">
                        <SvgIcon
                            :style="'width:20px;height:20px;margin-right:10px;'"
                            name="svg:zhanghao.svg"
                        ></SvgIcon>
                        <el-input
                            clearable
                            @input="
                                () => {
                                    toTrim(dataContainer.form, 'username');
                                    palindrome(dataContainer.form, 'username');
                                }
                            "
                            placeholder="账号"
                            @keyup.enter="onLogin"
                            v-model="dataContainer.form.username"
                        />
                    </div>
                    <div class="input-container">
                        <SvgIcon
                            :style="'width:20px;height:20px;margin-right:10px;'"
                            name="svg:mima.svg"
                        ></SvgIcon>
                        <el-input
                            type="password"
                            clearable
                            @keyup.enter="onLogin"
                            show-password
                            placeholder="密码"
                            @input="
                                () => {
                                    toTrim(dataContainer.form, 'password');
                                }
                            "
                            v-model="dataContainer.form.password"
                        />
                    </div>
                    <div class="input-container code">
                        <SvgIcon
                            :style="'width:20px;height:20px;margin-right:10px;'"
                            name="svg:cat-code.svg"
                        ></SvgIcon>
                        <el-input
                            v-model="dataContainer.form.captchaText"
                            placeholder="验证码"
                            clearable
                            @keyup.enter="onLogin"
                        >
                        </el-input>
                        <!-- 这里改成canvas显示验证码 -->
                        <canvas
                            ref="canvasRef"
                            width="100"
                            height="40"
                            class="img"
                            style="cursor: pointer;"
                            @click="generateCode"
                        ></canvas>
                    </div>
                    <div class="bt-list">
                        <el-button
                            class="login-bt"
                            v-if="!dataContainer.form.idU"
                            :loading="dataContainer.loading"
                            @click="onLogin"
                        >
                            登 录
                        </el-button>
                    </div>
                    <div class="other">
                        <!-- <router-link to="/register">
                            没有账号？去注册
                        </router-link> -->
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom">
            版权所有----东软颐养中心 - 实训小组又双叒出发
            <a href="https://github.com/wurencaideli/dumogu-admin" target="_blank" class="bt">
                <SvgIcon :style="'width:60px;height:25px;'" name="svg:github.svg"></SvgIcon>
            </a>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.login-view {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: var(--bg-img-2);
    background-size: contain;
    background-position: center bottom;
    background-repeat: no-repeat;
    padding: 15px;
    box-sizing: border-box;
    color: rgb(32, 32, 32);
    position: relative;
    > .img-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;
        > .img {
            width: 90%;
            height: 90%;
        }
    }
    > .container {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: row;
        width: 100%;
        max-width: 900px;
        background-color: rgb(255, 255, 255);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 4px 4px 5px 0 rgba(0, 0, 0, 0.449);
        > .left {
            flex: 1 1 0;
            width: 0;
            background-color: #e9e9e9;
            background-repeat: no-repeat;
            :deep(.el-carousel) {
                width: 100%;
                height: 100%;
                .el-carousel__container {
                    width: 100%;
                    height: 100%;
                    .item {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                        > .img {
                            width: 100%;
                            max-width: 200px;
                            height: 100%;
                            max-height: 200px;
                            transform: scale(1.5) translateY(-40px);
                            &.img-1 {
                                transform: scale(1.7) translateY(-15px) translateX(-10px);
                            }
                            &.img-2 {
                                transform: scale(1.5) translateY(-30px);
                            }
                        }
                        > .title {
                            font-size: 20px;
                            color: #000000;
                            margin: 10px 0 0 0;
                            font-weight: bold;
                            position: absolute;
                            bottom: 80px;
                        }
                        > .content {
                            font-size: 15px;
                            color: #000000;
                            opacity: 0.7;
                            margin-top: 15px;
                            position: absolute;
                            bottom: 50px;
                        }
                    }
                }
                .el-carousel__indicators {
                    bottom: 10px;
                    --el-carousel-indicator-width: 40px;
                    --el-carousel-indicator-height: 7px;
                    .is-active {
                        .el-carousel__button {
                            width: 60px;
                            opacity: 1;
                        }
                    }
                    .el-carousel__button {
                        border-radius: 3px;
                        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.204);
                        background-color: #0059b2;
                        background: linear-gradient(to right, #007fff, #0059b2);
                        opacity: 0.3;
                    }
                }
            }
        }
        > .right {
            flex: 1 1 0;
            width: 0;
            > .container {
                width: 100%;
                height: 100%;
                padding: 20px 30px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: center;
                > .title {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    font-size: 22px;
                    font-weight: bold;
                }
                > .other-login-bt {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    margin: 15px 0;
                    > .item {
                        border: 1px solid #ddd;
                        border-radius: 50%;
                        display: inline-flex;
                        justify-content: center;
                        align-items: center;
                        margin: 0 10px;
                        height: 35px;
                        width: 35px;
                        cursor: pointer;
                        box-shadow: inset 0 1px 4px #0000001f;
                    }
                }
                > .content-1 {
                    font-size: 13px;
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    opacity: 0.8;
                }
                > .input-container {
                    width: 100%;
                    max-width: 300px;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    background: #eee;
                    border: none;
                    padding: 0 15px;
                    margin: 20px 0 0 0;
                    border-radius: 5px;
                    height: 45px;
                    box-sizing: border-box;
                    transition: all 0.2s;
                    box-shadow: inset 0 1px 4px #0000001f;
                    &:focus-within {
                        box-shadow: inset 0 1px 4px #06f;
                    }
                    .el-input {
                        flex: 1;
                    }
                    &.code {
                        position: relative;
                        > canvas.img {
                            position: absolute;
                            right: 10px;
                            top: 50%;
                            transform: translateY(-50%);
                            border-radius: 4px;
                            box-shadow: 0 0 5px #ccc;
                            user-select: none;
                        }
                    }
                }
                > .bt-list {
                    margin: 40px 0 0 0;
                    width: 100%;
                    max-width: 300px;
                    display: flex;
                    justify-content: center;
                    > .login-bt {
                        width: 100%;
                    }
                }
                > .other {
                    margin: 15px 0 0 0;
                    font-size: 12px;
                    opacity: 0.5;
                    > a {
                        color: #666;
                    }
                }
            }
        }
    }
    > .bottom {
        position: absolute;
        bottom: 5px;
        width: 100%;
        color: #ccc;
        font-size: 13px;
        text-align: center;
        > a.bt {
            margin-left: 10px;
            vertical-align: middle;
        }
    }
}
</style>
