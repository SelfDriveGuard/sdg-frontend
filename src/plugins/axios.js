import axios from 'axios';

export const baseUrl = `http://localhost:3333`;

// axios的实例及拦截器配置
const http = axios.create({
    baseURL: baseUrl,
    contentType: 'application/json',
    withCredentials: true,
});

http.interceptors.response.use(
    res => res.data,
    err => {
        console.log(err, "网络错误");
    }
);

export default http;
