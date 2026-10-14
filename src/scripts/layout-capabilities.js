(() => {
        const root = document.documentElement;
        const pointer = matchMedia('(hover: hover) and (pointer: fine)');
        const wide = matchMedia('(min-width: 1024px)');
        const motion = matchMedia('(prefers-reduced-motion: reduce)');
        const homeWork = location.pathname === '/';
        const catalog = root.hasAttribute('data-catalog');
        const updateWorkLayout = () => {
          const precise = pointer.matches && navigator.maxTouchPoints === 0;
          // Homepage Work shares its preview coordinates and scroll reveal on
          // every input type. Only the floating flag permits inset surfaces.
          if (!catalog && (precise || homeWork)) root.dataset.workPreviewLayout = 'true';
          else delete root.dataset.workPreviewLayout;
          const floating = precise && wide.matches;
          if (floating) root.dataset.workStageLayout = 'true';
          else delete root.dataset.workStageLayout;
          if (!catalog && floating && !motion.matches) root.dataset.workStageMotion = 'true';
          else delete root.dataset.workStageMotion;
          dispatchEvent(new Event('workstagelayoutchange'));
        };
        updateWorkLayout();
        const lifecycle = new AbortController();
        for (const query of [pointer, wide, motion]) {
          query.addEventListener('change', updateWorkLayout, { signal: lifecycle.signal });
        }
        addEventListener('pagehide', event => {
          if (!event.persisted) lifecycle.abort();
        }, { signal: lifecycle.signal });
        addEventListener('load', () => requestAnimationFrame(() => {
          if (!document.querySelector('[data-work-stage].work-stage-can-shift')) {
            delete root.dataset.workStageMotion;
          }
        }), { once: true });
})();
