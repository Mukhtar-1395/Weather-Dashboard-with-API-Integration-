const API_KEY = 'b191725d06c308e4a343efad041322c9';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const weatherContainer = document.getElementById('weatherContainer');
const loadingSpinner = document.getElementById('loadingSpinner');

searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keypress', (e) => e.key === 'Enter' && fetchWeather());

async function fetchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name');
        return;
    }

    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please add your OpenWeatherMap API key to the script');
        return;
    }

    showLoading(true);
    hideError();
    weatherContainer.classList.add('hidden');

    try {
        const url = `${API_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            let msg = 'Failed to fetch weather';
            if (response.status === 404) msg = 'City not found';
            else if (response.status === 401) msg = 'Invalid API key (401)';
            else if (response.status === 429) msg = 'API rate limit exceeded (429)';
            else {
                try {
                    const errJson = await response.json();
                    if (errJson && errJson.message) msg = `${errJson.message} (${response.status})`;
                } catch (e) {
                    /* ignore JSON parse errors */
                }
            }
            throw new Error(msg);
        }

        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        // Show friendlier messages for common network/CORS errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            showError('Network error or blocked by CORS. Try serving the page via a local server.');
        } else {
            showError(error.message || 'An unknown error occurred');
        }
        console.error('Weather fetch error:', error);
    } finally {
        showLoading(false);
    }
}

function displayWeather(data) {
    const { name, sys, main, weather, wind, visibility, dt } = data;

    document.getElementById('cityName').textContent = `${name}, ${sys.country}`;
    document.getElementById('date').textContent = new Date(dt * 1000).toLocaleDateString();
    document.getElementById('temperature').textContent = Math.round(main.temp) + '°C';
    document.getElementById('description').textContent = weather[0].main;
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(main.feels_like)}°C`;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
    document.getElementById('humidity').textContent = main.humidity + '%';
    document.getElementById('windSpeed').textContent = wind.speed + ' m/s';
    document.getElementById('pressure').textContent = main.pressure + ' hPa';
    document.getElementById('visibility').textContent = (visibility / 1000).toFixed(1) + ' km';
    document.getElementById('minTemp').textContent = Math.round(main.temp_min) + '°C';
    document.getElementById('maxTemp').textContent = Math.round(main.temp_max) + '°C';
    document.getElementById('sunrise').textContent = new Date(sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset').textContent = new Date(sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    weatherContainer.classList.remove('hidden');
    cityInput.value = '';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

function showLoading(show) {
    loadingSpinner.classList.toggle('hidden', !show);
}
