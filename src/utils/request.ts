import axios from "axios";
import autolog from 'autolog.js';


const service = axios.create({
  baseURL: "https://api.coze.cn/open_api/v2",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    'Authorization': `Bearer ${import.meta.env.VITE_COZE_TOKEN}`
  },
});
service.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    autolog.log('请求错误', 'error');
    return Promise.reject(error);
  }
);
const getAnswer = async (question: string) => {
  const res = await service.post("/chat", {
    query: question,
    user: "githubPages",
    bot_id: "7413640476366602275",
    stream: false
  });
  return res.data;
}
export default getAnswer;