import { useState, useEffect } from 'react';
import Axios from 'axios';
import { Oval } from 'react-loader-spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import { RiUserLocationFill } from 'react-icons/ri';
import './App.css';
import QRCode from 'react-qr-code'; // QRCode ネΘ

function App() {
    // ぱ闽 state
    const [input, setInput] = useState('');
    const [weather, setWeather] = useState({ loading: false, data: {}, error: false });

    // IP 闽 state
    const [ipDetails, setIpDetails] = useState([]);
    const [lat, setLat] = useState(22.5726);
    const [lon, setLon] = useState(88.3832);

    // QR Code ネΘ state
    const [qrData, setQrData] = useState('');

    // ら戳Α
    const toDateFunction = () => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const WeekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDate = new Date();
        return `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
    };

    // 琩高ぱ
    const searchWeather = async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setWeather({ ...weather, loading: true });
            const url = 'https://api.openweathermap.org/data/2.5/weather';
            const api_key = 'f00c38e0279b7bc85480c3fe775d518c';
            await Axios.get(url, {
                params: {
                    q: input,
                    units: 'metric',
                    appid: api_key,
                },
            })
                .then((res) => {
                    setWeather({ data: res.data, loading: false, error: false });
                    setQrData(`Weather in ${input}: ${res.data.weather[0].description}, Temp: ${Math.round(res.data.main.temp)}C`);
                })
                .catch((error) => {
                    setWeather({ ...weather, data: {}, error: true });
                    setInput('');
                });
        }
    };

    // 琩高 IP 
    useEffect(() => {
        Axios.get('https://ipapi.co/json/').then((res) => {
            setIpDetails(res.data);
            setLat(res.data.latitude);
            setLon(res.data.longitude);
        });
    }, []);

    return (
        <div className="App">
            <h1 className="app-name">Weather, QR Code & IP Finder</h1>
            {/* IP 琩高陪ボ */}
            <div className="ip-info">
                <h4>IP Address: {ipDetails.ip}</h4>
                <h4>Location: {ipDetails.city}, {ipDetails.region}, {ipDetails.country_name}</h4>
                <div className="map">
                    <RiUserLocationFill size="25px" color="blue" />
                    <p>Latitude: {lat}, Longitude: {lon}</p>
                </div>
            </div>

            {/* ぱ琩高 */}
            <div className="search-bar">
                <input
                    type="text"
                    className="city-search"
                    placeholder="Enter City Name"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={searchWeather}
                />
            </div>

            {weather.loading && <Oval type="Oval" color="black" height={100} width={100} />}
            {weather.error && (
                <div className="error-message">
                    <FontAwesomeIcon icon={faFrown} />
                    <span>City not found</span>
                </div>
            )}
            {weather.data && weather.data.main && (
                <div>
                    <h2>{weather.data.name}, {weather.data.sys.country}</h2>
                    <p>{toDateFunction()}</p>
                    <div className="icon-temp">
                        <img
                            src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
                            alt={weather.data.weather[0].description}
                        />
                        {Math.round(weather.data.main.temp)}C
                    </div>
                    <p>{weather.data.weather[0].description}</p>
                    <p>Wind Speed: {weather.data.wind.speed}m/s</p>
                </div>
            )}

            {/* QR Code ネΘ */}
            {qrData && (
                <div className="qr-code">
                    <h3>Generated QR Code</h3>
                    <QRCode value={qrData} size={256} />
                </div>
            )}
        </div>
    );
}

export default App;
