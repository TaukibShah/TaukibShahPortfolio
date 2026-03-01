/* ────────────────────────────────────────────
   TAUKIB SHAH PORTFOLIO — app.js
   Static / GitHub Pages compatible
──────────────────────────────────────────── */

// ── STATE ──────────────────────────────────
let DATA = { profile: null, skills: null, projects: [], videos: [], social: {} };

// ── FETCH ALL DATA ──────────────────────────
async function loadData() {
  try {
    const [profile, skills, projects, videos, social] = await Promise.all([
      fetchJSON('data/profile.json'),
      fetchJSON('data/skills.json'),
      fetchJSON('data/projects.json'),
      fetchJSON('data/videos.json'),
      fetchJSON('data/social.json'),
    ]);
    DATA = { profile, skills, projects, videos, social };
    init();
  } catch (e) {
    console.warn('JSON load failed — using demo data', e);
    DATA = DEMO_DATA;
    init();
  }
}

async function fetchJSON(url) {
  const r = await fetch(url + '?v=' + Date.now());
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return r.json();
}

// ── INIT ────────────────────────────────────
function init() {
  renderProfile();
  renderFeatured();
  renderAbout();
  renderSkills();
  renderProjects();
  renderVideos();
  renderContact();
  setupNav();
  setupFilters();
  document.getElementById('footerYear').textContent = new Date().getFullYear();
  animateSkillBars();
}

// ── PROFILE / HOME ──────────────────────────
function renderProfile() {
  const p = DATA.profile;
  if (!p) return;
  document.title = `${p.name} — Portfolio`;
  setText('heroName',   p.name);
  setText('heroTitle',  p.title);
  setText('heroTagline',p.tagline);
  setText('footerName', p.name);
}

// ── FEATURED ────────────────────────────────
function renderFeatured() {
  const featured = DATA.projects.filter(p => p.featured);
  const grid = document.getElementById('featuredGrid');
  grid.innerHTML = featured.map(projectCard).join('');
}

// ── ABOUT ────────────────────────────────────
function renderAbout() {
  const p = DATA.profile;
  if (!p) return;
  const img = document.getElementById('aboutImg');
  if (img) img.src = p.profileImage;
  setText('aboutText',     p.about);
  setText('aboutLocation', p.location);

  const details = document.getElementById('aboutDetails');
  details.innerHTML = `
    <div class="detail-item"><span class="detail-label">Name</span><span class="detail-value">${p.name}</span></div>
    <div class="detail-item"><span class="detail-label">Role</span><span class="detail-value">${p.title}</span></div>
    <div class="detail-item"><span class="detail-label">Location</span><span class="detail-value">${p.location}</span></div>
    <div class="detail-item"><span class="detail-label">Email</span><span class="detail-value">${p.email}</span></div>
  `;

  const emailBtn = document.getElementById('emailBtn');
  const phoneBtn = document.getElementById('phoneBtn');
  if (emailBtn) emailBtn.href = `mailto:${p.email}`;
  if (phoneBtn) phoneBtn.href = `tel:${p.phone}`;
}

// ── SKILLS ────────────────────────────────────
function renderSkills() {
  const s = DATA.skills;
  if (!s) return;
  document.getElementById('proSkills').innerHTML  = s.professional.map(skillBar).join('');
  document.getElementById('softSkills').innerHTML = s.software.map(skillBar).join('');
}

function skillBar(sk) {
  return `
    <div class="skill-item">
      <div class="skill-header">
        <span class="skill-name">${sk.name}</span>
        <span class="skill-pct">${sk.level}%</span>
      </div>
      <div class="skill-bar">
        <div class="skill-fill" data-level="${sk.level}"></div>
      </div>
    </div>`;
}

function animateSkillBars() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = bar.dataset.level + '%';
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  const el = document.getElementById('proSkills');
  if (el) observer.observe(el);
}

