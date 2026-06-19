(function () {
    const navButton = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-main-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        const prev = carousel.querySelector('[data-hero-prev]');
        const next = carousel.querySelector('[data-hero-next]');
        const jumps = Array.from(document.querySelectorAll('[data-hero-jump]'));
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                start();
            });
        });

        jumps.forEach(function (jump) {
            jump.addEventListener('mouseenter', function () {
                const index = Number(jump.getAttribute('data-hero-jump')) || 0;
                showSlide(index);
                start();
            });
        });

        showSlide(0);
        start();
    }

    const searchInputs = Array.from(document.querySelectorAll('.js-search'));

    searchInputs.forEach(function (input) {
        const scope = input.closest('.section-block') || document;
        const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
        const yearSelect = scope.querySelector('[data-filter-year]');
        const typeSelect = scope.querySelector('[data-filter-type]');
        const count = scope.querySelector('[data-filter-count]');

        const applyFilter = function () {
            const keyword = input.value.trim().toLowerCase();
            const year = yearSelect ? yearSelect.value : '';
            const type = typeSelect ? typeSelect.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const text = (card.getAttribute('data-search') || '').toLowerCase();
                const cardYear = card.getAttribute('data-year') || '';
                const cardType = card.getAttribute('data-type') || '';
                const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchYear = !year || cardYear.indexOf(year) === 0;
                const matchType = !type || cardType.indexOf(type) !== -1;
                const show = matchKeyword && matchYear && matchType;

                card.classList.toggle('is-hidden', !show);

                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部';
            }
        };

        input.addEventListener('input', applyFilter);

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }

        applyFilter();
    });
}());
