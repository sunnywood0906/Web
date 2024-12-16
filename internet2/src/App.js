import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 改為小寫
import * as XLSX from 'xlsx'; // 引入 xlsx 套件
import './App.css';

const AirQualitySearch = () => {
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [siteName, setSiteName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const stationToSiteIdMap = {
    '士林': 11,
    '大同': 16,
    '中山': 12,
    '古亭': 14,
    '松山': 15,
    '陽明': 64,
    '萬華': 13,
  };

  const getAQIDescription = (aqi) => {
    if (aqi >= 0 && aqi <= 50) return '空氣品質良好';
    if (aqi >= 51 && aqi <= 100) return '空氣品質普通';
    if (aqi >= 101 && aqi <= 150) return '對敏感族群不健康';
    if (aqi >= 151 && aqi <= 200) return '對所有族群不健康';
    if (aqi >= 201 && aqi <= 300) return '非常不健康';
    if (aqi > 300) return '危害';
    return '資料有誤';
  };

  const handleSearch = () => {
    if (!region || !city || !siteName) {
      setError('請完整選擇空品區、縣市及測站名稱');
      setData(null);
      setSearchTriggered(false);
    } else {
      setSearchTriggered(true);
      setError('');
    }
  };

  useEffect(() => {
    const fetchStationData = async () => {
      if (!siteName || !searchTriggered) return;

      setLoading(true);
      setError('');
      setData(null);

      try {
        const siteId = stationToSiteIdMap[siteName];
        if (!siteId) {
          setError('無法找到對應的 SiteID');
          setLoading(false);
          return;
        }

        const url = 'https://data.moenv.gov.tw/api/v2/aqx_p_434';
        const apiKey = 'c1193490-c4b3-4ab2-8a16-605b8ad25618';
        const response = await axios.get(url, {
          params: {
            api_key: apiKey,
            format: 'json',
            limit: 1000,
          },
        });

        const filteredData = response.data.records.find(record => parseInt(record.siteid) === siteId);

        if (filteredData) {
          setData(filteredData);
        } else {
          setError('找不到相關資料，請確認測站名稱或稍後再試');
        }
      } catch (err) {
        console.error('API 請求失敗:', err);
        setError('無法取得資料，請檢查網路連線或稍後再試');
      } finally {
        setLoading(false);
      }
    };

    if (searchTriggered) {
      fetchStationData();
    }
  }, [siteName, searchTriggered]);

  // 將資料轉換為 Excel 並下載
  const handleDownload = () => {
    if (!data) {
      alert('沒有資料可以下載');
      return;
    }

    const ws = XLSX.utils.json_to_sheet([data]); // 將資料轉換為工作表
    const wb = XLSX.utils.book_new(); // 新建工作簿
    XLSX.utils.book_append_sheet(wb, ws, '空氣品質資料'); // 添加工作表

    // 下載 Excel 文件
    XLSX.writeFile(wb, `${data.sitename}_air_quality.xlsx`);
  };

  return (
    <div className="container">
      <div className="content">
        <h2>搜尋台北地區空氣品質</h2>

        {/* 選單 */}
        <div>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">選擇空品區</option>
            <option value="北部空品區">北部空品區</option>
          </select>

          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">選擇縣市</option>
            <option value="台北市">台北市</option>
          </select>

          <select value={siteName} onChange={(e) => setSiteName(e.target.value)}>
            <option value="">選擇測站名稱</option>
            <option value="士林">士林</option>
            <option value="大同">大同</option>
            <option value="中山">中山</option>
            <option value="古亭">古亭</option>
            <option value="松山">松山</option>
            <option value="陽明">陽明</option>
            <option value="萬華">萬華</option>
          </select>
        </div>

        {/* 搜尋按鈕 */}
        <button onClick={handleSearch} style={{ marginTop: '10px' }}>
          搜尋
        </button>

        {/* 資料顯示 */}
        {loading && <p>資料載入中...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && (
          <div style={{ marginTop: '20px' }}>
            <h3>{data.sitename} 的資料</h3>
            <p>空氣品質指數 (AQI): {data.aqi} ({getAQIDescription(data.aqi)})</p>
            <p>二氧化硫 (so2): {data.so2subindex}</p>
            <p>一氧化碳 (co): {data.cosubindex}</p>
            <p>臭氧 (o3): {data.o3subindex}</p>
            <p>pm10 : {data.pm10subindex}</p>
            <p>二氧化氮 (no2): {data.no2subindex}</p>
            <p>pm25 : {data.pm25subindex}</p>
            <p>資料更新時間: {data.monitordate}</p>

            {/* 下載按鈕 */}
            <button onClick={handleDownload} style={{ marginTop: '20px' }}>
              下載 Excel
            </button>
          </div>
        )}

        {/* 資料來源區域 */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
          <h3>資料參考&圖片來源</h3>
          <p>所有資料來自於環境部提供的開放資料平台：<a href="https://www.epa.gov.tw" target="_blank" rel="noopener noreferrer">環境部網站</a></p>
        </div>

        {/* 聯絡我們區域 */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
          <h3>關於我們：</h3>
          <p>臺灣師範大學科技應用與人力資源發展學系大二 王玟晽</p>
          <p>電子郵件：41271205h@gapps.ntnu.edu.tw</p>
          <p>臺灣師範大學科技應用與人力資源發展學系大二 吳堉安</p>
          <p>電子郵件：41371901h@gapps.ntnu.edu.tw</p>
        </div>

        <div className="aqi-info">
          <img
            src="https://drive.google.com/thumbnail?id=10RhnMonGJrIcq-B38t0Ea4SVn8ZHyjlb&sz=w2500"
            alt="空氣品質指標圖"
            className="aqi-image"
            style={{ width: '100%', height: 'auto', maxWidth: '800px', maxHeight: '800px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default AirQualitySearch;

