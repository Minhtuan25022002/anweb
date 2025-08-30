(function () {
    function waitFor(selector, timeout = 4000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            const interval = 50;
            let waited = 0;
            const t = setInterval(() => {
                const e = document.querySelector(selector);
                if (e) { clearInterval(t); resolve(e); }
                else { waited += interval; if (waited >= timeout) { clearInterval(t); reject(); } }
            }, interval);
        });
    }

    function initNav() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        const mq = window.matchMedia('(max-width: 768px)');

        nav.querySelectorAll('ul.main-menu li').forEach(li => {
            const sub = li.querySelector(':scope > ul');
            if (sub) {
                li.classList.add('has-sub');
                const a = li.querySelector(':scope > a');
                if (a) {
                    a.setAttribute('aria-haspopup', 'true');
                    a.setAttribute('aria-expanded', 'false');

                    // remove duplicates if included
                    a.addEventListener('click', function (e) {
                        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                        if (!mq.matches) return;
                        e.preventDefault();
                        const isOpen = li.classList.toggle('open');
                        a.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                    });

                    a.addEventListener('keydown', function (e) {
                        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                            e.preventDefault();
                            a.click();
                        }
                    });
                }
            }
        });

        window.addEventListener('resize', () => {
            if (!mq.matches) {
                nav.querySelectorAll('ul.main-menu li.open').forEach(li => {
                    li.classList.remove('open');
                    const a = li.querySelector(':scope > a');
                    if (a) a.setAttribute('aria-expanded', 'false');
                });
            }
        });

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

    function initSlideshow() {
        const slideshow = document.querySelector('.hero-slideshow');
        if (!slideshow) return;
        const slides = Array.from(slideshow.querySelectorAll('img'));
        const prevBtn = document.querySelector('.hero-prev');
        const nextBtn = document.querySelector('.hero-next');
        const indicatorsWrap = document.querySelector('.hero-indicators');

        if (!slides.length) return;
        let current = 0;
        let intervalId = null;
        const delay = 5000;

        // create indicators
        slides.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('aria-label', `Chuyển tới ảnh ${i + 1}`);
            if (i === 0) btn.classList.add('active');
            btn.addEventListener('click', () => {
                goTo(i);
                restartAuto();
            });
            indicatorsWrap.appendChild(btn);
        });
        const indicators = Array.from(indicatorsWrap.children);

        function show(index) {
            slides.forEach((s, i) => s.classList.toggle('active', i === index));
            indicators.forEach((b, i) => b.classList.toggle('active', i === index));
            current = index;
        }
        function next() { show((current + 1) % slides.length); }
        function prev() { show((current - 1 + slides.length) % slides.length); }
        function goTo(i) { show((i + slides.length) % slides.length); }

        function startAuto() {
            if (intervalId) return;
            intervalId = setInterval(next, delay);
        }
        function stopAuto() {
            if (!intervalId) return;
            clearInterval(intervalId);
            intervalId = null;
        }
        function restartAuto() { stopAuto(); startAuto(); }

        if (nextBtn) nextBtn.addEventListener('click', () => { next(); restartAuto(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restartAuto(); });

        const hero = document.querySelector('.hero');
        hero.addEventListener('mouseenter', stopAuto);
        hero.addEventListener('mouseleave', startAuto);
        hero.addEventListener('focusin', stopAuto);
        hero.addEventListener('focusout', startAuto);

        show(0);
        if (slides.length > 1) startAuto();
    }

    document.addEventListener('DOMContentLoaded', () => {
        // wait for nav (header may be injected)
        waitFor('nav', 4000).then(() => {
            try { initNav(); } catch (e) { console.warn('initNav error', e); }
            try { initSlideshow(); } catch (e) { console.warn('initSlideshow error', e); }
        }).catch(() => {
            // fallback init
            try { initNav(); } catch (e) { }
            try { initSlideshow(); } catch (e) { }
        });
    });
})();

// Responsive hamburger + submenu toggle (works if inserted into main.js)
document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    const container = header ? header.querySelector('.container') : null;
    let toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('header nav');

    if (!header || !nav || !container) return;

    // if nav-toggle missing, create it automatically
    if (!toggle) {
        toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Mở menu');
        toggle.innerHTML = '<span class="sr-only">Mở menu</span><span class="bar"></span><span class="bar"></span><span class="bar"></span>';
        // append to container (after logo-area if exists)
        const logo = container.querySelector('.logo-area');
        if (logo && logo.nextSibling) container.insertBefore(toggle, logo.nextSibling);
        else container.appendChild(toggle);
    }

    // toggle main nav
    toggle.addEventListener('click', function (e) {
        const opened = header.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        // optional: collapse any opened submenus when closing main nav
        if (!opened) {
            document.querySelectorAll('nav ul.main-menu li.open').forEach(li => li.classList.remove('open'));
        }
    });

    // prepare submenu toggles for top-level li
    document.querySelectorAll('nav ul.main-menu > li').forEach(function (li) {
        const sub = li.querySelector('ul');
        if (sub) {
            li.classList.add('has-children');
            const parentA = li.querySelector('a');

            parentA.addEventListener('click', function (ev) {
                // intercept on small screens to toggle submenu
                if (window.innerWidth <= 1024) {
                    ev.preventDefault();      // first tap opens submenu
                    li.classList.toggle('open');
                }
                // on desktop, allow normal navigation
            });
        }
    });

    // close menu if click outside (mobile)
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 1024 && header.classList.contains('nav-open')) {
            if (!e.target.closest('header')) {
                header.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
                document.querySelectorAll('nav ul.main-menu li.open').forEach(li => li.classList.remove('open'));
            }
        }
    });

    // reset states on resize (desktop)
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth > 1024) {
                header.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
                document.querySelectorAll('nav ul.main-menu li.open').forEach(li => li.classList.remove('open'));
                nav.style.maxHeight = null;
            }
        }, 120);
    });
});

