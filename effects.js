(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const progress = document.querySelector(".reading-progress");
  const hero = document.querySelector(".top");
  const canvas = document.querySelector(".hero-network");
  const art = document.querySelector(".hero-art");
  const bookPanel = document.querySelector(".book-panel");
  let scrolling = false;
  function updateProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0})`;
    scrolling = false;
  }
  addEventListener("scroll", () => {
    if (scrolling) return;
    scrolling = true;
    requestAnimationFrame(updateProgress);
  }, {passive:true});
  updateProgress();

  if (finePointer.matches) {
    hero.addEventListener("pointermove", event => {
      if (reduced.matches) return;
      const box = hero.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      art.style.setProperty("--hero-x", `${x * 18}px`);
      art.style.setProperty("--hero-y", `${y * 18}px`);
    }, {passive:true});
    hero.addEventListener("pointerleave", () => {
      art.style.setProperty("--hero-x","0px");
      art.style.setProperty("--hero-y","0px");
    });
    bookPanel.addEventListener("pointermove", event => {
      if (reduced.matches) return;
      const box = bookPanel.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      bookPanel.style.setProperty("--px", `${x * 100}%`);
      bookPanel.style.setProperty("--py", `${y * 100}%`);
      bookPanel.style.setProperty("--book-x", `${(0.5 - y) * 12}deg`);
      bookPanel.style.setProperty("--book-y", `${(x - 0.5) * 12}deg`);
      bookPanel.style.setProperty("--shine-x", `${x * 100}%`);
      bookPanel.style.setProperty("--shine-y", `${y * 100}%`);
    }, {passive:true});
    bookPanel.addEventListener("pointerleave", () => {
      for (const key of ["--book-x","--book-y","--shine-x","--shine-y"]) bookPanel.style.removeProperty(key);
    });
    document.querySelectorAll(".topic").forEach(card => {
      card.addEventListener("pointermove", event => {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--card-x", `${event.clientX - box.left}px`);
        card.style.setProperty("--card-y", `${event.clientY - box.top}px`);
      }, {passive:true});
    });
  }

  const context = canvas?.getContext("2d", {alpha:true});
  if (!context || reduced.matches) return;
  let width = 0, height = 0, ratio = 1, nodes = [], running = false, visible = true, frame = 0;
  const pointer = {x:-999,y:-999};
  let seed = 173;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  function resize() {
    const box = hero.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio,0,0,ratio,0,0);
    seed = 173;
    const count = width < 650 ? 25 : width < 1000 ? 42 : 66;
    nodes = Array.from({length:count}, (_, i) => ({
      x:random() * width, y:random() * height,
      phase:random() * Math.PI * 2,
      speed:.3 + random() * .7,
      radius:i % 9 === 0 ? 2.4 : 1.2
    }));
  }
  function draw(time) {
    if (!running) return;
    context.clearRect(0,0,width,height);
    const t = time * .00022;
    const positions = nodes.map(node => ({
      x:node.x + Math.sin(t * node.speed + node.phase) * 15,
      y:node.y + Math.cos(t * node.speed + node.phase) * 15,
      radius:node.radius
    }));
    for (let i = 0; i < positions.length; i++) {
      const a = positions[i];
      for (let j = i + 1; j < positions.length; j++) {
        const b = positions[j];
        const distance = Math.hypot(a.x - b.x,a.y - b.y);
        if (distance > 155) continue;
        const nearPointer = Math.min(Math.hypot(a.x - pointer.x,a.y - pointer.y),Math.hypot(b.x - pointer.x,b.y - pointer.y)) < 190;
        context.strokeStyle = nearPointer ? `rgba(255,129,80,${(1 - distance / 155) * .38})` : `rgba(170,185,205,${(1 - distance / 155) * .16})`;
        context.lineWidth = nearPointer ? 1.2 : .8;
        context.beginPath();
        context.moveTo(a.x,a.y);
        context.lineTo(b.x,b.y);
        context.stroke();
      }
      const proximity = Math.hypot(a.x - pointer.x,a.y - pointer.y);
      context.fillStyle = proximity < 165 ? "#ff9b6c" : i % 9 === 0 ? "#ff6b35" : "#b9c1ce";
      context.globalAlpha = proximity < 165 ? .9 : .42;
      context.beginPath();
      context.arc(a.x,a.y,a.radius + (proximity < 165 ? 1 : 0),0,Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
    }
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    const shouldRun = visible && !document.hidden && !reduced.matches;
    if (shouldRun === running) return;
    running = shouldRun;
    if (running) frame = requestAnimationFrame(draw);
    else cancelAnimationFrame(frame);
  }
  hero.addEventListener("pointermove", event => {
    const box = hero.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
  }, {passive:true});
  hero.addEventListener("pointerleave", () => {pointer.x = -999;pointer.y = -999});
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(hero);
  new ResizeObserver(resize).observe(hero);
  resize();
  sync();
})();
