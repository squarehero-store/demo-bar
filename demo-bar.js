// ================================================
//         ⚡ Demo Bar by SquareHero.store
// ================================================
(function() {
    console.log('SquareHero Demo Bar script loaded');

    // Load Coloris
    function loadColoris() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/gh/squarehero-store/demo-bar@0/coloris.min.js';
            script.onload = () => {
                // Wait a short time to ensure Coloris is fully initialized
                setTimeout(resolve, 100);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Load fonts
    function loadFonts() {
        const fontLinks = [
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: true },
            { href: "https://fonts.googleapis.com/css2?family=Red+Hat+Display:ital,wght@0,300..900;1,300..900&display=swap", rel: "stylesheet" },
            { href: "https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap", rel: "stylesheet" }
        ];

        fontLinks.forEach(linkData => {
            const link = document.createElement('link');
            Object.assign(link, linkData);
            document.head.appendChild(link);
        });
    }

    const presetSchemes = [
        { name: "Earth tones", colors: ["#ffffff", "#fcf6eb", "#de9831", "#606e31", "#363c2e"] },
        { name: "Pastel with purple", colors: ["#ffffff", "#f7c9b8", "#f45162", "#77d69f", "#4e0660"] },
        { name: "Neutral browns", colors: ["#FFFFFF", "#f5e3ce", "#b69149", "#604c49", "#302a28"] },
        { name: "Cool blues and yellow", colors: ["#ffffff", "#e3ecf9", "#0d7d8c", "#d9b407", "#131c47"] },
        { name: "Warm earth tones", colors: ["#ffffff", "#eed5b9", "#c15b53", "#754834", "#503731"] }
    ];

    const controlBarHtml = `
      <div class="control-bar">
          <div class="logo-wrapper">
              <img src="https://cdn.jsdelivr.net/gh/squarehero-store/demo-bar@0/assets/sh-logo.svg" alt="SquareHero Logo">
          </div>
          <div id="colour-wrapper">
              <button id="presetSchemesBtn">Preset Schemes ▼</button>
              <div id="presetSchemes" class="hidden">
                  <!-- Preset schemes will be populated by JavaScript -->
              </div>
              <span class="color-label" title="Edit color scheme">Edit color scheme</span>
              <div class="swatches">
                  <input type="text" id="whitePicker" class="colour-swatch slot-1" data-coloris style="background-color: hsl(var(--white-hsl));">
                  <input type="text" id="lightAccentPicker" class="colour-swatch slot-2" data-coloris style="background-color: hsl(var(--lightAccent-hsl));">
                  <input type="text" id="accentPicker" class="colour-swatch slot-3" data-coloris style="background-color: hsl(var(--accent-hsl));">
                  <input type="text" id="darkAccentPicker" class="colour-swatch slot-4" data-coloris style="background-color: hsl(var(--darkAccent-hsl));">
                  <input type="text" id="blackPicker" class="colour-swatch slot-5" data-coloris style="background-color: hsl(var(--black-hsl));">
              </div>
              <div id="resetBtn" class="custom-btn" title="Reset changes"><span>Reset</span></div>
          </div>
          <div class="cta-wrapper">
              <a class="cta-button primary-button" href="">Buy Template</a>
          </div>
      </div>
    `;

    async function initializeDemoBar() {
        if (window.frameElement !== null) {
            console.log('Squarespace is in preview mode. Demo bar not initialized.');
            return;
        }

        // Load Coloris and fonts
        try {
            await loadColoris();
            loadFonts();
        } catch (error) {
            console.error('Failed to load Coloris or fonts:', error);
            return;
        }

        const footer = document.querySelector('footer');
        if (!footer) {
            console.log('Footer not found. Retrying in 100ms.');
            setTimeout(initializeDemoBar, 100);
            return;
        }

        const controlBar = document.createElement('div');
        controlBar.innerHTML = controlBarHtml;
        footer.insertAdjacentElement('afterend', controlBar);

        // Populate preset schemes
        const presetContainer = document.getElementById('presetSchemes');
        presetSchemes.forEach((scheme, index) => {
            const row = document.createElement('div');
            row.className = 'preset-row';
            row.innerHTML = `
                <span>${scheme.name}: </span>
                ${scheme.colors.map(color => `<div class="preset-swatch" style="background-color: ${color}"></div>`).join('')}
            `;
            row.addEventListener('click', () => applyPresetScheme(index));
            presetContainer.appendChild(row);
        });

        // Add event listeners and initialize other features
        setupEventListeners();
        restoreColors();
        initializeColoris();
    }

    function setupEventListeners() {
        const presetSchemesBtn = document.getElementById('presetSchemesBtn');
        const presetSchemesPanel = document.getElementById('presetSchemes');

        presetSchemesBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            presetSchemesPanel.classList.toggle('hidden');

            if (!presetSchemesPanel.classList.contains('hidden')) {
                const btnRect = presetSchemesBtn.getBoundingClientRect();
                const schemesRect = presetSchemesPanel.getBoundingClientRect();
                const leftPosition = btnRect.left + (btnRect.width / 2) - (schemesRect.width / 2);
                const maxLeft = window.innerWidth - schemesRect.width;
                const adjustedLeft = Math.max(0, Math.min(leftPosition, maxLeft));
                presetSchemesPanel.style.left = `${adjustedLeft}px`;
            }
        });

        document.addEventListener('click', function (e) {
            if (!presetSchemesPanel.contains(e.target) && e.target !== presetSchemesBtn) {
                presetSchemesPanel.classList.add('hidden');
            }
        });

        document.getElementById('resetBtn').addEventListener('click', resetColors);
    }

    function restoreColors() {
        const savedColors = JSON.parse(localStorage.getItem('savedColors'));
        if (savedColors) {
            const root = document.documentElement;
            Object.entries(savedColors).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }
    }

    function initializeColoris() {
        if (typeof Coloris === 'undefined') {
            console.error('Coloris not found. Please ensure it has been loaded correctly.');
            return;
        }

        Coloris({
            el: '.colour-swatch',
            themeMode: 'dark',
            format: 'hsl',
            wrap: false,
            onChange: (color, input) => {
                const root = document.documentElement;
                const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
                if (match) {
                    const [, h, s, l] = match;
                    const formattedColor = `${h}, ${s}%, ${l}%`;
                    const property = `--${input.id.replace('Picker', '')}-hsl`;
                    root.style.setProperty(property, formattedColor);
                    saveColorsToLocalStorage();
                    updateSwatchColors();
                }
            }
        });
    }

    function applyPresetScheme(index) {
        const scheme = presetSchemes[index];
        const root = document.documentElement;
        ['white', 'lightAccent', 'accent', 'darkAccent', 'black'].forEach((name, i) => {
            const hsl = hexToHSL(scheme.colors[i]);
            root.style.setProperty(`--${name}-hsl`, hsl);
        });
        updateSwatchColors();
        saveColorsToLocalStorage();
    }

    function hexToHSL(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        } else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        if (delta == 0)
            h = 0;
        else if (cmax == r)
            h = ((g - b) / delta) % 6;
        else if (cmax == g)
            h = (b - r) / delta + 2;
        else
            h = (r - g) / delta + 4;

        h = Math.round(h * 60);

        if (h < 0)
            h += 360;

        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return h + ", " + s + "%, " + l + "%";
    }

    function updateSwatchColors() {
        const swatches = document.querySelectorAll('.colour-swatch');
        swatches.forEach(swatch => {
            swatch.style.backgroundColor = `hsl(var(--${swatch.id.replace('Picker', '')}-hsl))`;
        });
    }

    function saveColorsToLocalStorage() {
        const colors = {};
        ['white', 'lightAccent', 'accent', 'darkAccent', 'black'].forEach(name => {
            colors[`--${name}-hsl`] = getComputedStyle(document.documentElement).getPropertyValue(`--${name}-hsl`);
        });
        localStorage.setItem('savedColors', JSON.stringify(colors));
    }

    function resetColors() {
        const root = document.documentElement;
        ['white', 'lightAccent', 'accent', 'darkAccent', 'black'].forEach(name => {
            root.style.removeProperty(`--${name}-hsl`);
        });
        localStorage.removeItem('savedColors');
        updateSwatchColors();
    }

    // Initialize the demo bar when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDemoBar);
    } else {
        initializeDemoBar();
    }
})();