<template>
  <div class="relative min-h-dvh">
    <HeartsBackground />
    <div class="relative z-10 flex min-h-dvh flex-col">
      <AppHeader />
      <main class="flex flex-1 flex-col">
        <slot />
      </main>
    </div>
  </div>
</template>
