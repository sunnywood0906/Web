// src/components/DisplayData/DisplayData.js
import React from 'react';
import './DisplayData.css'; // 正確的引入路徑

const DisplayData = () => {
  const savedData = JSON.parse(localStorage.getItem('formData')) || [];

  return (
    <div className="display-data">
      {savedData.length > 0 ? (
        <div>
          <h3>儲存的資料:</h3>
          {savedData.map((data, index) => (
            <div key={index}>
              <p>姓名: {data.name}</p>
              <p>截止日期: {data.date}</p>
              <p>備註: {data.message}</p>
              <hr />
            </div>
          ))}
        </div>
      ) : (
        <p>沒有儲存的資料。</p>
      )}
    </div>
  );
};

export default DisplayData;
