// src/components/DataInputForm/DataInputForm.js
import React, { useState, useEffect } from 'react'; // 確保引入 useState 和 useEffect
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './DataInputForm.css';

const DataInputForm = () => {
  // 定義表單數據的狀態
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    message: '',
  });

  // 定義已提交數據的狀態
  const [submittedData, setSubmittedData] = useState([]);

  // 讀取 localStorage 中的已提交數據
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('submittedData')) || [];
    setSubmittedData(data);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 處理提交功能
  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = [...submittedData, formData];
    localStorage.setItem('submittedData', JSON.stringify(updatedData));
    setSubmittedData(updatedData);

    // 清空表單數據
    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };

  // 處理下載 Excel 功能
  const handleDownload = () => {
    const dataToExport = submittedData.length > 0 ? submittedData : [formData];
    // 定義標題和次目
    const headers = [['作業名稱', '截止日期', '備註']];
    
    // 創建一個不包含電子郵件的數據陣列
    const dataWithHeaders = [
      ...headers,
      ...dataToExport.map(item => [item.name, item.date, item.message])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders); // 使用 aoa_to_sheet 生成工作表
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'form_data.xlsx');
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <div className="mb-3">
          <label className="form-label">作業名稱:</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">截止日期:(ex:2024-10-15)</label>
          <input
            type="text"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">備註:</label>
          <textarea
            name="message"
            className="form-control"
            value={formData.message}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">提交</button>
        <button type="button" className="btn btn-secondary" onClick={handleDownload}>
          下載 Excel
        </button>
      </form>
    </div>
  );
};

export default DataInputForm;
