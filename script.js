async function getWeather() {
    const city = document.getElementById('cityInput').value;
    const apiKey = '706703ebfee7595a6de3e744f2426e39';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const loading = document.getElementById('loading');
    const weatherResult = document.getElementById('weatherResult');

    loading.style.display = 'block'; 
    weatherResult.innerHTML = ''; 

    console.log(`Fetching weather data from URL: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data); 
        if (!response.ok) {
            throw new Error(data.message || 'City not found');
        }
        displayWeather(data);
    } catch (error) {
        alert(error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function displayWeather(data) {
    const weatherResult = document.getElementById('weatherResult');
    weatherResult.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Weather: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}
