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

        // Accordion submenu
        header.querySelectorAll(".main-menu .has-children > a").forEach(link => {
            link.addEventListener("click", (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    link.parentElement.classList.toggle("open");
                    console.log("👉 Toggle submenu:", link.textContent.trim());
                }
            });
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
