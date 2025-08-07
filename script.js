const apiKey = '25b336faa8a5a2be147de427cc4c2e4e';

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeather(cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

async function getWeather(city) {
    weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;
        
    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(apiUrl),
            fetch(forecastUrl)
        ]);
        if (!currentRes.ok || !forecastRes.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }
        const currentResData = await currentRes.json();
        const forecastData = await forecastRes.json();

        // ✅ บันทึกเมืองล่าสุดลง localStorage
        localStorage.setItem('lastSearchedCity', city);

        displayWeather(currentResData);
        displayForecast(forecastData);
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];

    const weatherHtml = `
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
        <hr>
        <h3>พยากรณ์ 5 วัน</h3>
        <div id="forecast-container" class="forecast-grid"></div>
    `;
    weatherInfoContainer.innerHTML = weatherHtml;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');

    const dailyData = {};

    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
            dailyData[date] = [];
        }
        dailyData[date].push(item);
    });

    let count = 0;
    for (let date in dailyData) {
        if (count >= 5) break;

        // หาข้อมูลช่วงเที่ยงของแต่ละวัน
        const midday = dailyData[date].find(item => item.dt_txt.includes("12:00:00")) || dailyData[date][0];
        const { main, weather } = midday;
        const temp = main.temp;
        const icon = weather[0].icon;
        const desc = weather[0].description;

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <h4>${formatDate(date)}</h4>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
            <p>${desc}</p>
            <p>${temp.toFixed(1)}°C</p>
        `;
        forecastContainer.appendChild(card);
        count++;
    }
}

function formatDate(dateString) {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', options);
}
document.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
        cityInput.value = lastCity; // แสดงในช่อง input ด้วย (ไม่บังคับ)
        getWeather(lastCity);
    }
});
