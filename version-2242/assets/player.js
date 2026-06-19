import { H as Hls } from './hls-dru42stk.js';

function attachPlayer(box) {
  var video = box.querySelector('video');
  var button = box.querySelector('[data-play-button]');
  var message = box.querySelector('[data-player-message]');
  var src = box.getAttribute('data-src');
  var poster = box.getAttribute('data-poster');
  var hlsInstance = null;

  if (!video || !button || !src) {
    return;
  }

  if (poster) {
    video.setAttribute('poster', poster);
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function startPlayback() {
    box.classList.add('is-playing');
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(function () {
        setMessage('请再次点击视频区域开始播放。');
      });
      return;
    }

    if (Hls && Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源暂时无法载入，请稍后重试。');
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
      }

      video.play().catch(function () {
        setMessage('请再次点击视频区域开始播放。');
      });
      return;
    }

    setMessage('当前浏览器不支持 HLS 播放。');
  }

  button.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      video.play().catch(function () {
        setMessage('请再次点击视频区域开始播放。');
      });
    }
  });
}

Array.prototype.slice.call(document.querySelectorAll('.js-video-player')).forEach(attachPlayer);
