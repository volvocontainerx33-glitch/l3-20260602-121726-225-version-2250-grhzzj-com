(function () {
  var nav = document.querySelector('[data-main-nav]');
  var toggle = document.querySelector('[data-menu-toggle]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 500);
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = parseInt(dot.getAttribute('data-hero-dot'), 10);
        showSlide(next);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

  scopes.forEach(function (scope) {
    var list = scope.parentElement.querySelector('[data-card-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var search = scope.querySelector('[data-filter-search]');
    var region = scope.querySelector('[data-filter-region]');
    var type = scope.querySelector('[data-filter-type]');
    var year = scope.querySelector('[data-filter-year]');
    var category = scope.querySelector('[data-filter-category]');
    var empty = scope.parentElement.querySelector('[data-empty-note]');

    function fillSelect(select, attr, formatter) {
      if (!select) {
        return;
      }

      var existing = Array.prototype.map.call(select.options, function (option) {
        return option.value;
      });
      var values = cards
        .map(function (card) {
          return card.getAttribute(attr) || '';
        })
        .filter(Boolean)
        .filter(function (value, index, array) {
          return array.indexOf(value) === index;
        })
        .sort(function (a, b) {
          if (attr === 'data-year') {
            return parseInt(b, 10) - parseInt(a, 10);
          }

          return a.localeCompare(b, 'zh-Hans-CN');
        });

      values.forEach(function (value) {
        if (existing.indexOf(value) !== -1) {
          return;
        }

        var option = document.createElement('option');
        option.value = value;
        option.textContent = formatter ? formatter(value) : value;
        select.appendChild(option);
      });
    }

    fillSelect(region, 'data-region');
    fillSelect(type, 'data-type');
    fillSelect(year, 'data-year');

    function applyFilter() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var selectedRegion = region ? region.value : 'all';
      var selectedType = type ? type.value : 'all';
      var selectedYear = year ? year.value : 'all';
      var selectedCategory = category ? category.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var matched = true;
        matched = matched && (!query || text.indexOf(query) !== -1);
        matched = matched && (selectedRegion === 'all' || card.getAttribute('data-region') === selectedRegion);
        matched = matched && (selectedType === 'all' || card.getAttribute('data-type') === selectedType);
        matched = matched && (selectedYear === 'all' || card.getAttribute('data-year') === selectedYear);
        matched = matched && (selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory);

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, region, type, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
