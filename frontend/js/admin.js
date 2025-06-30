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
        
        // Désactiver tous les boutons nav
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Afficher la section demandée
        const section = document.getElementById(`${sectionName}-section`);
        if (section) {
            section.classList.add('active');
        }
        
        // Activer le bouton nav
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        this.currentSection = sectionName;
        
        // Charger les données de la section
        this.loadSectionData(sectionName);
    }
    
    loadSectionData(section) {
        switch (section) {
            case 'announcements':
                this.loadAnnouncements();
                break;
            case 'templates':
                this.loadTemplates();
                break;
            case 'scheduler':
                this.loadScheduler();
                break;
            case 'settings':
                this.loadSettings();
                break;
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
        // Charger la liste des templates
        console.log('Chargement des templates...');
    }
    
    loadScheduler() {
        // Charger le planificateur
        console.log('Chargement du planificateur...');
    }
    
    loadSettings() {
        // Charger les paramètres
        console.log('Chargement des paramètres...');
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

// Initialiser le panneau admin quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
