(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu-movil');
  const setMenu = open => {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuButton.focus(); }
  });
  window.addEventListener('resize', () => { if (innerWidth > 900) setMenu(false); });
  document.getElementById('anio').textContent = String(new Date().getFullYear());

  const navLinks = [...document.querySelectorAll('.nav a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => {
          if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }

  const gallery = [...document.querySelectorAll('[data-gallery]')];
  const dialog = document.getElementById('visor');
  const image = document.getElementById('visor-imagen');
  let current = 0;
  let returnFocus;
  const showImage = index => {
    current = (index + gallery.length) % gallery.length;
    const item = gallery[current];
    image.src = item.href;
    image.alt = item.querySelector('img').alt;
    document.getElementById('visor-titulo').textContent = item.closest('article').querySelector('h3').textContent;
    document.getElementById('visor-contador').textContent = `${current + 1} / ${gallery.length} · Imagen ilustrativa`;
  };
  if (typeof dialog.showModal === 'function') {
    gallery.forEach((item, index) => item.addEventListener('click', e => {
      e.preventDefault(); returnFocus = item; showImage(index);
      dialog.showModal(); document.body.classList.add('modal-open');
      document.getElementById('visor-cerrar').focus();
    }));
    document.getElementById('visor-cerrar').addEventListener('click', () => dialog.close());
    document.getElementById('visor-anterior').addEventListener('click', () => showImage(current - 1));
    document.getElementById('visor-siguiente').addEventListener('click', () => showImage(current + 1));
    dialog.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showImage(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showImage(current + 1); }
    });
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (returnFocus) returnFocus.focus();
    });
  }

  const form = document.getElementById('cotizacion');
  const status = document.getElementById('form-estado');
  const button = form.querySelector('[type="submit"]');
  let submitting = false;
  form.addEventListener('submit', async e => {
    if (!window.fetch || !window.FormData) return;
    e.preventDefault();
    if (submitting || !form.reportValidity()) return;
    submitting = true; button.disabled = true;
    button.querySelector('span').textContent = 'Enviando solicitud…';
    status.className = 'form-status'; status.textContent = 'Estamos enviando tu solicitud.';
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(form.action, {
        method: 'POST', body: new FormData(form),
        headers: { Accept: 'application/json' }, credentials: 'same-origin', signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        const invalid = (result.fields || []).map(id => document.getElementById(id)).filter(Boolean);
        invalid.forEach(el => el.setAttribute('aria-invalid', 'true'));
        status.className = 'form-status error';
        status.textContent = result.message || 'No pudimos enviar la solicitud. Inténtalo nuevamente o llámanos al 81 2389 5162.';
        if (invalid.length) invalid[0].focus(); else status.focus();
      } else {
        form.reset(); status.className = 'form-status success';
        status.textContent = result.message; status.focus();
      }
    } catch (_) {
      status.className = 'form-status error';
      status.textContent = 'No pudimos confirmar el envío. Tus datos permanecen en el formulario. Inténtalo nuevamente o llámanos al 81 2389 5162.';
      status.focus();
    } finally {
      clearTimeout(timeout); submitting = false; button.disabled = false;
      button.querySelector('span').textContent = 'Enviar solicitud';
    }
  });
})();
