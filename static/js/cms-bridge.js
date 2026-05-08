/**
 * Cast & Plan · CMS Data Bridge
 * Carga los datos del CMS (archivos JSON en /_data/) e inyecta
 * la configuración en el portal al momento de cargar la página.
 *
 * Este archivo se carga en index.html justo antes del cierre </body>
 */

(function() {
  'use strict';

  const BASE = '/_data';

  // ─── Utilidades ───────────────────────────────────────────────────────────

  /** Fetch JSON con fallback silencioso */
  async function fetchJSON(path) {
    try {
      const r = await fetch(path + '?v=' + Date.now());
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  /** Lista todos los archivos JSON de una carpeta (vía un manifest generado por Netlify) */
  async function fetchActores() {
    // Netlify sirve el directorio como listado si no hay index
    // Intentamos cargar un manifest o hacemos fetch directo de los conocidos
    // Mejor: cargamos un index.json que Netlify genera (si existe)
    const index = await fetchJSON(BASE + '/actores/_index.json');
    if (index && Array.isArray(index.files)) {
      const promises = index.files.map(f => fetchJSON(BASE + '/actores/' + f));
      const results = await Promise.all(promises);
      return results.filter(Boolean);
    }
    // Fallback: no hay index, retorna vacío (el portal usa localStorage)
    return [];
  }

  // ─── Carga principal ──────────────────────────────────────────────────────

  async function loadCMSData() {
    const [config, limitless, misiones, recompensas] = await Promise.all([
      fetchJSON(BASE + '/config.json'),
      fetchJSON(BASE + '/limitless.json'),
      fetchJSON(BASE + '/misiones.json'),
      fetchJSON(BASE + '/recompensas.json'),
    ]);

    // 1. Aplicar colores y configuración global
    if (config) {
      applyGlobalConfig(config);
    }

    // 2. Cargar actores desde CMS y mezclar con localStorage
    const cmsActores = await fetchActores();
    if (cmsActores.length > 0) {
      mergeCMSActores(cmsActores);
    }

    // 3. Cargar noticias del CMS
    const noticias = await fetchNoticiasFromCMS();
    if (noticias.length > 0) {
      mergeCMSNoticias(noticias);
    }

    // 4. Cargar sponsors del CMS
    const sponsors = await fetchSponsorsFromCMS();
    if (sponsors.length > 0) {
      mergeCMSSponsors(sponsors);
    }

    // 5. Aplicar datos de Limitless
    if (limitless) {
      applyLimitlessData(limitless);
    }

    // 6. Aplicar misiones y recompensas
    if (misiones && misiones.misiones) {
      applyCMSMisiones(misiones.misiones);
    }
    if (recompensas && recompensas.recompensas) {
      applyCMSRecompensas(recompensas.recompensas);
    }

    // 7. Disparar re-render del portal
    triggerPortalRefresh();
  }

  // ─── Aplicar configuración global ─────────────────────────────────────────

  function applyGlobalConfig(config) {
    const root = document.documentElement;

    if (config.color_rojo)    root.style.setProperty('--red',    config.color_rojo);
    if (config.color_azul)    root.style.setProperty('--blue',   config.color_azul);
    if (config.color_amarillo) root.style.setProperty('--yellow', config.color_amarillo);
    if (config.color_verde)   root.style.setProperty('--green',  config.color_verde);
    if (config.color_morado)  root.style.setProperty('--purple', config.color_morado);

    // Guardar en localStorage para que el portal lo use
    const existing = JSON.parse(localStorage.getItem('castplan_config') || '{}');
    const merged = Object.assign({}, existing, {
      nombre:    config.nombre    || existing.nombre    || 'Cast & Plan',
      anio:      config.anio      || existing.anio      || '2026',
      subtitulo: config.subtitulo || existing.subtitulo || 'by Liz · Content Dashboard',
    });
    if (config.gas_url)     merged.gasUrl    = config.gas_url;
    if (config.calendar_id) merged.calMainId = config.calendar_id;

    localStorage.setItem('castplan_config', JSON.stringify(merged));

    // Actualizar textos visibles si ya están en el DOM
    const brandEl = document.querySelector('.sidebar-header .brand');
    if (brandEl && config.nombre) {
      // No reemplazamos el DOM completo para no romper el HTML inline
    }
  }

  // ─── Actores ───────────────────────────────────────────────────────────────

  function mergeCMSActores(cmsActores) {
    // El portal guarda actores en localStorage con clave 'castplan_actors'
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem('castplan_actors') || '[]');
    } catch(e) {}

    // Para cada actor del CMS, actualizar o agregar en localStorage
    cmsActores.forEach(cmsActor => {
      if (!cmsActor.id || !cmsActor.activo) return;

      const idx = existing.findIndex(a => a.id === cmsActor.id);
      const mapped = {
        id:         cmsActor.id,
        name:       cmsActor.nombre || cmsActor.id,
        photo:      cmsActor.foto   || '',
        tiktok:     cmsActor.tiktok || '',
        instagram:  cmsActor.instagram || '',
        youtube:    cmsActor.youtube || '',
        email:      cmsActor.email  || '',
        bio:        cmsActor.bio    || '',
        color:      cmsActor.color  || '#e8192c',
        calId:      cmsActor.calendar_id || '',
        _cms: true  // marcador para identificar actores del CMS
      };

      if (idx >= 0) {
        // Actualizar campos que vienen del CMS, preservar datos de contenido (posts, stats)
        Object.assign(existing[idx], mapped);
      } else {
        existing.push(mapped);
      }
    });

    localStorage.setItem('castplan_actors', JSON.stringify(existing));
  }

  // ─── Noticias ──────────────────────────────────────────────────────────────

  async function fetchNoticiasFromCMS() {
    const index = await fetchJSON(BASE + '/noticias/_index.json');
    if (!index || !Array.isArray(index.files)) return [];
    const promises = index.files.map(f => fetchJSON(BASE + '/noticias/' + f));
    const results = await Promise.all(promises);
    return results.filter(Boolean);
  }

  function mergeCMSNoticias(cmsNoticias) {
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem('castplan_news') || '[]');
    } catch(e) {}

    cmsNoticias.forEach(n => {
      if (!n.titulo) return;
      const cmsId = 'cms_' + (n.titulo || '').toLowerCase().replace(/\s+/g, '_').slice(0,30);
      const idx = existing.findIndex(x => x.id === cmsId);
      const mapped = {
        id:       cmsId,
        title:    n.titulo || '',
        body:     n.cuerpo || '',
        ts:       n.fecha ? new Date(n.fecha).getTime() : Date.now(),
        pinned:   !!n.pinned,
        notified: !!n.notificar,
        _cms: true
      };
      if (idx >= 0) {
        Object.assign(existing[idx], mapped);
      } else {
        existing.push(mapped);
      }
    });

    localStorage.setItem('castplan_news', JSON.stringify(existing));
  }

  // ─── Sponsors ──────────────────────────────────────────────────────────────

  async function fetchSponsorsFromCMS() {
    const index = await fetchJSON(BASE + '/sponsors/_index.json');
    if (!index || !Array.isArray(index.files)) return [];
    const promises = index.files.map(f => fetchJSON(BASE + '/sponsors/' + f));
    const results = await Promise.all(promises);
    return results.filter(Boolean);
  }

  function mergeCMSSponsors(cmsSponsors) {
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem('castplan_sponsors') || '[]');
    } catch(e) {}

    cmsSponsors.forEach(sp => {
      if (!sp.sponsor || !sp.titulo) return;
      const cmsId = 'cms_' + (sp.sponsor + '_' + sp.titulo).toLowerCase().replace(/\s+/g,'_').slice(0,40);
      const idx = existing.findIndex(x => x.id === cmsId);
      const mapped = {
        id:       cmsId,
        sponsor:  sp.sponsor   || '',
        title:    sp.titulo    || '',
        desc:     sp.descripcion || '',
        xp:       sp.xp        || 50,
        deadline: sp.deadline  || '',
        assigned: Array.isArray(sp.asignados) ? sp.asignados.map(a => a.actor_id || a) : [],
        completedBy: (idx >= 0 && existing[idx].completedBy) ? existing[idx].completedBy : [],
        ts:       Date.now(),
        _cms: true
      };
      if (idx >= 0) {
        Object.assign(existing[idx], mapped);
      } else {
        existing.push(mapped);
      }
    });

    localStorage.setItem('castplan_sponsors', JSON.stringify(existing));
  }

  // ─── Limitless ─────────────────────────────────────────────────────────────

  function applyLimitlessData(data) {
    const existing = JSON.parse(localStorage.getItem('castplan_limitless') || '{}');
    const merged = Object.assign({}, existing, {
      photo:     data.foto      || existing.photo     || '',
      tiktok:    data.tiktok    || existing.tiktok    || '',
      instagram: data.instagram || existing.instagram || '',
      youtube:   data.youtube   || existing.youtube   || '',
      bio:       data.bio       || existing.bio       || '',
    });
    localStorage.setItem('castplan_limitless', JSON.stringify(merged));
  }

  // ─── Misiones & Recompensas ────────────────────────────────────────────────

  function applyCMSMisiones(misiones) {
    const mapped = misiones.map((m, i) => ({
      id: 'cms_mission_' + i,
      icon:  m.icon  || '🎯',
      title: m.titulo || '',
      desc:  m.descripcion || '',
      xp:    m.xp   || 10,
      _cms: true
    }));

    // Solo sobrescribe si tiene datos
    if (mapped.length > 0) {
      localStorage.setItem('castplan_missions', JSON.stringify(mapped));
    }
  }

  function applyCMSRecompensas(recompensas) {
    const mapped = recompensas.map(r => ({
      emoji: r.emoji  || '🎁',
      name:  r.nombre || '',
      req:   r.req    || 5,
      _cms: true
    }));
    if (mapped.length > 0) {
      localStorage.setItem('castplan_rewards', JSON.stringify(mapped));
    }
  }

  // ─── Trigger re-render ─────────────────────────────────────────────────────

  function triggerPortalRefresh() {
    // Disparar eventos que el portal escucha para re-renderizar
    window.dispatchEvent(new CustomEvent('castplan:cms_loaded'));

    // Si hay funciones de render expuestas globalmente, llamarlas
    const fns = [
      'renderOverview',
      'renderEdActorsList',
      'renderEdNewsList',
      'renderEdSponsorsList',
      'renderAdminMissions',
      'pcInjectIntoSidebar'
    ];
    fns.forEach(fn => {
      if (typeof window[fn] === 'function') {
        try { window[fn](); } catch(e) {}
      }
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Espera un poco para que el portal inicialice primero
      setTimeout(loadCMSData, 500);
    });
  } else {
    setTimeout(loadCMSData, 500);
  }

  // Exponer para debug
  window.CastPlanCMS = { reload: loadCMSData };

})();