// ── PROJECTS ─────────────────────────────────
function renderProjects(filter = 'all') {
  const list = filter === 'all'
    ? DATA.projects
    : DATA.projects.filter(p => p.category === filter);

  document.getElementById('projectsGrid').innerHTML = list.map(projectCard).join('');
}

function projectCard(p) {
  const thumbHtml = `
    <div class="card-thumb">
      <img src="${p.thumbnail}" alt="${p.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="card-thumb-placeholder"><span class="ph-icon">🎨</span></div>
      <div class="card-overlay"><div class="card-overlay-btn">View Details</div></div>
    </div>`;

  return `
    <div class="card" onclick="openProjectModal(${p.id})">
      ${thumbHtml}
      <div class="card-body">
        <div class="card-cat">${p.category}</div>
        <div class="card-title">${p.title}</div>
        <div class="card-desc">${p.description}</div>
        <div class="card-tools">${p.tools.map(t => `<span class="tool-tag">${t}</span>`).join('')}</div>
        <div class="card-meta">
          <span class="card-year">${p.year}</span>
        </div>
      </div>
    </div>`;
}

// ── VIDEOS ────────────────────────────────────
function renderVideos() {
  document.getElementById('videosGrid').innerHTML = DATA.videos.map(videoCard).join('');
}

function videoCard(v) {
  return `
    <div class="video-card">
      <div class="video-thumb" onclick="openVideoModal(${v.id})">
        <img src="${v.thumbnail}" alt="${v.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="video-thumb-placeholder">🎬</div>
        <div class="play-btn"></div>
        <div class="video-duration">${v.duration}</div>
      </div>
      <div class="video-body">
        <div class="video-title">${v.title}</div>
        <div class="video-desc">${v.description}</div>
        <div class="video-meta">
          <div class="video-sw">${v.software.map(s => `<span class="sw-tag">${s}</span>`).join('')}</div>
          <span>${v.year}</span>
        </div>
      </div>
    </div>`;
}

// ── CONTACT ───────────────────────────────────
function renderContact() {
  const p = DATA.profile;
  const s = DATA.social;
  if (!p) return;

  document.getElementById('contactItems').innerHTML = `
    <div class="contact-item">
      <div class="c-icon">✉️</div>
      <div><div class="c-label">Email</div><div class="c-value">${p.email}</div></div>
    </div>
    <div class="contact-item">
      <div class="c-icon">📞</div>
      <div><div class="c-label">Phone</div><div class="c-value">${p.phone}</div></div>
    </div>
    <div class="contact-item">
      <div class="c-icon">📍</div>
      <div><div class="c-label">Location</div><div class="c-value">${p.location}</div></div>
    </div>`;

  const socials = [];
  if (s.instagram) socials.push(`<a class="social-link" href="${s.instagram}" target="_blank" rel="noopener">📷 Instagram</a>`);
  if (s.linkedin)  socials.push(`<a class="social-link" href="${s.linkedin}"  target="_blank" rel="noopener">💼 LinkedIn</a>`);
  if (s.youtube)    socials.push(`<a class="social-link" href="${s.youtube}"    target="_blank" rel="noopener">📽️ Youtube</a>`);
  document.getElementById('contactSocial').innerHTML = socials.join('');
}

// ── FILTERS ──────────────────────────────────
function setupFilters() {
  const cats = ['all', ...new Set(DATA.projects.map(p => p.category))];
  const bar  = document.getElementById('filterBar');
  bar.innerHTML = cats.map(c => `
    <button class="filter-btn ${c === 'all' ? 'active' : ''}" data-filter="${c}">
      ${c === 'all' ? 'All' : c}
    </button>`).join('');

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProjects(btn.dataset.filter);
  });
}

