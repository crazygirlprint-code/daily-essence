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

    let url;
    if (lat && lon) {
      url = `${OPENWEATHER_API}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    } else if (city) {
      url = `${OPENWEATHER_API}/forecast?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    } else {
      return Response.json(
        { error: 'Either coordinates (lat/lon) or city name required' },
        { status: 400 }
      );
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenWeather error:', response.status, errorData);
      return Response.json(
        { error: 'Failed to fetch weather data', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Group forecasts by day (get one per day at noon)
    const dailyForecasts = {};
    data.list.forEach((item) => {
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

    const forecast = Object.values(dailyForecasts).slice(0, 16);

    return Response.json({
      city: data.city.name,
      country: data.city.country,
      forecast,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});