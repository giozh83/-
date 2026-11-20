import { Component, inject, signal, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { GeocodingService, POPULAR_GEORGIAN_CITIES } from '../../services/geocoding.service';
import { LocationItem } from '../../models/weather.model';
import { WeatherIconComponent } from '../weather-icon/weather-icon.component';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, WeatherIconComponent],
  template: `
    <header class="w-full relative z-30 pt-3 sm:pt-5 pb-2 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="flex flex-col gap-2.5 sm:gap-3.5">
        
        <!-- Top Bar: Logo & Grouped Actions -->
        <div class="flex items-center justify-between gap-2">
          
          <!-- Logo & Branding -->
          <div class="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0" (click)="reloadCurrent()">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-500 to-indigo-600 p-[1px] shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div class="w-full h-full bg-slate-900/90 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <app-weather-icon [name]="'sun'" [size]="22" class="scale-105 sm:scale-110"></app-weather-icon>
              </div>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h1 class="text-sm sm:text-lg lg:text-xl font-extrabold tracking-tight text-white leading-tight truncate">
                  {{ state.translationService.t().appTitle }}
                </h1>
                <span class="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">Live</span>
              </div>
              <p class="text-[10px] sm:text-xs text-slate-400 leading-tight hidden xs:block truncate">Open-Meteo & GPS Precision</p>
            </div>
          </div>

          <!-- Controls Capsule: Unit, Language, GPS -->
          <div class="flex items-center gap-1 sm:gap-2 p-1 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl shadow-lg shrink-0">
            
            <!-- Unit Switcher (°C / °F) -->
            <button (click)="state.toggleUnit()"
                    [title]="'ტემპერატურის ერთეული (°C / °F)'"
                    class="h-7 sm:h-8 px-2 sm:px-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[11px] sm:text-xs font-bold text-sky-300 border border-white/5 transition-all flex items-center gap-0.5">
              <span [class.text-white]="state.tempUnit() === 'C'" [class.text-slate-500]="state.tempUnit() !== 'C'">°C</span>
              <span class="text-slate-600 text-[10px]">/</span>
              <span [class.text-white]="state.tempUnit() === 'F'" [class.text-slate-500]="state.tempUnit() !== 'F'">°F</span>
            </button>

            <!-- Language Switcher (ქარ / ENG) -->
            <button (click)="state.translationService.toggleLanguage()"
                    [title]="'ენის შეცვლა (ქართული / English)'"
                    class="h-7 sm:h-8 px-2 sm:px-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[11px] sm:text-xs font-bold text-amber-300 border border-white/5 transition-all flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full" [class.bg-amber-400]="state.translationService.language() === 'ka'" [class.bg-sky-400]="state.translationService.language() === 'en'"></span>
              <span>{{ state.translationService.language() === 'ka' ? 'ქარ' : 'ENG' }}</span>
            </button>

            <!-- GPS My Location Button -->
            <button (click)="state.detectCurrentLocation()"
                    [title]="state.translationService.t().myLocation"
                    [disabled]="state.isLocating()"
                    class="h-7 sm:h-8 px-2 sm:px-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 active:scale-95 text-[11px] sm:text-xs font-semibold text-sky-300 border border-sky-500/30 transition-all flex items-center gap-1">
              @if (state.isLocating()) {
                <svg class="w-3.5 h-3.5 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              } @else {
                <svg class="w-3.5 h-3.5 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" stroke-width="2"></circle>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v3m0 14v3M2 12h3m14 0h3"></path>
                </svg>
                <span class="hidden md:inline">{{ state.translationService.t().myLocation }}</span>
              }
            </button>

          </div>

        </div>

        <!-- Search Bar with Instant Autocomplete Dropdown -->
        <div class="relative w-full" #searchContainer>
          <div class="relative flex items-center">
            
            <!-- Search Icon -->
            <div class="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-sky-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>

            <!-- Input Field -->
            <input type="text"
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="onSearchInput($event)"
                   (focus)="openDropdown()"
                   [placeholder]="state.translationService.t().searchPlaceholder"
                   class="w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 rounded-2xl bg-slate-900/65 hover:bg-slate-900/85 focus:bg-slate-900/95 text-white placeholder-slate-400 text-xs sm:text-sm border border-white/15 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20 backdrop-blur-xl transition-all outline-none shadow-lg shadow-black/25" />

            <!-- Clear Search Button -->
            @if (searchQuery) {
              <button (click)="clearSearch()"
                      class="absolute right-3 p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            }
          </div>

          <!-- Autocomplete / Recents / Popular Dropdown Menu -->
          @if (isDropdownOpen()) {
            <div class="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto">
              
              <!-- Searching Indicator -->
              @if (isSearching()) {
                <div class="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <svg class="w-4 h-4 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>{{ state.translationService.t().loading }}</span>
                </div>
              } @else if (searchResults().length > 0) {
                <div class="py-1">
                  <div class="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    შედეგები (Results)
                  </div>
                  @for (loc of searchResults(); track loc.id || loc.lat) {
                    <button (click)="selectLocation(loc)"
                            class="w-full px-3 py-2.5 flex items-center justify-between rounded-xl hover:bg-white/10 active:bg-white/15 text-left transition-colors group">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 shrink-0">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          </svg>
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="text-xs sm:text-sm font-semibold text-white group-hover:text-sky-300 transition-colors truncate">{{ loc.name }}</div>
                          <div class="text-[11px] text-slate-400 truncate">
                            {{ loc.admin1 ? loc.admin1 + ', ' : '' }}{{ loc.country }}
                          </div>
                        </div>
                      </div>
                      <span class="text-xs text-slate-500 group-hover:text-slate-300 ml-2">→</span>
                    </button>
                  }
                </div>
              }

              <!-- Recent Searches Section -->
              @if (state.recentSearches().length > 0 && !searchQuery) {
                <div class="py-1 border-b border-white/10 mb-1">
                  <div class="flex items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <span>{{ state.translationService.t().recentSearches }}</span>
                    <button (click)="state.clearRecents()" class="text-sky-400 hover:underline lowercase text-[11px]">
                      {{ state.translationService.t().clearHistory }}
                    </button>
                  </div>
                  @for (loc of state.recentSearches(); track loc.id || loc.lat) {
                    <button (click)="selectLocation(loc)"
                            class="w-full px-3 py-2 flex items-center justify-between rounded-xl hover:bg-white/10 active:bg-white/15 text-left transition-colors">
                      <div class="flex items-center gap-2 truncate">
                        <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" stroke-width="2"></circle>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v5l3 3"></path>
                        </svg>
                        <span class="text-xs sm:text-sm text-slate-200 truncate">{{ loc.name }}</span>
                        <span class="text-[11px] text-slate-500 truncate">{{ loc.country }}</span>
                      </div>
                    </button>
                  }
                </div>
              }

              <!-- Quick Popular Georgian Cities Chips -->
              <div class="p-2">
                <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  {{ state.translationService.t().popularCities }}
                </div>
                <div class="flex flex-wrap gap-1.5">
                  @for (city of popularCities; track city.name) {
                    <button (click)="selectLocation(city)"
                            class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-sky-500/20 active:bg-sky-500/30 hover:text-sky-300 text-xs text-slate-300 border border-white/10 transition-all active:scale-95">
                      {{ city.name }}
                    </button>
                  }
                </div>
              </div>

            </div>
          }
        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  state = inject(StateService);
  private geocodingService = inject(GeocodingService);
  private elRef = inject(ElementRef);

  searchQuery = '';
  isDropdownOpen = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  searchResults = signal<LocationItem[]>([]);
  readonly popularCities = POPULAR_GEORGIAN_CITIES.slice(0, 8);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (!query.trim()) {
          this.isSearching.set(false);
          return [];
        }
        this.isSearching.set(true);
        return this.geocodingService.searchCities(query);
      })
    ).subscribe((results) => {
      this.searchResults.set(results);
      this.isSearching.set(false);
    });
  }

  onSearchInput(val: string): void {
    this.searchSubject.next(val);
    this.isDropdownOpen.set(true);
  }

  openDropdown(): void {
    this.isDropdownOpen.set(true);
    if (!this.searchQuery) {
      this.searchResults.set([]);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  selectLocation(loc: LocationItem): void {
    this.state.loadLocation(loc);
    this.isDropdownOpen.set(false);
    this.searchQuery = '';
  }

  reloadCurrent(): void {
    this.state.loadLocation(this.state.currentLocation());
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }
}
