// js/app.js
class DisplaySystem {
    constructor() {
        this.currentUser = null;
        this.announcements = this.loadMockData();
        this.isDisplayMode = true;
        this.slider = null;
        this.currentSection = 'dashboard';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startClock();
        this.initializeDisplay();
        this.updateDashboardStats();
    }
    
    loadMockData() {
        return [
            {
                id: 1,
                title: "Bienvenue à Emineo Education",
                content: "Découvrez nos formations d'excellence dans un environnement moderne et dynamique.",
                school: "sup-de-vinci",
                category: "promo",
                template: "basic",
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                duration: 8,
                priority: "high",
                status: "active"
            },
            {
                id: 2,
                title: "Nouvelle Formation Web Development",
                content: "Inscriptions ouvertes pour notre formation développement web. Places limitées !",
                school: "sup-de-vinci",
                category: "event",
                template: "breaking-news",
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                duration: 10,
                priority: "urgent",
                status: "active",
                location: "Campus Bordeaux"
            },
            {
                id: 3,
                title: "Journée Portes Ouvertes",
                content: "Venez découvrir nos formations et rencontrer nos équipes pédagogiques.",
                school: "isvm",
                category: "event",
                template: "event",
                startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                duration: 12,
                priority: "medium",
                status: "active",
                location: "Amphithéâtre A"
            }
        ];
    }
    
