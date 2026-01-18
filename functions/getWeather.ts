import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
const OPENWEATHER_API = 'https://api.openweathermap.org/data/2.5';

Deno.serve(async (req) => {
  try {
    const { lat, lon, city } = await req.json();

    if (!OPENWEATHER_API_KEY) {
      return Response.json(
        { error: 'OpenWeather API key not configured' },
        { status: 500 }
      );
    }

    let coords;
    if (lat && lon) {
      coords = { lat, lon };
    } else if (city) {
      // First, get coordinates from city name
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      if (!geoData[0]) {
        return Response.json({ error: 'City not found' }, { status: 400 });
      }
      coords = { lat: geoData[0].lat, lon: geoData[0].lon };
    } else {
      return Response.json(
        { error: 'Either coordinates (lat/lon) or city name required' },
        { status: 400 }
      );
    }

    // Fetch forecast
    const forecastUrl = `${OPENWEATHER_API}/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      const errorData = await forecastResponse.text();
      console.error('OpenWeather error:', forecastResponse.status, errorData);
      return Response.json(
        { error: 'Failed to fetch weather data', details: errorData },
        { status: forecastResponse.status }
      );
    }

    const forecastData = await forecastResponse.json();

    // Group forecasts by day (get one per day at noon)
    const dailyForecasts = {};
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyForecasts[dateKey] || date.getHours() === 12) {
        dailyForecasts[dateKey] = {
          date: dateKey,
          temp: item.main.temp,
          feels_like: item.main.feels_like,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          wind_speed: item.wind.speed,
        };
      }
    });

    // Fetch historical weather for past 7 days
    const historicalForecasts = {};
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - i);
      const timestamp = Math.floor(pastDate.getTime() / 1000);
      const dateKey = pastDate.toISOString().split('T')[0];
      
      try {
        const histUrl = `${OPENWEATHER_API}/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&dt=${timestamp}&appid=${OPENWEATHER_API_KEY}`;
        const histResponse = await fetch(histUrl);
        if (histResponse.ok) {
          const histData = await histResponse.json();
          historicalForecasts[dateKey] = {
            date: dateKey,
            temp: histData.main.temp,
            feels_like: histData.main.feels_like,
            temp_min: histData.main.temp_min,
            temp_max: histData.main.temp_max,
            description: histData.weather[0].description,
            icon: histData.weather[0].icon,
            humidity: histData.main.humidity,
            wind_speed: histData.wind.speed,
          };
        }
      } catch (error) {
        console.error(`Failed to fetch historical data for ${dateKey}:`, error);
      }
    }

    // Combine historical and forecast data
    const allForecasts = { ...historicalForecasts, ...dailyForecasts };
    const forecast = Object.values(allForecasts).sort((a, b) => new Date(a.date) - new Date(b.date));

    return Response.json({
      city: forecastData.city.name,
      country: forecastData.city.country,
      forecast,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});