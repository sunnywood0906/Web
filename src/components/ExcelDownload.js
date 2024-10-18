// src/components/ExcelDownload.js
import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ExcelDownload = () => {
  // 假設這是您想要導出的數據
  const data = [
    { Name: 'John Doe', Email: 'john@example.com', Age: 28 },
    { Name: 'Jane Smith', Email: 'jane@example.com', Age: 32 },
  ];

  const exportToExcel = () => {
    // 將數據轉換為工作表
    const worksheet = XLSX.utils.json_to_sheet(data);
    // 創建一本新的工作簿
    const workbook = XLSX.utils.book_new();
    // 將工作表附加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    // 將工作簿轉換為 Excel 檔案
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    // 使用 file-saver 下載檔案
    saveAs(blob, 'data.xlsx');
  };

  return (
    <div>
      <h2>導出 Excel</h2>
      <button onClick={exportToExcel}>下載 Excel</button>
    </div>
  );
};

export default ExcelDownload;
