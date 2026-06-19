(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupSiteSearch() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    var hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }

    show(0);
    start();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var year = root.querySelector("[data-filter-year]");
      var type = root.querySelector("[data-filter-type]");
      var empty = root.querySelector("[data-empty-state]");
      var container = root.nextElementSibling;
      var cards = [];
      while (container && cards.length === 0) {
        cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
        container = container.nextElementSibling;
      }
      if (!cards.length) {
        return;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-title") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (yearValue && cardYear.indexOf(yearValue) === -1) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var preset = params.get("q");
      if (preset && input) {
        input.value = preset;
      }
      apply();
    });
  }

  function loadHlsRuntime() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var current = document.querySelector("script[data-hls-runtime]");
      if (current) {
        current.addEventListener("load", function () {
          resolve(window.Hls);
        });
        current.addEventListener("error", reject);
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.async = true;
      script.setAttribute("data-hls-runtime", "true");
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  window.setupStreamPlayer = function (videoId, buttonId, layerId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var layer = document.getElementById(layerId);
    var message = layer ? layer.querySelector(".player-message") : null;
    var attached = false;
    var hlsInstance = null;

    if (!video || !button || !layer || !streamUrl) {
      return;
    }

    function setMessage(value) {
      if (message) {
        message.textContent = value;
      }
    }

    function attachStream() {
      if (attached) {
        return Promise.resolve();
      }
      setMessage("正在载入");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        attached = true;
        return Promise.resolve();
      }
      return loadHlsRuntime().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          attached = true;
          return;
        }
        throw new Error("unsupported");
      });
    }

    function start() {
      attachStream().then(function () {
        layer.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            layer.classList.remove("is-hidden");
            setMessage("点击播放");
          });
        }
      }).catch(function () {
        layer.classList.remove("is-hidden");
        setMessage("视频暂时无法播放");
      });
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      start();
    });

    layer.addEventListener("click", function (event) {
      if (event.target !== button) {
        start();
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      layer.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      layer.classList.remove("is-hidden");
      setMessage("点击播放");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupSiteSearch();
    setupHero();
    setupFilters();
  });
})();
