// ================================================
//         ⚡ Demo Bar by SquareHero.store
// ================================================
(function () {
    function initDemoBar() {
        console.log('SquareHero Demo Bar script loaded');

        // Check if the current window is within an iframe (preview mode)
        if (window.frameElement !== null) {
            console.log('Squarespace is in preview mode. Script not executed.');
            return;
        }

        console.log('Squarespace is not in preview mode.');

        // Function to read color schemes from meta tags
        function getColorSchemesFromMeta() {
            const schemes = [];
            const metaTags = document.getElementsByTagName('meta');

            for (let i = 0; i < metaTags.length; i++) {
                const attr = metaTags[i].getAttribute('squarehero-color-scheme');
                if (attr && attr.startsWith('color-scheme-')) {
                    const content = metaTags[i].getAttribute('content');
                    if (content) {
                        const [schemeName, ...colors] = content.split(',').map(item => item.trim());
                        schemes.push({ name: schemeName, colors: colors });
                    }
                }
            }

            return schemes.length > 0 ? schemes : null;
        }

        // Function to get the target URL from meta tag
        function getTargetUrlFromMeta() {
            const metaTag = document.querySelector('meta[squarehero-demo-bar]');
            return metaTag ? metaTag.getAttribute('target') : '';
        }

        // Use meta tag color schemes or fall back to default
        const presetSchemes = getColorSchemesFromMeta() || [
            { name: "Earth tones", colors: ["#ffffff", "#fcf6eb", "#de9831", "#606e31", "#363c2e"] },
            { name: "Pastel with purple", colors: ["#ffffff", "#f7c9b8", "#f45162", "#77d69f", "#4e0660"] },
            { name: "Neutral browns", colors: ["#FFFFFF", "#f5e3ce", "#b69149", "#604c49", "#302a28"] },
            { name: "Cool blues and yellow", colors: ["#ffffff", "#e3ecf9", "#0d7d8c", "#d9b407", "#131c47"] },
            { name: "Warm earth tones", colors: ["#ffffff", "#eed5b9", "#c15b53", "#754834", "#503731"] }
        ];

        // Get the target URL for the "Buy Template" button
        const targetUrl = getTargetUrlFromMeta();

        const controlBarHtml = `
          <div class="control-bar">
              <div class="logo-wrapper">
                  <img src="https://cdn.jsdelivr.net/gh/squarehero-store/demo-bar@0/assets/sh-logo.svg" alt="SquareHero Logo">
              </div>
              <div id="colour-wrapper">
                  <button id="presetSchemesBtn">Load Color Schemes</button>
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
                  <a class="cta-button primary-button" href="${targetUrl}">Buy Template</a>
              </div>
          </div>
        `;

        function injectControlBar() {
            const footer = document.querySelector('footer');
            if (footer) {
                const controlBar = document.createElement('div');
                controlBar.innerHTML = controlBarHtml;
                footer.insertAdjacentElement('afterend', controlBar);
                setupEventListeners();
            } else {
                console.error('Footer not found. Control bar could not be injected.');
            }
        }

        function setupEventListeners() {
            // Populate preset schemes
            const presetContainer = document.getElementById('presetSchemes');
            if (presetContainer) {
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
            }

            // Add event listener for the Preset Schemes button
            const presetSchemesBtn = document.getElementById('presetSchemesBtn');
            const presetSchemesPanel = document.getElementById('presetSchemes');
            const controlBar = document.querySelector('.control-bar');
            if (presetSchemesBtn && presetSchemesPanel && controlBar) {
                presetSchemesBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    presetSchemesPanel.classList.toggle('hidden');

                    if (!presetSchemesPanel.classList.contains('hidden')) {
                        const btnRect = presetSchemesBtn.getBoundingClientRect();
                        const schemesRect = presetSchemesPanel.getBoundingClientRect();
                        const controlBarRect = controlBar.getBoundingClientRect();

                        // Calculate the left position to center the panel over the button
                        const leftPosition = btnRect.left + (btnRect.width / 2) - (schemesRect.width / 2);

                        // Ensure the panel doesn't go off-screen horizontally
                        const maxLeft = window.innerWidth - schemesRect.width;
                        const adjustedLeft = Math.max(0, Math.min(leftPosition, maxLeft));

                        // Set the position
                        presetSchemesPanel.style.left = `${adjustedLeft}px`;
                        presetSchemesPanel.style.bottom = `${controlBarRect.height}px`; // Flush with the top of control bar
                    }
                });
            }

            // Close the panel when clicking outside
            document.addEventListener('click', function (e) {
                if (presetSchemesPanel && !presetSchemesPanel.contains(e.target) && e.target !== presetSchemesBtn) {
                    presetSchemesPanel.classList.add('hidden');
                }
            });

            // Restore colors from local storage if available
            const savedColors = JSON.parse(localStorage.getItem('savedColors'));
            if (savedColors) {
                applyColors(savedColors);
            }

            // Initialize Coloris for colour swatches
            if (typeof Coloris !== 'undefined') {
                initializeColoris();
            } else {
                console.error('Coloris library not found. Make sure it\'s loaded before this script.');
            }

            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) {
                resetBtn.addEventListener('click', function () {
                    // Reset colors
                    const root = document.documentElement;
                    root.style.removeProperty('--white-hsl');
                    root.style.removeProperty('--lightAccent-hsl');
                    root.style.removeProperty('--accent-hsl');
                    root.style.removeProperty('--darkAccent-hsl');
                    root.style.removeProperty('--black-hsl');
                    root.style.removeProperty('--safeLightAccent-hsl');
                    root.style.removeProperty('--safeDarkAccent-hsl');

                    // Clear local storage
                    localStorage.removeItem('savedColors');

                    // Reset swatches
                    updateSwatchColors();
                });
            }
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
                        const colors = {};
                        colors[property] = formattedColor;
                        applyColors(colors);
                        saveColorsToLocalStorage();
                        updateSwatchColors();
                    }
                }
            });

            // Add event listeners to update color picker on open
            document.querySelectorAll('.colour-swatch').forEach(swatch => {
                swatch.addEventListener('click', (event) => {
                    const colorName = event.target.id.replace('Picker', '');
                    const hslValue = getComputedStyle(document.documentElement).getPropertyValue(`--${colorName}-hsl`).trim();
                    event.target.value = `hsl(${hslValue})`;
                    event.target.style.backgroundColor = `hsl(${hslValue})`;
                });
            });
        }

        function updateSwatchColors() {
            const swatches = document.querySelectorAll('.colour-swatch');
            swatches.forEach(swatch => {
                const colorName = swatch.id.replace('Picker', '');
                const hslValue = getComputedStyle(document.documentElement).getPropertyValue(`--${colorName}-hsl`).trim();
                swatch.style.backgroundColor = `hsl(${hslValue})`;
                swatch.value = `hsl(${hslValue})`;
            });
        }

        function applyPresetScheme(index) {
            const scheme = presetSchemes[index];
            const colors = {};
            ['white', 'lightAccent', 'accent', 'darkAccent', 'black'].forEach((name, i) => {
                const hsl = hexToHSL(scheme.colors[i]);
                colors[`--${name}-hsl`] = hsl;
            });
            applyColors(colors);
            updateSwatchColors();
            saveColorsToLocalStorage();
        }

        function applyColors(colors) {
            const root = document.documentElement;
            Object.entries(colors).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
            // Set safe accent colors
            root.style.setProperty('--safeLightAccent-hsl', colors['--accent-hsl']);
            root.style.setProperty('--safeDarkAccent-hsl', colors['--darkAccent-hsl']);

            // Remove the forced repaint
            // document.body.style.display = 'none';
            // document.body.offsetHeight; // Trigger a reflow
            // document.body.style.display = '';

            // Use requestAnimationFrame to ensure all Squarespace elements have updated
            requestAnimationFrame(() => {
                const event = new Event('colorschemechange');
                document.dispatchEvent(event);
            });
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

        // Check if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectControlBar);
        } else {
            injectControlBar();
        }
    }

    // Run the initialization function
    initDemoBar();
})();