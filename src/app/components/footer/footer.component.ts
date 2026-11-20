import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12 text-slate-400 text-xs">
      <div class="rounded-3xl bg-slate-900/40 border border-white/10 p-6 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        <!-- Left details -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
            ☁
          </div>
          <div>
            <div class="font-semibold text-white">
              {{ state.translationService.t().appTitle }}
            </div>
            <div class="text-[11px] text-slate-500">
              მონაცემები: Open-Meteo API & OpenStreetMap Contributors
            </div>
          </div>
        </div>

        <!-- Right credits -->
        <div class="flex items-center gap-4 text-center md:text-right">
          <div>
            <div class="text-slate-300 font-medium">
              {{ state.translationService.t().developedWith }}
            </div>
            <div class="text-[11px] text-slate-500">
              © 2026 Weather App • Real-Time Meteorological Data
            </div>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  state = inject(StateService);
}
