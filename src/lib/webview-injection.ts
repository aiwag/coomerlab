// This file centralizes the complex script injected into each webview.

export const webviewInjectionScript = `
(function(){
  try {
    // Part 1: Aggressive UI Hiding
    document.body.style.backgroundColor='black';
    document.body.style.margin='0';
    document.body.style.overflow='hidden';
    [
      '#header','.footer-holder','.RoomSignupPopup','#roomTabs','.playerTitleBar',
      '.genderTabs','#TheaterModePlayer > div:nth-child(8)','.video-overlay',
      '.video-controls','.chat-container','.chat-panel','.bio-section',
      '.tip-menu','.tip-button','.header-container'
    ].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.style.setProperty('display', 'none', 'important'));
    });

    const makeVideoFullscreen = () => {
      const video = document.querySelector('video') || document.querySelector('#chat-player_html5_api');
      if (video) {
        video.style.position='fixed'; video.style.top='0'; video.style.left='0';
        video.style.width='100vw'; video.style.height='100vh';
        video.style.objectFit='cover'; video.style.zIndex='1';
      }
    };
    makeVideoFullscreen();
    setInterval(makeVideoFullscreen, 2000);

    // Part 2: Persistent Autoplay Trigger
    let attempts = 0;
    const playInterval = setInterval(() => {
      const video = document.querySelector('video');
      const playButton = document.querySelector('.vjs-big-play-button');
      
      if (video) {
        // Start muted to ensure autoplay works in most environments
        video.muted = true;
        video.play().then(() => {
          // Send a message back to the host, then stop trying
          window.electron.ipcRenderer.sendToHost('webview-ready');
          clearInterval(playInterval);
        }).catch(() => {
          // If play() fails, try clicking a play button if it exists
          if (playButton) playButton.click();
        });
      } else if (playButton) {
         playButton.click();
      }
      
      attempts++;
      if (attempts > 20) { // Stop after 10 seconds
        clearInterval(playInterval);
      }
    }, 500);

  } catch (e) { console.error('Injection Error:', e); }
})();
`;