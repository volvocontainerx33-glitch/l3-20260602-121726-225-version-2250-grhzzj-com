document.addEventListener("DOMContentLoaded", function () {
  var input = document.querySelector("[data-search-input]");
  var grid = document.querySelector("[data-search-results]");
  var region = document.querySelector("[data-search-region]");
  var type = document.querySelector("[data-search-type]");

  if (!input || !grid || !Array.isArray(window.MOVIE_INDEX)) {
    return;
  }

  function createCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class="movie-card">" +
      "<a href="" + movie.url + "" class="poster-link" aria-label="" + escapeHtml(movie.title) + "">" +
      "<img src="" + movie.cover + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
      "<span class="play-badge">播放</span>" +
      "</a>" +
      "<div class="card-body">" +
      "<a class="card-title" href="" + movie.url + "">" + escapeHtml(movie.title) + "</a>" +
      "<p class="card-meta">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
      "<p class="card-desc">" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class="tag-row">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        """: "&quot;"
      }[char];
    });
  }

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var selectedRegion = region ? region.value : "";
    var selectedType = type ? type.value : "";

    var results = window.MOVIE_INDEX.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" ").toLowerCase();
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var regionMatch = !selectedRegion || movie.region === selectedRegion;
      var typeMatch = !selectedType || movie.type === selectedType;
      return keywordMatch && regionMatch && typeMatch;
    }).slice(0, 120);

    grid.innerHTML = results.length ? results.map(createCard).join("") : "<div class="empty-state">没有找到匹配影片</div>";
  }

  input.addEventListener("input", render);
  if (region) {
    region.addEventListener("change", render);
  }
  if (type) {
    type.addEventListener("change", render);
  }

  render();
});
