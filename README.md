# Weather Forecast App

![Weather App](https://img.shields.io/badge/Weather-Forecast-1b9ae3)
![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen)

A modern, secure, and user-friendly weather application that provides real-time weather data and forecasts for locations worldwide.

## Features

- **Current Weather Data**: Get up-to-date information about current weather conditions including temperature, humidity, wind speed, and atmospheric pressure.
- **5-Day Weather Forecast**: Plan ahead with a 5-day weather forecast showing temperature trends and weather conditions.
- **Air Quality Information**: Access air quality data for the searched location.
- **Responsive Design**: Optimized for both desktop and mobile devices with a clean, intuitive interface.
- **Location Search**: Search for weather by city name across the globe.
- **Security Features**: Implemented with strong security measures including input sanitization, Content Security Policy, and rate limiting.
- **Modern UI**: Beautiful user interface with smooth animations and weather-appropriate icons.

## Technologies Used

- HTML5
- CSS3 with CSS Variables for theming
- Vanilla JavaScript (ES6+)
- OpenWeatherMap API for weather data
- DOMPurify for sanitizing user input
- Font Awesome icons

## Security Features

- Content Security Policy (CSP) implementation
- Input validation and sanitization
- XSS protection with DOMPurify
- Rate limiting for API requests
- Secure connection enforcement
- Various HTTP security headers

## API Integration

The application uses the OpenWeatherMap API to fetch:
- Current weather data
- 5-day forecasts
- Air quality information

## Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/AnnisaCode/weatherapp.git
cd weather-app
```

2. Install dependencies:
```bash
npm install
```

3. Create an OpenWeatherMap API key at [OpenWeatherMap](https://openweathermap.org/api) and add it to the configuration.

4. Start the development server:
```bash
npm start
```

## Usage

1. Enter a city name in the search box
2. Click the search button or press Enter
3. View the current weather conditions, forecast, and additional details

## Project Structure

```
weather-app/
├── index.html          # Main HTML structure
├── styles.css          # Styling and animations
├── script.js           # Application logic and API integration
├── purify.min.js       # DOMPurify for input sanitization
├── package.json        # Project configuration and dependencies
└── vercel.json         # Deployment configuration for Vercel
```

## Performance Optimization

- Minimal dependencies for faster loading
- Efficient DOM manipulation
- Lazy loading of resources
- Optimized API calls with rate limiting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Author

- AnnisaCode

## License

- Private - Unauthorized copying or distribution is prohibited

---

Data provided by [OpenWeatherMap](https://openweathermap.org/) &copy; 2025 AnnisaCode 