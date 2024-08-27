// ================================================
//         ⚡ Demo Bar by SquareHero.store
// ================================================
(function() {
    function initDemoBar() {
        console.log('SquareHero Demo Bar script loaded');

        // Check if the current window is within an iframe (preview mode)
        if (window.frameElement !== null) {
            console.log('Squarespace is in preview mode. Script not executed.');
            return;
        }

        console.log('Squarespace is not in preview mode.');

        const presetSchemes = [
            { name: "Earth tones", colors: ["#FFFAF0", "#D2B48C", "#8B4513", "#556B2F", "#1C2321"] },
            { name: "Pastel with purple", colors: ["#FFF5EE", "#DB7093", "#98FB98", "#8A2BE2", "#FFFFFF"] },
            { name: "Neutral browns", colors: ["#FFFFFF", "#F5DEB3", "#CD853F", "#4A3728", "#1C1C1C"] },
            { name: "Cool blues & yellow", colors: ["#F0F8FF", "#87CEEB", "#4682B4", "#FFD700", "#000080"] },
            { name: "Warm earth tones", colors: ["#FFF5EE", "#CD5C5C", "#8B4513", "#4A3728", "#2F2F2F"] }
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

        // Inject control bar
        const footer = document.querySelector('footer');
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

        // Add event listener for the Preset Schemes button
        const presetSchemesBtn = document.getElementById('presetSchemesBtn');
        const presetSchemesPanel = document.getElementById('presetSchemes');

        presetSchemesBtn.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent event from bubbling up
            presetSchemesPanel.classList.toggle('hidden');

            if (!presetSchemesPanel.classList.contains('hidden')) {
                const btnRect = presetSchemesBtn.getBoundingClientRect();
                const schemesRect = presetSchemesPanel.getBoundingClientRect();

                // Calculate the left position to center the schemes panel
                const leftPosition = btnRect.left + (btnRect.width / 2) - (schemesRect.width / 2);

                // Ensure the panel doesn't go off-screen
                const maxLeft = window.innerWidth - schemesRect.width;
                const adjustedLeft = Math.max(0, Math.min(leftPosition, maxLeft));

                presetSchemesPanel.style.left = `${adjustedLeft}px`;
            }
        });

        // Close the panel when clicking outside
        document.addEventListener('click', function (e) {
            if (!presetSchemesPanel.contains(e.target) && e.target !== presetSchemesBtn) {
                presetSchemesPanel.classList.add('hidden');
            }
        });

        // Restore colors from local storage if available
        const savedColors = JSON.parse(localStorage.getItem('savedColors'));
        if (savedColors) {
            const root = document.documentElement;
            root.style.setProperty('--white-hsl', savedColors['--white-hsl']);
            root.style.setProperty('--lightAccent-hsl', savedColors['--lightAccent-hsl']);
            root.style.setProperty('--accent-hsl', savedColors['--accent-hsl']);
            root.style.setProperty('--darkAccent-hsl', savedColors['--darkAccent-hsl']);
            root.style.setProperty('--black-hsl', savedColors['--black-hsl']);
        }

        // Initialize Coloris for colour swatches
        initializeColoris();

        document.getElementById('resetBtn').addEventListener('click', function () {
            // Reset colors
            const root = document.documentElement;
            root.style.removeProperty('--white-hsl');
            root.style.removeProperty('--lightAccent-hsl');
            root.style.removeProperty('--accent-hsl');
            root.style.removeProperty('--darkAccent-hsl');
            root.style.removeProperty('--black-hsl');

            // Clear local storage
            localStorage.removeItem('savedColors');

            // Reset swatches
            updateSwatchColors();
        });
    }

    function initializeColoris() {
        Coloris({
            el: '.colour-swatch',
            themeMode: 'dark',
            format: 'hsl',
            wrap: false,
            onChange: (color, input) => {
                console.log('Color picked:', color);
                const root = document.documentElement;
                // Parse the HSL color string
                const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
                if (match) {
                    const [, h, s, l] = match;
                    const formattedColor = `${h}, ${s}%, ${l}%`;
                    const property = `--${input.id.replace('Picker', '')}-hsl`;
                    root.style.setProperty(property, formattedColor);
                    // Save colors to local storage
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
        // Convert hex to RGB first
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
        // Then to HSL
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

    // Check if the DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDemoBar);
    } else {
        initDemoBar();
    }
})();