    setupEventListeners() {
        // Navigation admin
        document.querySelectorAll('.admin-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                if (section) {
                    this.switchAdminSection(section);
                }
            });
        });
        
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        
        // Demo login button
        const demoLoginBtn = document.getElementById('demo-login');
        if (demoLoginBtn) {
            demoLoginBtn.addEventListener('click', this.handleDemoLogin.bind(this));
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
        
        // Announcement form
        const announcementForm = document.getElementById('create-announcement');
        if (announcementForm) {
            announcementForm.addEventListener('submit', this.handleCreateAnnouncement.bind(this));
        }
        
        // Toggle admin panel (Ctrl + A)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.toggleAdminPanel();
            }
        });
        
        // Close modal on outside click
        document.getElementById('login-modal').addEventListener('click', (e) => {
            if (e.target.id === 'login-modal') {
                this.hideLoginModal();
            }
        });
    }
    
    switchAdminSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(section => section.style.display = 'none');

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Update nav
        const navLinks = document.querySelectorAll('.admin-nav a');
        navLinks.forEach(link => link.classList.remove('active'));

        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load data for specific sections
        switch (sectionName) {
            case 'templates':
                if (window.templateEditor) {
                    window.templateEditor.loadExistingTemplates();
                }
                break;
        }
    }
    
    loadAnnouncementsList() {
        const container = document.getElementById('announcements-container');
        if (!container) return;
        
        if (this.announcements.length === 0) {
            container.innerHTML = '<p class="no-data">Aucune annonce trouvée.</p>';
            return;
        }
        
        container.innerHTML = this.announcements.map(announcement => `
            <div class="announcement-item">
                <div class="announcement-info">
                    <h4>${announcement.title}</h4>
                    <p>${announcement.school} - ${announcement.category} - ${announcement.status}</p>
                </div>
                <div class="announcement-actions">
                    <button class="btn btn-sm btn-primary" onclick="displaySystem.editAnnouncement(${announcement.id})">
                        Modifier
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="displaySystem.deleteAnnouncement(${announcement.id})">
                        Supprimer
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    editAnnouncement(id) {
        const announcement = this.announcements.find(a => a.id === id);
        if (!announcement) return;
        
        // Pre-fill form
        document.getElementById('title').value = announcement.title;
        document.getElementById('content').value = announcement.content;
        document.getElementById('school').value = announcement.school;
        document.getElementById('category').value = announcement.category;
        document.getElementById('template').value = announcement.template;
        // ... other fields
        
        alert('Annonce chargée dans le formulaire pour modification');
    }
    
    deleteAnnouncement(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
            this.announcements = this.announcements.filter(a => a.id !== id);
            this.loadAnnouncementsList();
            this.updateSlider();
            this.updateDashboardStats();
            alert('Annonce supprimée avec succès');
        }
    }
    
    handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');
        
        // Demo authentication
        if (username === 'admin' && password === 'admin') {
            this.currentUser = {
                id: 1,
                username: 'admin',
                role: 'super-admin'
            };
            this.hideLoginModal();
            this.showAdminPanel();
        } else {
            alert('Identifiants incorrects. Utilisez admin/admin pour la démo.');
        }
    }
    
    handleDemoLogin() {
        document.getElementById('username').value = 'admin';
        document.getElementById('password').value = 'admin';
    }
    
    handleLogout() {
        this.currentUser = null;
        this.hideAdminPanel();
        alert('Déconnecté avec succès');
    }
    
    handleCreateAnnouncement(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newAnnouncement = {
            id: Date.now(), // Simple ID generation
            title: formData.get('title'),
            content: formData.get('content'),
            school: formData.get('school'),
            category: formData.get('category'),
            template: formData.get('template'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            duration: parseInt(formData.get('duration')),
            priority: formData.get('priority'),
            status: 'active'
        };
        
        // Validation
        if (!newAnnouncement.title || !newAnnouncement.content) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        this.announcements.push(newAnnouncement);
        this.updateSlider();
        this.loadAnnouncementsList();
        this.updateDashboardStats();
        
        // Reset form
        e.target.reset();
        
        alert('Annonce créée avec succès !');
    }
    
    toggleAdminPanel() {
        if (this.isDisplayMode) {
            this.showLoginModal();
        } else {
            this.hideAdminPanel();
        }
    }
    
    showLoginModal() {
        document.getElementById('login-modal').style.display = 'block';
    }
    
    hideLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
    }
    
    showAdminPanel() {
        document.getElementById('admin-panel').classList.remove('hidden');
        document.getElementById('display-screen').style.display = 'none';
        document.getElementById('user-role').textContent = this.currentUser.role || 'Utilisateur';
        this.isDisplayMode = false;
        
        // Load default section
        this.switchAdminSection('dashboard');
    }
    
    hideAdminPanel() {
        document.getElementById('admin-panel').classList.add('hidden');
        document.getElementById('display-screen').style.display = 'block';
        this.isDisplayMode = true;
        
        // Restart slider if needed
        if (this.slider) {
            this.slider.updateSliderSize();
        }
    }
    
    startClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateString = now.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const timeElement = document.getElementById('current-time');
            if (timeElement) {
                timeElement.textContent = `${dateString} -  $ {timeString}`;
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    initializeDisplay() {
        // Initialize RoyalSlider when jQuery is loaded
        if (typeof  $  !== 'undefined' && $.fn.royalSlider) {
            this.initRoyalSlider();
        } else {
            // Fallback: wait for jQuery to load
            setTimeout(() => this.initializeDisplay(), 500);
        }
    }
    
    initRoyalSlider() {
        const sliderElement = $('#royal-slider');
        
        if (sliderElement.length) {
            this.slider = sliderElement.royalSlider({
                autoHeight: false,
                arrowsNav: false,
                controlNavigation: 'none',
                autoScaleSlider: true,
                autoScaleSliderWidth: 1920,
                autoScaleSliderHeight: 1080,
                loop: true,
                imageScaleMode: 'fill',
                navigateByClick: false,
                randomizeSlides: false,
                slidesSpacing: 0,
                keyboardNavEnabled: false,
                fadeinLoadedSlide: true,
                globalCaption: false,
                autoPlay: {
                    enabled: true,
                    pauseOnHover: false,
                    delay: 8000
                }
            }).data('royalSlider');
            
            console.log('RoyalSlider initialized');
            this.updateSlider();
        }
    }
    
    updateSlider() {
        if (!this.slider) return;
        
        // Clear existing slides
        this.slider.removeSlide();
        
        // Add slides for active announcements
        const activeAnnouncements = this.announcements.filter(a => a.status === 'active');
        
        if (activeAnnouncements.length === 0) {
            // Add default slide
            this.slider.appendSlide(`
                <div class="announcement-slide template-basic">
                    <div class="content">
                        <h1>Emineo Education</h1>
                        <p>Système d'affichage vidéo</p>
                        <small>Aucune annonce active</small>
                    </div>
                </div>
            `);
        } else {
            activeAnnouncements.forEach(announcement => {
                const slideContent = TemplateEngine.render(announcement.template, announcement);
                this.slider.appendSlide(slideContent);
            });
        }
        
        // Update slider
        this.slider.updateSliderSize();
        console.log(`Slider updated with ${activeAnnouncements.length} slides`);
    }
    
    updateDashboardStats() {
        const activeCount = this.announcements.filter(a => a.status === 'active').length;
        const totalCount = this.announcements.length;
        
        const activeElement = document.getElementById('active-announcements');
        const totalElement = document.getElementById('total-announcements');
        
        if (activeElement) activeElement.textContent = activeCount;
        if (totalElement) totalElement.textContent = totalCount;
    }
}

// Ajoutez la méthode toggleAdminPanel à la classe AnnouncementApp
class AnnouncementApp {
    toggleDisplayMode() {
        const displayMode = document.getElementById('display-mode');
        const adminMode = document.getElementById('admin-mode');
        
        if (displayMode.style.display === 'none') {
            // Retour au mode affichage
            displayMode.style.display = 'flex';
            adminMode.style.display = 'none';
            
            // Redémarrer l'affichage
            if (window.displayManager) {
                window.displayManager.resume();
            }
        } else {
            // Passage en mode admin
            displayMode.style.display = 'none';
            adminMode.style.display = 'block';
            
            // Arrêter l'affichage
            if (window.displayManager) {
                window.displayManager.pause();
            }
        }
    }

    toggleAdminPanel() {
        this.toggleDisplayMode();
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.displaySystem = new DisplaySystem();
    
    // Initialiser l'application
    window.app = new AnnouncementApp();
    
    // Initialiser le gestionnaire d'affichage
    window.displayManager = new DisplayManager();
    
    // Initialiser le renderer de templates  
    window.templateRenderer = new TemplateRenderer();
    
    console.log('Application initialisée');
});

