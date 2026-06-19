function initMoviePlayer(video, layer, source) {
  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (video.dataset.ready === "1") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.dataset.ready = "1";
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      video.dataset.ready = "1";
      return;
    }

    video.src = source;
    video.dataset.ready = "1";
  }

  function startPlay() {
    attachSource();
    if (layer) {
      layer.classList.add("hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  video.addEventListener("click", startPlay);
  if (layer) {
    layer.addEventListener("click", startPlay);
  }
}
