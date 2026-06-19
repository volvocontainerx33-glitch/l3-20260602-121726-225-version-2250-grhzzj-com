(function () {
  var configEl = document.getElementById("play-config");
  var video = document.getElementById("movie-video");
  var button = document.getElementById("movie-play");
  var shell = document.querySelector(".video-shell");

  if (!configEl || !video || !button || !shell) {
    return;
  }

  var config = {};
  var hls = null;
  var ready = false;

  try {
    config = JSON.parse(configEl.textContent || "{}");
  } catch (error) {
    config = {};
  }

  function loadSource() {
    if (ready || !config.src) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.src;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(config.src);
      hls.attachMedia(video);
      ready = true;
    }
  }

  function startPlayback() {
    loadSource();
    shell.classList.add("is-playing");
    button.classList.add("is-hidden");
    video.setAttribute("controls", "controls");

    var playTask = video.play();

    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        shell.classList.remove("is-playing");
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    startPlayback();
  });

  video.addEventListener("click", function () {
    if (!ready || video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    shell.classList.add("is-playing");
    button.classList.add("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
})();
