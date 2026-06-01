import { WeatherData, DailyWeather } from "../types";

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&past_days=1&forecast_days=4&timezone=auto`
    );
    const data = await response.json();

    const current = data.current;
    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const rain = current.precipitation;

    let condition = "Cerah";
    if (rain > 0.5) condition = "Hujan";
    else if (humidity > 80) condition = "Berawan/Lembap";

    // Forecast data mapping
    const daily = data.daily;
    const forecast: DailyWeather[] = daily.time.slice(1).map((date: string, i: number) => ({
      date,
      tempMax: daily.temperature_2m_max[i + 1],
      tempMin: daily.temperature_2m_min[i + 1],
      rain: daily.precipitation_sum[i + 1]
    }));

    const yesterday: DailyWeather = {
      date: daily.time[0],
      tempMax: daily.temperature_2m_max[0],
      tempMin: daily.temperature_2m_min[0],
      rain: daily.precipitation_sum[0]
    };

    // Proactive Recommendations
    let recommendation = "Waktu ideal untuk pemeliharaan rutin.";
    let risk = "Rendah";

    if (humidity > 85 && temp > 25) {
      risk = "Tinggi (Jamur/Blas)";
      recommendation = "Waspadai serangan jamur. Kurangi dosis pupuk nitrogen dan pastikan drainase lancar.";
    } else if (temp > 30 && humidity < 60) {
      risk = "Sedang (Hama Thrips/Tungau)";
      recommendation = "Lakukan penyiraman ekstra pada sore hari untuk menjaga kelembapan mikro.";
    } else if (rain > 5) {
      risk = "Tinggi (Busuk Akar/Bakteri)";
      recommendation = "Tunda aplikasi pestisida cair. Periksa saluran irigasi agar tidak ada air menggenang.";
    }

    return {
      current: {
        temperature: temp,
        humidity: humidity,
        rain,
        condition
      },
      recommendation,
      risk,
      yesterday,
      forecast
    };
  } catch (error) {
    console.error("Weather Fetch Error:", error);
    throw error;
  }
}
