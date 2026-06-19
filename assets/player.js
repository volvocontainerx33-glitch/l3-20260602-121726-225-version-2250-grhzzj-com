import { H as Hls } from './hls-dru42stk.js';

const setupPlayer = function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');

    if (!video || !button) {
        return;
    }

    const source = video.getAttribute('data-video-src');
    let hlsInstance = null;

    const loadSource = function () {
        if (!source || video.dataset.loaded === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        video.dataset.loaded = 'true';
        video.setAttribute('controls', 'controls');
    };

    const playVideo = function () {
        loadSource();
        button.classList.add('is-hidden');

        const promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    };

    button.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
        if (video.dataset.loaded !== 'true') {
            playVideo();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
};

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
});
