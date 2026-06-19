(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = $('[data-nav-toggle]');
    var links = $('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    start();
  }

  function initFilters() {
    var grid = $('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var cards = $all('.js-movie-card', grid);
    var searchInput = $('[data-search-input]');
    var categorySelect = $('[data-filter-category]');
    var regionSelect = $('[data-filter-region]');
    var typeSelect = $('[data-filter-type]');
    var clearButton = $('[data-clear-filters]');
    var resultCount = $('[data-result-count]');
    var params = new URLSearchParams(window.location.search);

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    function valueOf(control) {
      return control ? control.value : 'all';
    }

    function includesText(haystack, needle) {
      return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    }

    function apply() {
      var query = searchInput ? searchInput.value.trim() : '';
      var category = valueOf(categorySelect);
      var region = valueOf(regionSelect);
      var type = valueOf(typeSelect);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ');
        var matchQuery = !query || includesText(haystack, query);
        var matchCategory = category === 'all' || card.getAttribute('data-category') === category;
        var matchRegion = region === 'all' || card.getAttribute('data-region') === region;
        var matchType = type === 'all' || includesText(card.getAttribute('data-type') || '', type);
        var matched = matchQuery && matchCategory && matchRegion && matchType;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = '当前显示 ' + visible + ' 部作品';
      }
    }

    [searchInput, categorySelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        [categorySelect, regionSelect, typeSelect].forEach(function (control) {
          if (control) {
            control.value = 'all';
          }
        });
        apply();
      });
    }

    apply();
  }

  function initPlayers() {
    $all('.js-player').forEach(function (shell) {
      var video = $('video', shell);
      var startButton = $('[data-player-start]', shell);
      var src = shell.getAttribute('data-src');
      if (!video || !src) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }

      function playVideo() {
        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (startButton) {
        startButton.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
