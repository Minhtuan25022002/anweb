/* main.js
   - Adds .has-sub to li that contain submenu
   - Implements mobile accordion behavior (toggle on tap)
   - Works reliably even if header is injected later via includes-loader.js
*/

(function () {
    // helper: wait for an element to exist (for includes-loader compatibility)
    function waitForElement(selector, timeout = 3000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            const interval = 50;
            let waited = 0;
            const timer = setInterval(() => {
                const e = document.querySelector(selector);
                if (e) {
                    clearInterval(timer);
                    resolve(e);
                } else {
                    waited += interval;
                    if (waited >= timeout) {
                        clearInterval(timer);
                        reject(new Error('timeout waiting for ' + selector));
                    }
                }
            }, interval);
        });
    }

    // main init
    function initNav() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const mq = window.matchMedia('(max-width: 768px)');

        // 1) mark li that have submenu
        const topLis = nav.querySelectorAll('ul.main-menu li');
        topLis.forEach(li => {
            const sub = li.querySelector(':scope > ul');
            if (sub) {
                li.classList.add('has-sub');
                // set attributes on link for accessibility
                const a = li.querySelector(':scope > a');
                if (a) {
                    a.setAttribute('aria-haspopup', 'true');
                    a.setAttribute('aria-expanded', 'false');
                }
            }
        });

        // handler for mobile toggling
        function mobileToggleHandler(e) {
            // allow ctrl/cmd click to navigate
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;
            // only on small screens
            if (!mq.matches) return;

            const a = e.currentTarget;
            const li = a.parentElement;
            // toggle open
            const nowOpen = li.classList.toggle('open');
            a.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
            // stop navigation
            e.preventDefault();
        }

        // keyboard handler (Enter / Space) on links with submenu
        function keyboardToggleHandler(e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                mobileToggleHandler.call(this, e);
            }
        }

        // attach click handlers to links that are parents
        nav.querySelectorAll('ul.main-menu li.has-sub > a').forEach(a => {
            // remove existing to avoid duplicates
            a.removeEventListener('click', mobileToggleHandler);
            a.addEventListener('click', mobileToggleHandler);
            a.removeEventListener('keydown', keyboardToggleHandler);
            a.addEventListener('keydown', keyboardToggleHandler);
            // role attribute if not set
            if (!a.hasAttribute('role')) a.setAttribute('role', 'button');
        });

        // when resizing, remove all .open on desktop
        window.addEventListener('resize', () => {
            if (!mq.matches) {
                nav.querySelectorAll('ul.main-menu li.open').forEach(li => {
                    li.classList.remove('open');
                    const a = li.querySelector(':scope > a');
                    if (a) a.setAttribute('aria-expanded', 'false');
                });
            }
        });

        // click outside to close open menus (mobile)
        document.addEventListener('click', (ev) => {
            if (!nav.contains(ev.target)) {
                nav.querySelectorAll('ul.main-menu li.open').forEach(li => {
                    li.classList.remove('open');
                    const a = li.querySelector(':scope > a');
                    if (a) a.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    // wait for nav to exist (in case header is loaded via includes-loader)
    waitForElement('nav', 5000).then(() => {
        initNav();
    }).catch((err) => {
        // still try to init immediately as fallback
        console.warn('main.js: nav not found within timeout, attempting init anyway.');
        try { initNav(); } catch (e) {/* ignore */ }
    });
})();
