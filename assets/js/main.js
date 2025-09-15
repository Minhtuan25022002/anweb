(function () {
    // ========== Slideshow ==========
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

        // tạo nút chỉ số
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
        if (hero) {
            hero.addEventListener('mouseenter', stopAuto);
            hero.addEventListener('mouseleave', startAuto);
            hero.addEventListener('focusin', stopAuto);
            hero.addEventListener('focusout', startAuto);
        }

        show(0);
        if (slides.length > 1) startAuto();
    }

    // ========== Header Mobile Menu ==========
    function initHeader(header) {
        console.log("✅ Header init");

        const toggleBtn = header.querySelector(".nav-toggle");
        const menu = header.querySelector(".main-menu");

        if (!toggleBtn || !menu) {
            console.warn("⚠️ Không tìm thấy nút toggle hoặc menu");
            return;
        }

        // Toggle main menu
        toggleBtn.addEventListener("click", () => {
            const isOpen = header.classList.toggle("nav-open");
            toggleBtn.setAttribute("aria-expanded", isOpen);
            console.log("👉 Toggle menu:", isOpen);
        });

        // Kế Toán – Thuế: chỉ bấm vào .submenu-arrow mới mở submenu, bấm vào a thì tắt menu
        const ketoanMenu = header.querySelector('.main-menu > li.has-children:nth-child(4)');
        if (ketoanMenu) {
            const ketoanLink = ketoanMenu.querySelector('a');
            const ketoanArrow = ketoanMenu.querySelector('.submenu-arrow');
            if (ketoanArrow) {
                ketoanArrow.addEventListener('click', function(e) {
                    e.preventDefault();
                    ketoanMenu.classList.toggle('open');
                });
            }
            if (ketoanLink) {
                ketoanLink.addEventListener('click', function(e) {
                    if (window.innerWidth <= 1024) {
                        header.classList.remove('nav-open');
                        document.body.classList.remove('menu-overlay');
                        // Đóng tất cả submenu khi tắt menu
                        header.querySelectorAll('.main-menu li.has-children.open').forEach(li => li.classList.remove('open'));
                    }
                });
            }
            ketoanMenu.querySelectorAll('ul a').forEach(childLink => {
                childLink.addEventListener('click', function(e) {
                    if (window.innerWidth <= 1024) {
                        header.classList.remove('nav-open');
                        document.body.classList.remove('menu-overlay');
                        header.querySelectorAll('.main-menu li.has-children.open').forEach(li => li.classList.remove('open'));
                    }
                });
            });
        }

        // Doanh Nghiệp: bấm vào chữ sẽ mở/đóng submenu như cũ
        const doanhnghiepMenu = header.querySelector('.main-menu > li.has-children');
        if (doanhnghiepMenu && !doanhnghiepMenu.querySelector('.submenu-arrow')) {
            const doanhnghiepLink = doanhnghiepMenu.querySelector('a');
            doanhnghiepLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    doanhnghiepMenu.classList.toggle('open');
                }
            });
        }

        // Khi bấm nút 3 gạch để tắt menu, remove hết class open khỏi submenu
        toggleBtn.addEventListener('click', function() {
            if (!header.classList.contains('nav-open')) {
                // menu vừa bị đóng
                header.querySelectorAll('.main-menu li.has-children.open').forEach(li => li.classList.remove('open'));
            }
        });
    }

    // ========== Bắt sự kiện ==========
    document.addEventListener("DOMContentLoaded", () => {
        try { initSlideshow(); } catch (e) { console.warn("initSlideshow error", e); }
    });

    document.addEventListener("headerLoaded", () => {
        const header = document.querySelector("header");
        if (header) {
            try { initHeader(header); } catch (e) { console.warn("initHeader error", e); }
        }
    });
})();