// ── NAVIGATION ───────────────────────────────
function setupNav() {
  // SPA navigation via hash
  function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const page = document.getElementById(pageId);
    const link = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (page) { page.classList.add('active'); window.scrollTo(0, 0); }
    if (link)   link.classList.add('active');

    // re-run skill bars when about is shown
    if (pageId === 'about') setTimeout(animateSkillBars, 200);

    // close mobile menu
    document.getElementById('navLinks').classList.remove('open');
  }

  // nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigate(link.dataset.page);
      history.pushState(null, '', '#' + link.dataset.page);
    });
  });

  // data-nav buttons
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-nav]');
    if (btn) {
      navigate(btn.dataset.nav);
      history.pushState(null, '', '#' + btn.dataset.nav);
    }
  });

  // handle initial hash
  const hash = location.hash.replace('#', '') || 'home';
  navigate(hash);

  // mobile toggle
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  // scrolled class
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
  });

  // popstate
  window.addEventListener('popstate', () => {
    const pg = location.hash.replace('#', '') || 'home';
    navigate(pg);
  });
}

// ── MODALS ────────────────────────────────────
function openProjectModal(id) {
  const p = DATA.projects.find(x => x.id === id);
  if (!p) return;

  const img = p.thumbnail
    ? `<img class="modal-img" src="${p.thumbnail}" alt="${p.title}" onerror="this.style.background='var(--bg3)'; this.removeAttribute('src')">`
    : '';

  document.getElementById('modalBody').innerHTML = `
    ${img}
    <div class="modal-cat">${p.category}</div>
    <div class="modal-title">${p.title}</div>
    <div class="modal-desc">${p.description}</div>
    <div class="modal-meta">
      <div class="modal-meta-item"><div class="modal-meta-label">Year</div><div class="modal-meta-value">${p.year}</div></div>
      ${p.client ? `<div class="modal-meta-item"><div class="modal-meta-label">Client</div><div class="modal-meta-value">${p.client}</div></div>` : ''}
      ${p.role   ? `<div class="modal-meta-item"><div class="modal-meta-label">Role</div><div class="modal-meta-value">${p.role}</div></div>` : ''}
    </div>
    <div class="modal-tools">${p.tools.map(t => `<span class="tool-tag">${t}</span>`).join('')}</div>`;

  openModal();
}

function openVideoModal(id) {
  const v = DATA.videos.find(x => x.id === id);
  if (!v) return;

  const hasEmbed = v.youtubeEmbed && !v.youtubeEmbed.includes('VIDEO_ID');

  document.getElementById('modalBody').innerHTML = `
    ${hasEmbed
      ? `<div class="modal-video-wrap"><iframe src="${v.youtubeEmbed}" allowfullscreen></iframe></div>`
      : `<div class="modal-img" style="display:flex;align-items:center;justify-content:center;font-size:4rem;background:var(--bg3)">🎬</div>`
    }
    <div class="modal-cat">Video Edit · ${v.duration}</div>
    <div class="modal-title">${v.title}</div>
    <div class="modal-desc">${v.description}</div>
    <div class="modal-meta">
      <div class="modal-meta-item"><div class="modal-meta-label">Year</div><div class="modal-meta-value">${v.year}</div></div>
      <div class="modal-meta-item"><div class="modal-meta-label">Duration</div><div class="modal-meta-value">${v.duration}</div></div>
    </div>
    <div class="modal-tools">${v.software.map(s => `<span class="tool-tag">${s}</span>`).join('')}</div>`;

  openModal();
}

function openModal() {
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
  // stop video if playing
  const iframe = document.querySelector('#modalBody iframe');
  if (iframe) { const s = iframe.src; iframe.src = ''; iframe.src = s; }
}

