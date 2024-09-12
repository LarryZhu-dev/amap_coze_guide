<script setup lang="ts">
import AMapLoader from '@amap/amap-jsapi-loader';
import { ref, onMounted } from 'vue'
import getAnswer from '../utils/request.ts';
import { ElButton, ElInput, ElScrollbar, ElIcon } from 'element-plus'
import { Search, User, ChatRound } from '@element-plus/icons-vue'

onMounted(async () => {
  await initAMap()
})

let AMap: any
let map: any
let loca: any
let pl: any

const question = ref('')
const loading = ref(false)
const conversations = ref<{ type: string; content: string }[]>([])

async function initAMap() {
  window._AMapSecurityConfig = {
    securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
  };
  AMap = await AMapLoader.load({
    key: import.meta.env.VITE_AMAP_KEY, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.GeoJSON", "AMap.PlaceSearch", "InfoWindow"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
    Loca: {                // 是否加载 Loca， 缺省不加载
      "version": '2.0.0'  // Loca 版本，缺省 1.3.2
    },
  })
  map = new AMap.Map("Amap", {
    center: [116.397428, 39.90923],
    zoom: 5,
    viewMode: '3D',
  });
  initLoca()
}
async function initLoca() {
  // @ts-ignore
  loca = new Loca.Container({
    map,
  })
  console.log('loca::: ', loca);
}
async function getAnswerFromCoze() {
  if (!question.value) {
    return
  }
  loading.value = true
  conversations.value.push({
    type: 'question',
    content: question.value
  })
  let question_backup = question.value
  question.value = ''
  conversations.value.push({
    type: 'answer',
    content: "正在为您查找..."
  })
  let res = await getAnswer(question_backup)
  loading.value = false
  let answer = JSON.parse(res.messages[0].content)
  endPoint.value = toNumber(answer.lnglat)
  conversations.value[conversations.value.length - 1].content = answer.description
  loca.animate.start();
  animate()
}
const endPoint = ref([])
function animate() {
  let end = endPoint.value
  var speed = 1;
  // 镜头动画

  loca.viewControl.addAnimates(
    [{
      pitch: {
        value: 0,
        control: [[0, 20], [1, 0]],
        timing: [0, 0, 0.8, 1],
        duration: 3000 / speed,
      },
    }]
    , function () {

      loca.viewControl.addAnimates([
        // 寻迹
        {
          zoom: {
            value: 16,
            control: [[map.getZoom(), 3], [map.getZoom(), 15]],
            timing: [0.3, 0, 0.9, 1],
            duration: 5000 / speed,
          },
          center: {
            value: map.getCenter(),
            control: [map.getCenter(), end],
            timing: [0.3, 0, 0.1, 1],
            duration: 8000 / speed,
          },
        }, {
          // 环绕
          pitch: {
            value: 50,
            control: [[0, 40], [1, 50]],
            timing: [0.3, 0, 1, 1],
            duration: 7000 / speed,
          },
          rotation: {
            value: 260,
            control: [[0, -80], [1, 260]],
            timing: [0, 0, 0.7, 1],
            duration: 7000 / speed,
          },
          zoom: {
            value: 17,
            control: [[0.3, 16], [1, 17]],
            timing: [0.3, 0, 0.9, 1],
            duration: 5000 / speed,
          },
        },
      ],
        function () {
          setTimeout(animate, 2000);
          console.log('结束');
        });
    });
}



// 递归的将多维数组内的字符串转为数字
function toNumber(arr: any) {
  return arr.map((item: any) => {
    if (Array.isArray(item)) {
      return toNumber(item)
    } else {
      return Number(item)
    }
  })
}

</script>

<template>
  <div id="Amap"></div>
  <div class="optionsMenu">
    <span class="title">Coze + 高德 智能导游</span>
    <div class="optionsBody">
      <div class="optionItem">
        <div class="conversations">
          <el-scrollbar height="100%">
            <div class="contentItem" v-for="item in conversations">
              <div>
                <span v-if="item.type === 'question'">
                  <el-icon size="26"
                    style="color: #fff; cursor: pointer; background: #646cff;padding: 4px;border-radius: 100px;">
                    <User />
                  </el-icon>
                </span>
                <span v-if="item.type === 'answer'">
                  <el-icon size="26"
                    style="color: #fff; cursor: pointer; background: #f79e43;padding: 4px;border-radius: 100px;">
                    <ChatRound />
                  </el-icon>
                </span>
                {{ item.content }}
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div class="submit">
        <el-input v-model="question" placeholder="想去哪？问一下AI导游" clearable></el-input>
        <el-button type="primary" :icon="Search" @click="getAnswerFromCoze" :loading="loading">发送</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.read-the-docs {
  color: #888;
}

#Amap {
  width: 100%;
  height: 100%;
}

#result {
  position: fixed;
  top: 10px;
  right: 10px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.optionsMenu {
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 10px;
  left: 10px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: #666;
  padding: 16px;
  width: 300px;
  height: calc(100% - 20px);

  .optionsBody {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 18px;
    width: 100%;
    height: 100%;

    .submit {
      display: flex;
      justify-content: center;
      position: absolute;
      bottom: 20px;
      background: #fff;
    }
  }

  .optionItem {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    max-width: 100%;
    max-height: 90%;
    .contentItem{
      padding: 10px 0;
      >div{
        display: flex;
        gap: 10px;
      }
    }
  }

  .title {
    display: inline-flex;
    align-items: center;
    font-size: 16px;
    position: relative;
    padding-left: 10px;
    margin-bottom: 18px;
    line-height: 16px;

    &:after {
      content: "";
      display: block;
      height: 100%;
      width: 2px;
      background: #0085fe;
      position: absolute;
      left: 0;
    }
  }
}
</style>
<style>
.amap-content-body {
  color: #000;
}
</style>