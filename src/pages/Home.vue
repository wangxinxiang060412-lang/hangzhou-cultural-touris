<script setup lang="ts">
import FeaturedBooking from '../components/home/FeaturedBooking.vue'
import HeroSection from '../components/home/HeroSection.vue'
import IntroSection from '../components/home/IntroSection.vue'
import OfficialNotice from '../components/home/OfficialNotice.vue'
import PlacesArchive from '../components/home/PlacesArchive.vue'
import RoutePreview from '../components/home/RoutePreview.vue'
import SeasonStory from '../components/home/SeasonStory.vue'
import TravelImpressions from '../components/home/TravelImpressions.vue'
import WeatherSync from '../components/home/WeatherSync.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
</script>

<template>
  <div class="page-shell">
    <main id="main-content" tabindex="-1">
      <HeroSection />
      <OfficialNotice />
      <IntroSection />
      <WeatherSync />
      <FeaturedBooking />
      <SeasonStory />
      <PlacesArchive />
      <RoutePreview />
      <TravelImpressions />
    </main>
    <SiteFooter />
  </div>
</template>
