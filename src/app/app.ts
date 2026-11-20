import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './services/state.service';
import { WeatherBackgroundComponent } from './components/weather-background/weather-background.component';
import { HeaderComponent } from './components/header/header.component';
import { FavoriteBarComponent } from './components/favorite-bar/favorite-bar.component';
import { CurrentWeatherComponent } from './components/current-weather/current-weather.component';
import { HourlyForecastComponent } from './components/hourly-forecast/hourly-forecast.component';
import { WeatherDetailsComponent } from './components/weather-details/weather-details.component';
import { AirQualityComponent } from './components/air-quality/air-quality.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    WeatherBackgroundComponent,
    HeaderComponent,
    FavoriteBarComponent,
    CurrentWeatherComponent,
    HourlyForecastComponent,
    WeatherDetailsComponent,
    AirQualityComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  state = inject(StateService);

  reload(): void {
    this.state.loadLocation(this.state.currentLocation());
  }
}
