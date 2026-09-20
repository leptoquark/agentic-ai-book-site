/* No connection to LinkedIn until the visitor explicitly loads a post. */
(() => {
  document.querySelectorAll('.linkedin-card').forEach(card => {
    const button = card.querySelector('.linkedin-load');
    const preview = card.querySelector('.linkedin-preview');
    const frameHost = card.querySelector('.linkedin-frame');
    const close = card.querySelector('.linkedin-close');
    if (!button || !preview || !frameHost || !close) return;
    const url = new URL(button.dataset.embedUrl);
    if (url.origin !== 'https://www.linkedin.com' || !url.pathname.startsWith('/embed/feed/update/')) return;
    card.classList.add('linkedin-ready');
    button.addEventListener('click', () => {
      if (frameHost.querySelector('iframe')) return;
      const frame = document.createElement('iframe');
      frame.title = button.dataset.embedTitle;
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'no-referrer';
      frameHost.hidden = false;
      frameHost.append(frame);
      frame.src = url.href;
      preview.hidden = true;
      close.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      close.focus({preventScroll:true});
    });
    close.addEventListener('click', () => {
      frameHost.replaceChildren();
      frameHost.hidden = true;
      close.hidden = true;
      preview.hidden = false;
      button.setAttribute('aria-expanded', 'false');
      button.focus({preventScroll:true});
    });
  });
})();
