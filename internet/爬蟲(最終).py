
import requests  # 引入 requests 模組用於發送 HTTP 請求
import os  # 引入 os 模組用於操作文件路徑
from datetime import datetime  # 從 datetime 模組中引入 datetime 類別
from openpyxl import Workbook  # 引入 openpyxl 中的 Workbook
import keyboard  # 引入 keyboard 模組
import ctypes  # 引入 ctypes 模組用於調用 Windows API

# 取得桌面路徑的函數
def get_desktop_path():
    if os.name != 'nt':  # 確保程式運行在 Windows 系統中
        raise EnvironmentError("此程式僅支持 Windows 系統")
    user32 = ctypes.windll.shell32  # 使用 ctypes 模組調用 shell32.dll 中的函數
    buf = ctypes.create_unicode_buffer(ctypes.wintypes.MAX_PATH)  # 創建 Unicode 緩衝區來保存路徑
    user32.SHGetFolderPathW(None, 0x0000, None, 0, buf)  # 使用 Windows API 取得桌面路徑
    return buf.value  # 返回桌面路徑字串

# 定義取得空氣品質資料的函數
def get_aqi_data():
    url = 'https://data.moenv.gov.tw/api/v2/aqx_p_432?language=zh&offset=0&limit=1000&county=臺北市&api_key=604595b4-74bf-4590-adf6-180b44e49f3d'  # API 網址
    
    try:
        data = requests.get(url)  # 發送 HTTP GET 請求取得資料
        data.raise_for_status()  # 如果請求錯誤則觸發異常
        return data.json()  # 將取得的資料以 JSON 格式回傳
    except requests.exceptions.RequestException as e:
        print(f"請求錯誤: {e}")
        return {}

# 定義格式化時間的函數
def format_time(publish_time):
    try:
        return datetime.strptime(publish_time, '%Y/%m/%d %H:%M:%S').strftime('%Y-%m-%d %H-%M-%S')  # 將時間字串轉換為指定格式
    except ValueError:
        return '格式化失敗'

# 定義判斷空氣品質的函數
def determine_HowDoWeDo(air_quality):
    if air_quality:
        if air_quality == '良好':
            return '一般民眾活動建議:正常戶外活動。 敏感性族群活動建議:正常戶外活動。'
        elif air_quality == '普通':
            return '一般民眾活動建議:正常戶外活動。 敏感性族群活動建議:極特殊敏感族群建議注意可能產生的咳嗽或呼吸急促症狀，但仍可正常戶外活動。'
        elif air_quality == '對敏感族群不健康':
            return '一般民眾活動建議:減少戶外活動。 敏感性族群活動建議:應避免戶外活動，必要外出應配戴口罩等防護用具。'
        elif air_quality == '對所有族群不健康':
            return '一般民眾活動建議:減少戶外活動，敏感族群活動建議:應留在室內並減少體力消耗。'
        elif air_quality == '非常不健康':
            return '一般民眾活動建議:減少戶外活動。 敏感性族群活動建議:留在室內減少體力消耗活動。'
        else:
            return '無資料'
    return '無資料'

# 定義寫入 Excel 的函數
def write_excel(data_json, desktop_path):
    wb = Workbook()  # 建立新的 Workbook
    ws = wb.active  # 取得活頁簿的活動工作表
    if not data_json:
        print("無資料可寫入 Excel")
        return
    publish_time = data_json['records'][0]['publishtime']  # 取得最新資料的發佈時間
    formatted_time = format_time(publish_time)  # 格式化時間
    filename = 'excel-aqi-時間_' + formatted_time.replace(':', '-') + '.xlsx'  # 替換冒號為底線或其他合法字符
    ws.append(['測量時間:', formatted_time])  # 寫入測量時間
    header = ['縣市', '測站名稱', '臭氧(O3)8 小時移動平均(ppb)', '二氧化硫(SO2)小時濃度值(ppb)', '一氧化碳(CO)8 小時移動平均(ppm)', '懸浮微粒(PM10)小時移動平均(μg/m3)', '細懸浮微粒(PM2.5)小時移動平均(μg/m3)', '空氣品質判斷', 'AQI', '應該怎麼做']
    ws.append(header)  # 寫入表頭
    data_dict = {}
    for record in data_json['records']:
        county = record['county']
        if county not in data_dict:
            data_dict[county] = []
        data_dict[county].append(record)
    for county, records in data_dict.items():
        for record in records:
            row_data = [county, record['sitename'], record.get('o3_8hr', '-1'), record.get('so2', '-1'), record.get('co_8hr', '-1'), record.get('pm10_avg', '-1'), record.get('pm2.5_avg', '-1'), record.get('status', '未提供'), record.get('aqi', '未提供')]
            how_do_we_do = determine_HowDoWeDo(record.get('status', '未提供'))  # 判斷空氣品質應該怎麼做
            row_data.append(how_do_we_do)  # 將應該怎麼做的結果加入到資料列表中
            ws.append(row_data)  # 寫入資料到 Excel 工作表中
    if not os.path.exists(desktop_path):  # 如果桌面目錄不存在
        os.makedirs(desktop_path)  # 創建桌面目錄
    wb.save(os.path.join(desktop_path, filename))  # 儲存 Excel 檔案到桌面目錄中

# 更新資料的函數
def update_data_job(desktop_path):
    data_json = get_aqi_data()  # 取得空氣品質資料
    write_excel(data_json, desktop_path)  # 將資料寫入 Excel

# 取得桌面路徑
desktop_path = get_desktop_path()

# 設定當前工作目錄
os.chdir(desktop_path)

# 印出提示訊息
print("現在開始執行程式，隨時更新 AQI，如果按下 'esc' 鍵則停止程式")

# 執行一次更新
update_data_job(desktop_path)

# 持續更新直到按下 'esc' 鍵
keyboard.wait('esc')

# 停止程式並印出提示訊息
print("您停止了程式，感謝使用")
