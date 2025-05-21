// Constants and variables
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_ICONS = {
    'Clear': 'fas fa-sun',
    'Clouds': 'fas fa-cloud',
    'Rain': 'fas fa-cloud-rain',
    'Drizzle': 'fas fa-cloud-rain',
    'Thunderstorm': 'fas fa-bolt',
    'Snow': 'fas fa-snowflake',
    'Mist': 'fas fa-smog',
    'Smoke': 'fas fa-smog',
    'Haze': 'fas fa-smog',
    'Dust': 'fas fa-smog',
    'Fog': 'fas fa-smog',
    'Sand': 'fas fa-wind',
    'Ash': 'fas fa-wind',
    'Squall': 'fas fa-wind',
    'Tornado': 'fas fa-wind'
};

// API key configuration
const API_KEY_CONFIG = {
    key: '706703ebfee7595a6de3e744f2426e39', // Placeholder yang akan diganti oleh build script
    getKey: function () {
        return this.key;
    }
};

const API_KEY = API_KEY_CONFIG.getKey();

// Rate limiting implementation
const rateLimiter = {
    calls: {},
    limit: 10,
    timeWindow: 60000, // 1 minute in milliseconds

    check: function (key) {
        const now = Date.now();
        if (!this.calls[key]) {
            this.calls[key] = {
                count: 1,
                timestamp: now
            };
            return true;
        }

        const timeElapsed = now - this.calls[key].timestamp;

        if (timeElapsed > this.timeWindow) {
            // Reset if time window has passed
            this.calls[key] = {
                count: 1,
                timestamp: now
            };
            return true;
        }

        if (this.calls[key].count >= this.limit) {
            return false; // Rate limit exceeded
        }

        this.calls[key].count++;
        return true;
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for search button
    document.getElementById('searchButton').addEventListener('click', function () {
        getWeather();
    });

    // Add event listener for Enter key in input
    document.getElementById('cityInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            getWeather();
        }
    });

    // Display initial message
    showInitialMessage();
});

// Display initial message
function showInitialMessage() {
    const weatherResult = document.getElementById('weatherResult');
    weatherResult.innerHTML = DOMPurify.sanitize(`
        <div class="initial-message">
            <i class="fas fa-cloud-sun fa-3x"></i>
            <p>Please enter a city name to see the weather forecast</p>
        </div>
    `);
}

// Input sanitization and validation
function sanitizeInput(input) {
    // First use DOMPurify for basic sanitization
    let sanitized = DOMPurify.sanitize(input);

    // Then allow only alphanumeric characters, spaces, commas, and some accented characters
    sanitized = sanitized.replace(/[^\w\s,áàâäãåçéèêëíìîïñóòôöõúùûüÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜŸÆŒ-]/gi, '');

    // Prevent potential SQL injection or script patterns
    if (/(\b(select|insert|update|delete|drop|union|exec|alter|truncate|declare)\b)|([<>])/i.test(sanitized)) {
        return '';
    }

    return sanitized;
}

// Main function to get weather based on city input
async function getWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = sanitizeInput(cityInput.value.trim());

    if (!city) {
        showError('Please enter a valid city name');
        return;
    }

    // Check rate limiting
    if (!rateLimiter.check('weatherApi')) {
        showError('Too many requests. Please try again later.');
        return;
    }

    await getWeatherByCity(city);
}

