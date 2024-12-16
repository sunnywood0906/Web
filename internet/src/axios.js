import axios from 'axios';

// 創建 Axios 實例
const apiClient = axios.create({
  baseURL: 'curl -X GET "https://data.moenv.gov.tw/api/v2/aqx_p_434?language=zh&offset=0&limit=1000&api_key=604595b4-74bf-4590-adf6-180b44e49f3d" ',
  timeout: 5000, // 請求超時設定
});

// 添加全域攔截器，統一處理錯誤
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
