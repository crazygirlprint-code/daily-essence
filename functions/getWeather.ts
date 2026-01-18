import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Map WMO weather codes to OpenWeather-like icons
const getWeatherIcon = (code) => {
  if (code === 0) return '01d'; // Clear sky
  if (code === 1 || code === 2) return '02d'; // Mainly clear/Partly cloudy
  if (code === 3) return '04d'; // Overcast
  if (code === 45 || code === 48) return '50d'; // Foggy
  if (code === 51 || code === 53 || code === 55) return '09d'; // Drizzle
  if (code === 61 || code === 63 || code === 65) return '10d'; // Rain
  if (code === 71 || code === 73 || code === 75 || code === 77) return '13d'; // Snow
  if (code === 80 || code === 81 || code === 82) return '10d'; // Rain showers
  if (code === 85 || code === 86) return '13d'; // Snow showers
  if (code === 80 || code === 81 || code === 82) return '10d'; // Rain showers
  if (code === 95 || code === 96 || code === 99) return '11d'; // Thunderstorm
  return '02d';
};

const getWeatherDescription = (code) => {
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code === 51 || code === 53 || code === 55) return 'Drizzle';
  if (code === 61 || code === 63 || code === 65) return 'Rain';
  if (code === 71 || code === 73 || code === 75 || code === 77) return 'Snow';
  if (code === 80 || code === 81 || code === 82) return 'Rain showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
  return 'Unknown';
};

Deno.serve(async (req) => {
  try {
    const { lat, lon, city } = await req.json();

    let coords;
    if (lat && lon) {
      coords = { lat, lon };
    } else if (city) {
      // Get coordinates from city name using Geocoding API
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      if (!geoData.results || geoData.results.length === 0) {
        return Response.json({ error: 'City not found' }, { status: 400 });
      }
      coords = { lat: geoData.results[0].latitude, lon: geoData.results[0].longitude };
    } else {
      return Response.json(
        { error: 'Either coordinates (lat/lon) or city name required' },
        { status: 400 }
      );
    }

    // Calculate date range: 7 days ago to 7 days in future
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch weather data from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${startDateStr}&end_date=${endDateStr}&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=celsius&timezone=auto`;
    
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.text();
      console.error('Open-Meteo error:', weatherResponse.status, errorData);
      return Response.json(
        { error: 'Failed to fetch weather data', details: errorData },
        { status: weatherResponse.status }
      );
    }

    const weatherData = await weatherResponse.json();

    // Transform the data
    const forecast = weatherData.daily.time.map((date, index) => ({
      date,
      temp: Math.round(weatherData.daily.temperature_2m_max[index]),
      temp_min: Math.round(weatherData.daily.temperature_2m_min[index]),
      temp_max: Math.round(weatherData.daily.temperature_2m_max[index]),
      description: getWeatherDescription(weatherData.daily.weather_code[index]),
      icon: getWeatherIcon(weatherData.daily.weather_code[index]),
    }));

    return Response.json({
      city: weatherData.name || city || 'Unknown',
      forecast,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});