// Get weather by city name
async function getWeatherByCity(city) {
    if (!city || city.trim() === '') {
        showError('City name cannot be empty');
        return;
    }

    console.log('Searching weather for city:', city);

    const loading = document.getElementById('loading');
    const weatherResult = document.getElementById('weatherResult');
    const weatherDetails = document.getElementById('weatherDetails');
    const forecast = document.getElementById('forecast');

    loading.style.display = 'block';
    weatherResult.innerHTML = '';
    weatherDetails.innerHTML = '';
    forecast.innerHTML = '';

    try {
        // Get current weather data
        const currentWeatherURL = `${WEATHER_API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const currentWeatherResponse = await fetchWithTimeout(currentWeatherURL);
        const currentWeatherData = await currentWeatherResponse.json();

        if (!currentWeatherResponse.ok) {
            throw new Error(currentWeatherData.message || 'City not found');
        }

        // Get coordinates from current weather response for forecast
        const { lat, lon } = currentWeatherData.coord;

        // Get 5-day forecast
        const forecastURL = `${WEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastResponse = await fetchWithTimeout(forecastURL);
        const forecastData = await forecastResponse.json();

        // Get air quality data
        const airQualityURL = `${WEATHER_API_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const airQualityResponse = await fetchWithTimeout(airQualityURL);
        const airQualityData = await airQualityResponse.json();

        // Display data
        displayCurrentWeather(currentWeatherData);
        displayWeatherDetails(currentWeatherData, airQualityData);
        displayForecast(forecastData);

        // Save last search to localStorage
        saveLastSearch(city);

    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
    } finally {
        loading.style.display = 'none';
    }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
    const loading = document.getElementById('loading');
    const weatherResult = document.getElementById('weatherResult');
    const weatherDetails = document.getElementById('weatherDetails');
    const forecast = document.getElementById('forecast');

    loading.style.display = 'block';
    weatherResult.innerHTML = '';
    weatherDetails.innerHTML = '';
    forecast.innerHTML = '';

    try {
        // Get current weather data by coordinates
        const currentWeatherURL = `${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const currentWeatherResponse = await fetchWithTimeout(currentWeatherURL);
        const currentWeatherData = await currentWeatherResponse.json();

        if (!currentWeatherResponse.ok) {
            throw new Error(currentWeatherData.message || 'Failed to get location data');
        }

        // Get 5-day forecast
        const forecastURL = `${WEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastResponse = await fetchWithTimeout(forecastURL);
        const forecastData = await forecastResponse.json();

        // Get air quality data
        const airQualityURL = `${WEATHER_API_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const airQualityResponse = await fetchWithTimeout(airQualityURL);
        const airQualityData = await airQualityResponse.json();

        // Update city input with found city name
        document.getElementById('cityInput').value = currentWeatherData.name;

        // Display data
        displayCurrentWeather(currentWeatherData);
        displayWeatherDetails(currentWeatherData, airQualityData);
        displayForecast(forecastData);

    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
    } finally {
        loading.style.display = 'none';
    }
}

// Handle geolocation error
function handleGeolocationError(error) {
    console.warn('Geolocation error:', error);
    let errorMessage = '';

    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        case error.UNKNOWN_ERROR:
            errorMessage = 'An error occurred while getting location.';
            break;
    }

    console.warn(errorMessage);
}

// Fetch with timeout to prevent hanging requests
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    try {
        console.log('Fetching:', url);
        // Remove API key from log for security
        const logUrl = url.replace(/appid=([^&]*)/, 'appid=***');
        console.log('Fetching:', logUrl);

        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), timeout)
            )
        ]);
    } catch (error) {
        console.error('Fetch error:', error);
        throw new Error(`Failed to connect to server: ${error.message}`);
    }
}

// Display current weather
function displayCurrentWeather(data) {
    const weatherResult = document.getElementById('weatherResult');
    const weatherIcon = WEATHER_ICONS[data.weather[0].main] || 'fas fa-cloud';

    const localTime = new Date(Date.now() + (data.timezone * 1000));
    const formattedTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(localTime);

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(localTime);

    weatherResult.innerHTML = DOMPurify.sanitize(`
        <div class="current-weather">
            <h2>${data.name}, ${data.sys.country}</h2>
            <p class="date-time">${formattedDate} | ${formattedTime}</p>
            <div class="weather-main">
                <i class="${weatherIcon} weather-icon-large"></i>
                <div class="temp-container">
                    <span class="temperature">${Math.round(data.main.temp)}°C</span>
                    <span class="feels-like">Feels like: ${Math.round(data.main.feels_like)}°C</span>
                </div>
            </div>
            <p class="description">${data.weather[0].description}</p>
        </div>
    `);
}

