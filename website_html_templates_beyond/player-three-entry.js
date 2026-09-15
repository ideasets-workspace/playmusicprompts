// Keep file URLs out of the module and WebGL texture graph.
// A normal deferred script can run when the HTML is opened from a folder.
(() => {
  if (location.protocol === 'file:') {
    location.replace(new URL('player-launch.html', location.href).href);
    return;
  }
  const player = document.createElement('script');
  player.type = 'module';
  player.src = 'player-three.js';
  player.addEventListener('error', () => {
    location.replace(new URL('player-launch.html', location.href).href);
  }, {once: true});
  document.head.append(player);
})();
