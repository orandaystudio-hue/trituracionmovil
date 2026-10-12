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
  const header = document.querySelector('.header');
  const updateHeader = () => header.classList.toggle('solid', scrollY > 20 || !menu.hidden);
  addEventListener('scroll', updateHeader, {passive:true});
  updateHeader();

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
    const kind = item.closest('.gallery-item') ? 'Fotografía documental' : 'Imagen ilustrativa';
    document.getElementById('visor-contador').textContent = `${current + 1} / ${gallery.length} · ${kind}`;
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
  const pagesPreview = location.hostname.endsWith('.github.io');
  if (pagesPreview) {
    button.querySelector('span').textContent = 'Preparar solicitud por correo';
    document.getElementById('form-ayuda').textContent = 'Puedes preparar un correo o abrir WhatsApp con tu cotización lista para revisar y enviar.';
  }
  let submitting = false;
  const quoteLabels = {nombre:'Nombre',empresa:'Empresa',telefono:'Teléfono',correo:'Correo',material:'Material',cantidad:'Cantidad aproximada',ubicacion:'Ubicación',mensaje:'Detalles'};
  const prepareQuote = () => {
    const data = new FormData(form);
    return 'Hola, quisiera solicitar una cotización.\n\n' + Object.entries(quoteLabels).map(([key,label]) => label + ': ' + (String(data.get(key) || '').trim() || 'No indicado')).join('\n');
  };
  document.getElementById('cotizacion-whatsapp').addEventListener('click', e => {
    if (submitting || !form.reportValidity() || form.elements.sitio.value) { e.preventDefault(); return; }
    e.currentTarget.href = 'https://wa.me/528123895162?text=' + encodeURIComponent(prepareQuote());
    status.className = 'form-status';
    status.textContent = 'WhatsApp se abrirá con tu solicitud preparada. Revisa el mensaje y pulsa Enviar.';
  });
  form.addEventListener('submit', async e => {
    if (!window.fetch || !window.FormData) return;
    e.preventDefault();
    if (submitting || !form.reportValidity()) return;
    if (pagesPreview) {
      const draft = prepareQuote();
      const subject = 'Cotización de servicio de trituración';
      document.getElementById('borrador-app').href = 'mailto:trituracionmovil.mty@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(draft);
      const gmail = new URL('https://mail.google.com/mail/');
      gmail.search = new URLSearchParams({view:'cm',fs:'1',to:'trituracionmovil.mty@gmail.com',su:subject,body:draft}).toString();
      document.getElementById('borrador-gmail').href = gmail.href;
      document.getElementById('correo-borrador').hidden = false;
      status.className = 'form-status';
      status.textContent = 'Solicitud preparada. Elige tu aplicación de correo o Gmail para revisarla y enviarla.';
      document.getElementById('borrador-app').focus();
      return;
    }
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
      button.querySelector('span').textContent = 'Enviar por correo';
    }
  });
})();