// Display weather details and air quality
function displayWeatherDetails(data, airQualityData) {
    const weatherDetails = document.getElementById('weatherDetails');

    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    let airQualityText = 'Not available';
    if (airQualityData && airQualityData.list && airQualityData.list.length > 0) {
        const aqi = airQualityData.list[0].main.aqi;
        const aqiMap = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
        airQualityText = aqiMap[aqi - 1] || 'Unknown';
    }

    const windDirection = getWindDirection(data.wind.deg);

    weatherDetails.innerHTML = DOMPurify.sanitize(`
        <h3>Weather Details</h3>
        <div class="weather-details-grid">
            <div class="weather-card">
                <i class="fas fa-thermometer-half weather-icon"></i>
                <div>
                    <span>Temperature</span>
                    <p>Min: ${Math.round(data.main.temp_min)}°C | Max: ${Math.round(data.main.temp_max)}°C</p>
                </div>
            </div>
            <div class="weather-card">
                <i class="fas fa-tint weather-icon"></i>
                <div>
                    <span>Humidity</span>
                    <p>${data.main.humidity}%</p>
                </div>
            </div>
            <div class="weather-card">
                <i class="fas fa-wind weather-icon"></i>
                <div>
                    <span>Wind</span>
                    <p>${(data.wind.speed * 3.6).toFixed(1)} km/h (${windDirection})</p>
                </div>
            </div>
            <div class="weather-card">
                <i class="fas fa-compress-alt weather-icon"></i>
                <div>
                    <span>Pressure</span>
                    <p>${data.main.pressure} hPa</p>
                </div>
            </div>
            <div class="weather-card">
                <i class="fas fa-eye weather-icon"></i>
                <div>
                    <span>Visibility</span>
                    <p>${(data.visibility / 1000).toFixed(1)} km</p>
                </div>
            </div>
            <div class="weather-card">
                <i class="fas fa-sun weather-icon"></i>
                <div>
                    <span>Sunrise/Sunset</span>
                    <p>↑ ${formatTime(sunrise)} | ↓ ${formatTime(sunset)}</p>
                </div>
            </div>
            <div class="weather-card">
                <i class="fas fa-lungs weather-icon"></i>
                <div>
                    <span>Air Quality</span>
                    <p>${airQualityText}</p>
                </div>
            </div>
        </div>
    `);
}

// Get wind direction from degrees
function getWindDirection(degrees) {
    const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

// Display 5-day forecast
function displayForecast(data) {
    const forecast = document.getElementById('forecast');

    forecast.innerHTML = DOMPurify.sanitize('<h3>5-Day Forecast</h3>');

    const dailyForecasts = {};

    // Group forecasts by day
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });

        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temps: [],
                icons: [],
                descriptions: []
            };
        }

        dailyForecasts[day].temps.push(item.main.temp);
        dailyForecasts[day].icons.push(item.weather[0].main);
        dailyForecasts[day].descriptions.push(item.weather[0].description);
    });

    // Create elements for each day
    for (const [day, data] of Object.entries(dailyForecasts)) {
        const avgTemp = data.temps.reduce((sum, temp) => sum + temp, 0) / data.temps.length;
        const mostFrequentIcon = getMostFrequent(data.icons);
        const mostFrequentDescription = getMostFrequent(data.descriptions);
        const iconClass = WEATHER_ICONS[mostFrequentIcon] || 'fas fa-cloud';

        const forecastCard = document.createElement('div');
        forecastCard.className = 'weather-card';
        forecastCard.innerHTML = DOMPurify.sanitize(`
            <i class="${iconClass} weather-icon"></i>
            <div class="forecast-info">
                <span>${day}</span>
                <p>${mostFrequentDescription}</p>
            </div>
            <span class="temp-badge">${Math.round(avgTemp)}°C</span>
        `);

        forecast.appendChild(forecastCard);
    }
}

// Get most frequent item in array
function getMostFrequent(arr) {
    const counts = {};
    let maxItem = arr[0];
    let maxCount = 1;

    for (const item of arr) {
        counts[item] = (counts[item] || 0) + 1;
        if (counts[item] > maxCount) {
            maxCount = counts[item];
            maxItem = item;
        }
    }

    return maxItem;
}

// Show error message
function showError(message) {
    const weatherResult = document.getElementById('weatherResult');
    weatherResult.innerHTML = DOMPurify.sanitize(`
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `);
}

// Save last search
function saveLastSearch(city) {
    try {
        localStorage.setItem('lastSearchCity', city);
    } catch (e) {
        console.warn('LocalStorage not available:', e);
    }
}

// Get last search
function getLastSearch() {
    try {
        return localStorage.getItem('lastSearchCity');
    } catch (e) {
        console.warn('LocalStorage not available:', e);
        return null;
    }
}