// close on ESC
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── FORM ─────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  const form    = e.target;
  const name    = form.querySelector('input[type="text"]').value;
  const email   = form.querySelector('input[type="email"]').value;
  const subject = form.querySelectorAll('input[type="text"]')[1]?.value || 'Portfolio Inquiry';
  const message = form.querySelector('textarea').value;

  const mailTo = `mailto:${DATA.profile?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
  window.location.href = mailTo;
}

// ── HELPERS ───────────────────────────────────
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '';
}

// ── DEMO DATA (fallback when no server) ───────
const DEMO_DATA = {
  profile: {
    name: "Taukib Shah",
    title: "Graphic Designer & Video Editor",
    location: "Seloo, Wardha, India",
    email: "taukibshah105@gmail.com",
    phone: "+91 9421693896",
    tagline: "Creating visually engaging designs and cinematic video edits.",
    about: "I am a graphic designer and video editor passionate about graphics, illustration, and motion visuals. I enjoy teamwork, creative problem-solving, and delivering professional-quality work that resonates with audiences.",
    profileImage: "assets/images/profile.jpg"
  },
  skills: {
    professional: [
      { name: "Creativity",     level: 90 },
      { name: "Communication",  level: 85 },
      { name: "Teamwork",       level: 88 },
      { name: "Leadership",     level: 75 },
      { name: "Management",     level: 80 }
    ],
    software: [
      { name: "Photoshop",     level: 90 },
      { name: "Illustrator",   level: 85 },
      { name: "After Effects", level: 80 },
      { name: "Premiere Pro",  level: 88 },
      { name: "Canva",         level: 92 }
    ]
  },
  projects: [
    { id:1, title:"Animated Wedding Invitation", category:"Motion Graphics", thumbnail:"", description:"Custom animated wedding invitation tailored to client branding.", tools:["After Effects","Illustrator"], client:"Private Client", role:"Motion Designer", year:"2024", featured:true },
    { id:2, title:"College Event Poster",        category:"Graphic Design",  thumbnail:"", description:"Promotional poster designed for college cultural event.", tools:["Photoshop"], client:"College Dept", role:"Designer", year:"2023", featured:true },
    { id:3, title:"Brand Identity Package",      category:"Branding",        thumbnail:"", description:"Complete brand identity including logo, color palette, and guidelines.", tools:["Illustrator","Photoshop"], client:"Local Business", role:"Brand Designer", year:"2024", featured:true },
    { id:4, title:"Social Media Kit",            category:"Graphic Design",  thumbnail:"", description:"Cohesive social media template kit for Instagram and Facebook.", tools:["Canva","Photoshop"], client:"Startup Brand", role:"Designer", year:"2023", featured:false },
    { id:5, title:"Product Launch Campaign",     category:"Motion Graphics", thumbnail:"", description:"Animated product launch visuals with kinetic typography.", tools:["After Effects","Illustrator"], client:"E-Commerce Brand", role:"Motion Designer", year:"2024", featured:false },
    { id:6, title:"Festival Brochure",           category:"Graphic Design",  thumbnail:"", description:"Tri-fold festival brochure with illustrated artwork.", tools:["Illustrator","Photoshop"], client:"Cultural Committee", role:"Designer", year:"2023", featured:false }
  ],
  videos: [
    { id:1, title:"Promo Video Edit",       thumbnail:"", youtubeEmbed:"", software:["Premiere Pro","After Effects"], duration:"1:20", description:"Promotional video with cinematic transitions and color grading.", year:"2024", featured:true },
    { id:2, title:"Event Highlight Reel",   thumbnail:"", youtubeEmbed:"", software:["Premiere Pro"],                 duration:"2:10", description:"Event highlights with dynamic cuts and motion graphics.", year:"2023", featured:true },
    { id:3, title:"Wedding Cinematic Film", thumbnail:"", youtubeEmbed:"", software:["Premiere Pro","After Effects"], duration:"4:45", description:"Cinematic wedding film with elegant transitions.", year:"2024", featured:false },
    { id:4, title:"Brand Story Reel",       thumbnail:"", youtubeEmbed:"", software:["After Effects","Premiere Pro"], duration:"0:55", description:"Short brand story combining motion graphics with live footage.", year:"2024", featured:false }
  ],
  social: {
    instagram: "https://instagram.com/taukibshah",
    behance: "",
    linkedin: "",
    github: ""
  }
};

// ── START ─────────────────────────────────────
loadData();
