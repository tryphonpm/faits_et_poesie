<script setup lang="ts">
useHead({
  title: 'The Daily Chronicle — Maquette',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;0,900;1,400&display=swap'
    }
  ]
})
</script>

<template>
  <div class="flex min-h-screen justify-center bg-[#fcfbf7] p-5 font-serif text-[#111111]">
    <div class="w-full max-w-[1200px] border border-neutral-300 bg-[#fcfbf7] p-5 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
      <!-- Masthead -->
      <header class="mb-5 border-b-4 border-double border-[#111111] pb-2.5 text-center">
        <div class="flex justify-between border-b border-[#111111] py-1.5 text-sm font-bold uppercase tracking-wide">
          <div>Weather: Clear &amp; Crisp</div>
          <div>Price: Two Cents</div>
        </div>

        <h1 class="my-2.5 font-['Playfair_Display',Georgia,'Times_New_Roman',serif] text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl">
          The Daily Chronicle
        </h1>

        <div class="flex justify-between border-y border-[#111111] py-1.5 text-sm font-bold italic">
          <div>Vol. CXXIV No. 42</div>
          <div>Saturday, July 4, 2026</div>
          <div>New York, New York</div>
        </div>
      </header>

      <!-- Main body -->
      <main class="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_1fr]">
        <!-- Left column: main story -->
        <section>
          <h2 class="mb-4 text-center font-['Playfair_Display',Georgia,serif] text-3xl font-extrabold uppercase leading-tight sm:text-5xl">
            A Monumental Leap Forward for Mankind
          </h2>
          <h3 class="mb-5 text-center text-xl font-normal italic text-[#444444] sm:text-[1.3rem]">
            Global assembly ratifies historic accord amidst celebration in the streets.
          </h3>

          <figure class="my-4 border border-[#111111] bg-white p-1">
            <img
              src="https://picsum.photos/800/450?grayscale"
              alt="Crowds gathering in celebration"
              class="block w-full grayscale contrast-125"
            />
            <figcaption class="px-1.5 pt-1 text-sm italic leading-snug">
              Crowds gather in the central square early this morning to witness the historic signing. Observers call it the largest peaceful assembly of the modern era.
            </figcaption>
          </figure>

          <div class="columns-1 gap-5 text-justify [column-rule:1px_solid_#e0e0e0] sm:columns-2 lg:columns-3">
            <p class="drop-cap mb-3 text-base leading-normal">
              <span class="font-bold">In an unprecedented turn</span> of events that caught world leaders by surprise, a sweeping global resolution was finalized late last night. The atmosphere outside the delegation hall was electric, with thousands remaining down the avenues until the final stroke of the pen was announced via telegraph and radio broadcasts.
            </p>

            <p class="mb-3 indent-[15px] text-base leading-normal">
              The implications of this treaty are bound to reshape commerce, international transit, and collective industry for the next century. Economists are already predicting an immediate stabilization of markets, while local councils are preparing for a massive influx of trade options.
            </p>

            <p class="mb-3 indent-[15px] text-base leading-normal">
              "We have crossed a threshold from which we cannot, and should not, return," noted Chief Delegate Marcus Vance during his brief address on the courthouse steps. Vance, visibly exhausted but triumphant, waved to the roaring crowds before being whisked away by security details.
            </p>

            <p class="mb-3 indent-[15px] text-base leading-normal">
              Opposing factions, who had held out for weeks over minor regulatory disputes, ultimately conceded when the public pressure reached a fever pitch. Leaflets had been distributed across the major sectors calling for a swift resolution to the gridlock.
            </p>

            <p class="mb-3 indent-[15px] text-base leading-normal">
              Details regarding the phased rollout of the new policies are expected to be published in tomorrow's evening edition. For now, municipalities have declared a public holiday, and municipal offices will remain closed through the weekend to allow for celebrations.
            </p>
          </div>
        </section>

        <!-- Right column: sidebar -->
        <aside class="border-t-2 border-[#111111] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <article class="mb-6 border-b border-dashed border-neutral-400 pb-5">
            <h4 class="mb-2 font-['Playfair_Display',Georgia,serif] text-2xl font-extrabold leading-tight">
              Local Markets Reach All-Time Highs
            </h4>
            <p class="mb-3 indent-[15px] text-base leading-normal">
              Trading floors experienced unprecedented volume today as news of the accord spread. Commodities skyrocketed within the first hour of the opening bell, forcing brokers to clear a backlog of orders manually.
            </p>
          </article>

          <article class="mb-6 border-b border-dashed border-neutral-400 pb-5">
            <h4 class="mb-2 font-['Playfair_Display',Georgia,serif] text-2xl font-extrabold leading-tight">
              New Steam-Engine Record Logged
            </h4>
            <figure class="my-4 border border-[#111111] bg-white p-1">
              <img
                src="https://picsum.photos/300/200?grayscale"
                alt="Locomotive engine"
                class="block w-full grayscale contrast-125"
              />
              <figcaption class="px-1.5 pt-1 text-sm italic leading-snug">
                The Trans-Continental No. 9 at full steam.
              </figcaption>
            </figure>
            <p class="mb-3 indent-[15px] text-base leading-normal">
              Engineers out west have shattered the previous speed record, completing the northern run in just under forty-eight hours. The feat marks a triumph for modern coal filtration systems.
            </p>
          </article>

          <article>
            <h4 class="mb-2 font-['Playfair_Display',Georgia,serif] text-2xl font-extrabold leading-tight">
              Editorial: The Road Ahead
            </h4>
            <p class="mb-3 indent-[15px] text-base leading-normal">
              It is easy to get swept up in the romanticism of the hour, but sober minds must prevail. The ink is dry, yet the true labor of implementing these grand designs begins at dawn. We must remain vigilant.
            </p>
          </article>
        </aside>
      </main>

      <hr class="my-5 h-px border-0 bg-[#111111]">
    </div>
  </div>
</template>

<style scoped>
.drop-cap::first-letter {
  float: left;
  margin-right: 0.5rem;
  margin-top: 0.25rem;
  font-size: 3.5rem;
  font-weight: bold;
  line-height: 0.9;
}
</style>
