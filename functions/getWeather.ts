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

    // Only return forecast data (5-day forecast available)
    const forecast = Object.values(dailyForecasts).slice(0, 16);

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