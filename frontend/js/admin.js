class AdminPanel {
    constructor() {
        this.currentSection = 'announcements';
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadAnnouncements();
    }
    
    setupEventListeners() {
        // Navigation entre sections
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });
        
        // Bouton fermer admin
        const closeBtn = document.querySelector('.close-admin');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }
        
        // Formulaire d'ajout d'annonce
        const addForm = document.getElementById('add-announcement-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddAnnouncement();
            });
        }
        
        // Bouton ajouter annonce
        const addBtn = document.getElementById('add-announcement-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddForm();
            });
        }
    }
    
    showSection(sectionName) {
        // Masquer toutes les sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Afficher la section demandée
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Désactiver tous les boutons de navigation
        document.querySelectorAll('.admin-nav-item').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activer le bouton correspondant
        const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Charger les données de la section
        if (typeof loadSectionData === 'function') {
            loadSectionData(sectionName);
        }
    }
    
    loadSectionData(section) {
        console.log('Chargement des données pour la section:', section);

        switch (section) {
            case 'announcements':
                if (window.adminPanel) {
                    adminPanel.loadAnnouncements();
                }
                break;
            case 'templates':
                loadTemplates(); // Maintenant la fonction existe
                break;
            case 'scheduler':
                loadSchedulerData();
                break;
            case 'settings':
                loadSettings();
                break;
            default:
                console.warn('Section inconnue:', section);
        }
    }
    
    loadAnnouncements() {
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const tbody = document.querySelector('#announcements-table tbody');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        announcements.forEach((announcement, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${announcement.title}</td>
                <td><span class="status-badge status-${announcement.status}">${announcement.status}</span></td>
                <td><span class="priority-badge priority-${announcement.priority}">${announcement.priority}</span></td>
                <td>${announcement.template}</td>
                <td>${new Date(announcement.startDate).toLocaleDateString()}</td>
                <td>${new Date(announcement.endDate).toLocaleDateString()}</td>
                <td class="table-actions">
                    <button class="btn btn-primary action-btn" onclick="adminPanel.editAnnouncement(${index})">Modifier</button>
                    <button class="btn btn-danger action-btn" onclick="adminPanel.deleteAnnouncement(${index})">Supprimer</button>
                    <button class="btn btn-secondary action-btn" onclick="adminPanel.duplicateAnnouncement(${index})">Dupliquer</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    showAddForm() {
        const modal = document.getElementById('announcement-modal');
        if (modal) {
            modal.style.display = 'block';
            this.clearForm();
        }
    }
    
    handleAddAnnouncement() {
        const formData = this.getFormData();
        if (!this.validateForm(formData)) {
            return;
        }
        
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        
        const newAnnouncement = {
            id: Date.now(),
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        announcements.push(newAnnouncement);
        localStorage.setItem('announcements', JSON.stringify(announcements));
        
        this.loadAnnouncements();
        this.closeModal();
        this.showNotification('Annonce ajoutée avec succès', 'success');
    }
    
    editAnnouncement(index) {
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const announcement = announcements[index];
        
        if (!announcement) return;
        
        this.fillForm(announcement);
        this.showAddForm();
        
        // Modifier le comportement du formulaire pour la modification
        const form = document.getElementById('add-announcement-form');
        form.dataset.editIndex = index;
    }
    
    deleteAnnouncement(index) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
            return;
        }
        
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        announcements.splice(index, 1);
        localStorage.setItem('announcements', JSON.stringify(announcements));
        
        this.loadAnnouncements();
        this.showNotification('Annonce supprimée', 'success');
    }
    
    duplicateAnnouncement(index) {
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const original = announcements[index];
        
        if (!original) return;
        
        const duplicate = {
            ...original,
            id: Date.now(),
            title: original.title + ' (Copie)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        announcements.push(duplicate);
        localStorage.setItem('announcements', JSON.stringify(announcements));
        
        this.loadAnnouncements();
        this.showNotification('Annonce dupliquée', 'success');
    }
    
    getFormData() {
        return {
            title: document.getElementById('title').value,
            content: document.getElementById('content').value,
            template: document.getElementById('template').value,
            priority: document.getElementById('priority').value,
            status: document.getElementById('status').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            duration: parseInt(document.getElementById('duration').value) || 10
        };
    }
    
    validateForm(data) {
        if (!data.title.trim()) {
            this.showNotification('Le titre est requis', 'error');
            return false;
        }
        
        if (!data.content.trim()) {
            this.showNotification('Le contenu est requis', 'error');
            return false;
        }
        
        if (new Date(data.startDate) > new Date(data.endDate)) {
            this.showNotification('La date de fin doit être après la date de début', 'error');
            return false;
        }
        
        return true;
    }
    
    clearForm() {
        const form = document.getElementById('add-announcement-form');
        if (form) {
            form.reset();
            delete form.dataset.editIndex;
        }
    }
    
    fillForm(announcement) {
        document.getElementById('title').value = announcement.title || '';
        document.getElementById('content').value = announcement.content || '';
        document.getElementById('template').value = announcement.template || '';
        document.getElementById('priority').value = announcement.priority || '';
        document.getElementById('status').value = announcement.status || '';
        document.getElementById('startDate').value = announcement.startDate || '';
        document.getElementById('endDate').value = announcement.endDate || '';
        document.getElementById('duration').value = announcement.duration || 10;
    }
    
    closeModal() {
        const modal = document.getElementById('announcement-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    loadTemplates() {
        console.log('Chargement des templates...');

        if (window.templateManager) {
            // Utiliser le Template Manager
            const templatesGrid = document.getElementById('existing-templates');
            if (templatesGrid) {
                window.templateManager.renderTemplatesGrid();
            }
        } else {
            // Fallback si Template Manager n'est pas disponible
            console.warn('Template Manager non disponible');
            const templatesGrid = document.getElementById('existing-templates');
            if (templatesGrid) {
                templatesGrid.innerHTML = `
                    <div class="no-templates-message">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i>
                            <p>Aucun template disponible pour le moment.</p>
                            <button class="btn btn-primary" onclick="createDefaultTemplates()">
                                <i class="fas fa-plus"></i> Créer des templates par défaut
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    createDefaultTemplates() {
        if (!window.templateManager) {
            console.error('Template Manager non disponible');
            return;
        }

        // Templates par défaut
        const defaultTemplates = [
            {
                name: 'Annonce Simple',
                layout: 'text-only',
                theme: 'blue',
                category: 'basic',
                description: 'Template simple avec titre et contenu',
                html: `
                    <div class="announcement-simple">
                        <h1>{{title}}</h1>
                        <p>{{content}}</p>
                    </div>
                `,
                css: `
                    .announcement-simple {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 40px;
                        text-align: center;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    .announcement-simple h1 {
                        font-size: 3em;
                        margin-bottom: 20px;
                    }
                    .announcement-simple p {
                        font-size: 1.5em;
                        line-height: 1.4;
                    }
                `
            },
            {
                name: 'Annonce avec Image',
                layout: 'image-left',
                theme: 'green',
                category: 'media',
                description: 'Template avec image à gauche et texte à droite',
                html: `
                    <div class="announcement-with-image">
                        <div class="image-section">
                            <img src="{{image}}" alt="{{title}}">
                        </div>
                        <div class="content-section">
                            <h1>{{title}}</h1>
                            <p>{{content}}</p>
                        </div>
                    </div>
                `,
                css: `
                    .announcement-with-image {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        height: 100%;
                        background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
                        color: white;
                    }
                    .image-section {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                    }
                    .image-section img {
                        max-width: 100%;
                        max-height: 100%;
                        border-radius: 10px;
                    }
                    .content-section {
                        padding: 40px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    .content-section h1 {
                        font-size: 2.5em;
                        margin-bottom: 20px;
                    }
                    .content-section p {
                        font-size: 1.3em;
                        line-height: 1.4;
                    }
                `
            },
            {
                name: 'Annonce Urgente',
                layout: 'text-only',
                theme: 'red',
                category: 'urgent',
                description: 'Template pour les annonces urgentes avec animation',
                html: `
                    <div class="announcement-urgent">
                        <div class="urgency-badge">URGENT</div>
                        <h1>{{title}}</h1>
                        <p>{{content}}</p>
                    </div>
                `,
                css: `
                    .announcement-urgent {
                        background: linear-gradient(135deg, #ff4757 0%, #c44569 100%);
                        color: white;
                        padding: 40px;
                        text-align: center;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        animation: urgentPulse 2s infinite;
                    }
                    .urgency-badge {
                        background: rgba(255,255,255,0.2);
                        padding: 10px 20px;
                        border-radius: 20px;
                        font-weight: bold;
                        font-size: 1.2em;
                        margin-bottom: 20px;
                        display: inline-block;
                    }
                    .announcement-urgent h1 {
                        font-size: 3em;
                        margin-bottom: 20px;
                    }
                    .announcement-urgent p {
                        font-size: 1.5em;
                        line-height: 1.4;
                    }
                    @keyframes urgentPulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.9; }
                    }
                `
            }
        ];

        // Créer les templates
        defaultTemplates.forEach(template => {
            window.templateManager.addTemplate(template);
        });

        // Actualiser l'affichage
        loadTemplates();

        alert('Templates par défaut créés avec succès !');
    }
    
    loadScheduler() {
        // Charger le planificateur
        console.log('Chargement du planificateur...');
    }
    
    loadSettings() {
        console.log('Chargement des paramètres...');

        // Charger les paramètres depuis le localStorage
        const settings = JSON.parse(localStorage.getItem('displaySettings') || '{}');

        // Remplir les champs
        const defaultDuration = document.getElementById('default-duration');
        const transitionEffect = document.getElementById('transition-effect');

        if (defaultDuration) {
            defaultDuration.value = settings.defaultDuration || 10;
        }

        if (transitionEffect) {
            transitionEffect.value = settings.transitionEffect || 'fade';
        }
    }
    
    showNotification(message, type = 'info') {
        // Créer une notification toast
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#27ae60';
                break;
            case 'error':
                notification.style.background = '#e74c3c';
                break;
            default:
                notification.style.background = '#3498db';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    close() {
        const panel = document.querySelector('.admin-panel');
        if (panel) {
            panel.style.display = 'none';
        }
        
        // Reprendre l'affichage
        if (window.displayManager) {
            window.displayManager.resume();
        }
    }
    
    show() {
        const panel = document.querySelector('.admin-panel');
        if (panel) {
            panel.style.display = 'block';
            this.showSection('announcements');
        }
        
        // Arrêter l'affichage
        if (window.displayManager) {
            window.displayManager.pause();
        }
    }
}

// Variables globales
let currentEditingIndex = -1;

// Fonctions principales
function toggleAdminPanel() {
    const adminPanel = document.getElementById('admin-mode');
    const displayMode = document.getElementById('display-mode');
    
    if (adminPanel.style.display === 'none' || adminPanel.style.display === '') {
        // Afficher le panneau admin
        adminPanel.style.display = 'block';
        displayMode.style.display = 'none';
        
        // Arrêter l'affichage si le manager existe
        if (window.displayManager) {
            window.displayManager.pause();
        }
        
        // Charger les données
        loadAnnouncements();
        showSection('announcements');
    }
}

function closeAdmin() {
    const adminPanel = document.getElementById('admin-mode');
    const displayMode = document.getElementById('display-mode');
    
    adminPanel.style.display = 'none';
    displayMode.style.display = 'flex';
    
    // Reprendre l'affichage
    if (window.displayManager) {
        window.displayManager.resume();
    }
}

function showSection(sectionName) {
    console.log('Affichage de la section:', sectionName);

    // Masquer toutes les sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Afficher la section demandée
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }

    // Mettre à jour la navigation
    document.querySelectorAll('.admin-nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Charger les données de la section
    loadSectionData(sectionName);
}

function loadSectionData(section) {
    console.log('Chargement des données pour la section:', section);

    switch (section) {
        case 'announcements':
            if (window.adminPanel) {
                adminPanel.loadAnnouncements();
            }
            break;
        case 'templates':
            loadTemplates(); // Maintenant la fonction existe
            break;
        case 'scheduler':
            loadSchedulerData();
            break;
        case 'settings':
            loadSettings();
            break;
        default:
            console.warn('Section inconnue:', section);
    }
}

function loadSettings() {
    console.log('Chargement des paramètres...');

    // Charger les paramètres depuis le localStorage
    const settings = JSON.parse(localStorage.getItem('displaySettings') || '{}');

    // Remplir les champs
    const defaultDuration = document.getElementById('default-duration');
    const transitionEffect = document.getElementById('transition-effect');

    if (defaultDuration) {
        defaultDuration.value = settings.defaultDuration || 10;
    }

    if (transitionEffect) {
        transitionEffect.value = settings.transitionEffect || 'fade';
    }
}

// Gestion des annonces
function loadAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const tbody = document.querySelector('#announcements-table tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (announcements.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #6c757d;">
                    <i class="fas fa-inbox" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                    Aucune annonce créée
                </td>
            </tr>
        `;
        return;
    }
    
    announcements.forEach((announcement, index) => {
        const row = document.createElement('tr');
        
        const statusClass = `status-${announcement.status}`;
        const priorityClass = `priority-${announcement.priority}`;
        
        const startDate = announcement.startDate ? new Date(announcement.startDate).toLocaleDateString('fr-FR') : '--';
        const endDate = announcement.endDate ? new Date(announcement.endDate).toLocaleDateString('fr-FR') : '--';
        
        row.innerHTML = `
            <td>
                <strong>${announcement.title}</strong>
                <div style="font-size: 0.9em; color: #6c757d; margin-top: 3px;">
                    ${announcement.content.substring(0, 80)}${announcement.content.length > 80 ? '...' : ''}
                </div>
            </td>
            <td><span class="status-badge ${statusClass}">${announcement.status}</span></td>
            <td><span class="priority-badge ${priorityClass}">${announcement.priority}</span></td>
            <td><span class="template-badge">${announcement.template}</span></td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-secondary btn-sm action-btn" onclick="editAnnouncement(${index})">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-danger btn-sm action-btn" onclick="deleteAnnouncement(${index})">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                    <button class="btn btn-primary btn-sm action-btn" onclick="toggleAnnouncementStatus(${index})">
                        <i class="fas fa-toggle-on"></i> ${announcement.status === 'active' ? 'Désactiver' : 'Activer'}
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Modal d'annonce
function showAddAnnouncementModal() {
    currentEditingIndex = -1;
    document.getElementById('modal-title').textContent = 'Nouvelle Annonce';
    
    // Réinitialiser le formulaire
    document.getElementById('announcement-form').reset();
    
    // Dates par défaut
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 7);
    
    document.getElementById('ann-start-date').value = now.toISOString().slice(0, 16);
    document.getElementById('ann-end-date').value = tomorrow.toISOString().slice(0, 16);
    
    document.getElementById('announcement-modal').style.display = 'block';
}

function closeAnnouncementModal() {
    document.getElementById('announcement-modal').style.display = 'none';
    currentEditingIndex = -1;
}

function editAnnouncement(index) {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const announcement = announcements[index];
    
    if (!announcement) return;
    
    currentEditingIndex = index;
    document.getElementById('modal-title').textContent = 'Modifier l\'Annonce';
    
    // Remplir le formulaire
    document.getElementById('ann-title').value = announcement.title || '';
    document.getElementById('ann-content').value = announcement.content || '';
    document.getElementById('ann-template').value = announcement.template || 'info';
    document.getElementById('ann-priority').value = announcement.priority || 'normal';
    document.getElementById('ann-status').value = announcement.status || 'active';
    document.getElementById('ann-duration').value = announcement.duration || 10;
    
    if (announcement.startDate) {
        document.getElementById('ann-start-date').value = new Date(announcement.startDate).toISOString().slice(0, 16);
    }
    if (announcement.endDate) {
        document.getElementById('ann-end-date').value = new Date(announcement.endDate).toISOString().slice(0, 16);
    }
    
    document.getElementById('announcement-modal').style.display = 'block';
}

function saveAnnouncement() {
    // Récupérer les données du formulaire
    const title = document.getElementById('ann-title').value.trim();
    const content = document.getElementById('ann-content').value.trim();
    const template = document.getElementById('ann-template').value;
    const priority = document.getElementById('ann-priority').value;
    const status = document.getElementById('ann-status').value;
    const duration = parseInt(document.getElementById('ann-duration').value) || 10;
    const startDate = document.getElementById('ann-start-date').value;
    const endDate = document.getElementById('ann-end-date').value;
    
    // Validation
    if (!title || !content) {
        alert('Le titre et le contenu sont obligatoires.');
        return;
    }
    
    const announcement = {
        id: currentEditingIndex >= 0 ? JSON.parse(localStorage.getItem('announcements') || '[]')[currentEditingIndex].id : Date.now(),
        title,
        content,
        template,
        priority,
        status,
        duration,
        startDate,
        endDate,
        createdAt: currentEditingIndex >= 0 ? JSON.parse(localStorage.getItem('announcements') || '[]')[currentEditingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    let announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    
    if (currentEditingIndex >= 0) {
        // Modification
        announcements[currentEditingIndex] = announcement;
    } else {
        // Ajout
        announcements.push(announcement);
    }
    
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    // Fermer la modal et recharger la liste
    closeAnnouncementModal();
    loadAnnouncements();
    
    // Mettre à jour le display manager si disponible
    if (window.displayManager) {
        window.displayManager.loadAnnouncements();
    }
    
    alert(currentEditingIndex >= 0 ? 'Annonce modifiée avec succès!' : 'Annonce créée avec succès!');
}

function deleteAnnouncement(index) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
        return;
    }
    
    let announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    announcements.splice(index, 1);
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    loadAnnouncements();
    
    // Mettre à jour le display manager
    if (window.displayManager) {
        window.displayManager.loadAnnouncements();
    }
    
    alert('Annonce supprimée avec succès!');
}

function toggleAnnouncementStatus(index) {
    let announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const announcement = announcements[index];
    
    if (!announcement) return;
    
    announcement.status = announcement.status === 'active' ? 'inactive' : 'active';
    announcement.updatedAt = new Date().toISOString();
    
    localStorage.setItem('announcements', JSON.stringify(announcements));
    loadAnnouncements();
    
    // Mettre à jour le display manager
    if (window.displayManager) {
        window.displayManager.loadAnnouncements();
    }
}

// Paramètres
function saveDisplaySettings() {
    const settings = {
        defaultDuration: parseInt(document.getElementById('default-duration').value) || 10,
        transitionEffect: document.getElementById('transition-effect').value || 'fade'
    };
    
    localStorage.setItem('displaySettings', JSON.stringify(settings));
    alert('Paramètres d\'affichage sauvegardés!');
}

function saveEmergencySettings() {
    const settings = JSON.parse(localStorage.getItem('displaySettings') || '{}');
    
    settings.emergencyInterval = parseInt(document.getElementById('emergency-interval').value) || 30;
    settings.emergencySound = document.getElementById('emergency-sound').checked;
    
    localStorage.setItem('displaySettings', JSON.stringify(settings));
    alert('Paramètres d\'urgence sauvegardés!');
}

// Gestion des templates
function openTemplateEditor() {
    alert('Éditeur de templates - Fonctionnalité à venir');
}

// Système
function exportData() {
    const data = {
        announcements: JSON.parse(localStorage.getItem('announcements') || '[]'),
        settings: JSON.parse(localStorage.getItem('displaySettings') || '{}'),
        schedules: JSON.parse(localStorage.getItem('schedules') || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-emineo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.announcements) {
                    localStorage.setItem('announcements', JSON.stringify(data.announcements));
                }
                if (data.settings) {
                    localStorage.setItem('displaySettings', JSON.stringify(data.settings));
                }
                if (data.schedules) {
                    localStorage.setItem('schedules', JSON.stringify(data.schedules));
                }
                
                alert('Données importées avec succès!');
                location.reload();
            } catch (error) {
                alert('Erreur lors de l\'import: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function resetSystem() {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données? Cette action est irréversible.')) {
        return;
    }
    
    if (!confirm('ATTENTION: Toutes les annonces, paramètres et planifications seront supprimés définitivement!')) {
        return;
    }
    
    localStorage.removeItem('announcements');
    localStorage.removeItem('displaySettings');
    localStorage.removeItem('schedules');
    
    alert('Système réinitialisé avec succès!');
    location.reload();
}

function addScheduleRule() {
    alert('Planificateur - Fonctionnalité à venir');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Navigation admin
    document.querySelectorAll('.admin-nav-item[data-section]').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Fermeture modal avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('announcement-modal');
            if (modal && modal.style.display === 'block') {
                closeAnnouncementModal();
            }
        }
    });
    
    // Fermeture modal en cliquant en dehors
    document.getElementById('announcement-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeAnnouncementModal();
        }
    });
    
    console.log('Admin panel initialisé');
});

window.adminPanel = new AdminPanel();
