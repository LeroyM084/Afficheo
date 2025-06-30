class DisplayManager {
    constructor() {
        this.announcements = [];
        this.currentIndex = 0;
        this.displayTimer = null;
        this.countdownTimer = null;
        this.isPlaying = true;
        this.priorityQueue = [];
        this.emergencyMode = false;
        
        this.init();
    }
    
    init() {
        this.loadAnnouncements();
        this.setupEventListeners();
        this.startClock();
        this.startDisplay();
        
        // Mise à jour automatique des annonces toutes les minutes
        setInterval(() => {
            this.loadAnnouncements();
        }, 60000);
    }
    
    loadAnnouncements() {
        // Charger les annonces depuis localStorage (ou API)
        const storedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
        
        // Filtrer les annonces actives
        const now = new Date();
        this.announcements = storedAnnouncements.filter(announcement => {
            const startDate = new Date(announcement.startDate || now);
            const endDate = new Date(announcement.endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
            
            return announcement.status === 'active' && 
                   startDate <= now && 
                   endDate >= now;
        });
        
        // Créer la queue de priorité
        this.createPriorityQueue();
        
        // Mettre à jour les compteurs
        this.updateAnnouncementCounters();
        
        console.log(`${this.announcements.length} annonces actives chargées`);
    }
    
    createPriorityQueue() {
        // Algorithme de priorité et de fréquence d'affichage
        this.priorityQueue = [];
        
        if (this.announcements.length === 0) {
            this.showNoAnnouncementsMessage();
            return;
        }
        
        // Grouper par priorité
        const priorityGroups = {
            emergency: [], // 5 - Affichage immédiat et répété
            urgent: [],    // 4 - Toutes les 2 annonces
            high: [],      // 3 - Toutes les 3 annonces  
            normal: [],    // 2 - Rotation normale
            low: []        // 1 - Moins fréquent
        };
        
        this.announcements.forEach(announcement => {
            const priority = this.getPriorityLevel(announcement.priority);
            priorityGroups[priority].push(announcement);
        });
        
        // Vérifier s'il y a des annonces d'urgence
        if (priorityGroups.emergency.length > 0) {
            this.handleEmergencyMode(priorityGroups.emergency);
            return;
        }
        
        // Construire la queue selon l'algorithme de priorité
        this.buildPriorityQueue(priorityGroups);
        
        console.log('Queue de priorité créée:', this.priorityQueue.length, 'éléments');
    }
    
    getPriorityLevel(priority) {
        const priorityMap = {
            'emergency': 'emergency',
            'urgent': 'urgent', 
            'high': 'high',
            'normal': 'normal',
            'low': 'low'
        };
        return priorityMap[priority] || 'normal';
    }
    
    buildPriorityQueue(groups) {
        this.priorityQueue = [];
        
        // Calculer le nombre total d'annonces non-urgentes
        const totalNonEmergency = groups.urgent.length + groups.high.length + 
                                  groups.normal.length + groups.low.length;
        
        if (totalNonEmergency === 0) return;
        
        // Algorithme de distribution basé sur les priorités
        let queueSize = Math.max(20, totalNonEmergency * 2); // Taille minimale de 20
        let position = 0;
        
        // 1. Placer les annonces urgentes (toutes les 2 positions)
        groups.urgent.forEach((announcement, index) => {
            for (let i = 1 + index * 2; i < queueSize; i += 4) {
                if (i < queueSize) {
                    this.priorityQueue[i] = announcement;
                }
            }
        });
        
        // 2. Placer les annonces haute priorité (toutes les 3 positions)
        groups.high.forEach((announcement, index) => {
            for (let i = 2 + index * 3; i < queueSize; i += 6) {
                if (i < queueSize && !this.priorityQueue[i]) {
                    this.priorityQueue[i] = announcement;
                }
            }
        });
        
        // 3. Remplir avec les annonces normales
        let normalIndex = 0;
        for (let i = 0; i < queueSize; i++) {
            if (!this.priorityQueue[i] && groups.normal.length > 0) {
                this.priorityQueue[i] = groups.normal[normalIndex % groups.normal.length];
                normalIndex++;
            }
        }
        
        // 4. Combler les trous avec les annonces de faible priorité
        let lowIndex = 0;
        for (let i = 0; i < queueSize; i++) {
            if (!this.priorityQueue[i] && groups.low.length > 0) {
                this.priorityQueue[i] = groups.low[lowIndex % groups.low.length];
                lowIndex++;
            }
        }
        
        // Nettoyer les positions vides
        this.priorityQueue = this.priorityQueue.filter(item => item !== undefined);
    }
    
    handleEmergencyMode(emergencyAnnouncements) {
        this.emergencyMode = true;
        
        // Afficher immédiatement l'annonce d'urgence
        this.showEmergencyAnnouncement(emergencyAnnouncements[0]);
        
        // Créer une queue d'urgence (répétition toutes les 3 annonces)
        this.priorityQueue = [];
        
        emergencyAnnouncements.forEach(announcement => {
            // Répéter l'annonce d'urgence plusieurs fois
            for (let i = 0; i < 10; i += 3) {
                this.priorityQueue[i] = announcement;
            }
        });
        
        // Remplir les autres positions avec les annonces normales
        const normalAnnouncements = this.announcements.filter(a => 
            this.getPriorityLevel(a.priority) !== 'emergency'
        );
        
        let normalIndex = 0;
        for (let i = 1; i < 10; i++) {
            if (!this.priorityQueue[i] && normalAnnouncements.length > 0) {
                this.priorityQueue[i] = normalAnnouncements[normalIndex % normalAnnouncements.length];
                normalIndex++;
            }
        }
        
        this.priorityQueue = this.priorityQueue.filter(item => item !== undefined);
    }
    
    showEmergencyAnnouncement(announcement) {
        const emergencyDiv = document.getElementById('emergency-notification');
        const messageSpan = document.getElementById('emergency-message');
        
        messageSpan.textContent = announcement.content;
        emergencyDiv.style.display = 'block';
        
        // Masquer après 10 secondes
        setTimeout(() => {
            emergencyDiv.style.display = 'none';
        }, 10000);
    }
    
    startDisplay() {
        if (this.priorityQueue.length === 0) {
            this.showNoAnnouncementsMessage();
            return;
        }
        
        this.currentIndex = 0;
        this.showCurrentAnnouncement();
    }
    
    showCurrentAnnouncement() {
        if (this.priorityQueue.length === 0) return;
        
        const announcement = this.priorityQueue[this.currentIndex];
        if (!announcement) return;
        
        console.log(`Affichage de l'annonce: ${announcement.title} (Priorité: ${announcement.priority})`);
        
        // Obtenir la durée d'affichage (avec modification selon la priorité)
        const duration = this.getDisplayDuration(announcement);
        
        // Rendre l'annonce
        this.renderAnnouncement(announcement);
        
        // Démarrer le compte à rebours
        this.startCountdown(duration);
        
        // Programmer la prochaine annonce
        this.displayTimer = setTimeout(() => {
            this.nextAnnouncement();
        }, duration * 1000);
    }
    
    getDisplayDuration(announcement) {
        const baseDuration = announcement.duration || 10;
        const priority = this.getPriorityLevel(announcement.priority);
        
        // Modifier la durée selon la priorité
        const durationMultipliers = {
            'emergency': 2.0,  // 2x plus long
            'urgent': 1.5,     // 1.5x plus long
            'high': 1.2,       // 1.2x plus long
            'normal': 1.0,     // Durée normale
            'low': 0.8         // 20% plus court
        };
        
        return Math.round(baseDuration * durationMultipliers[priority]);
    }
    
    renderAnnouncement(announcement) {
        const container = document.getElementById('announcement-container');
        
        // Choisir le template approprié
        const templateRenderer = new TemplateRenderer();
        const renderedHTML = templateRenderer.render(announcement);
        
        // Transition d'entrée
        container.style.opacity = '0';
        container.innerHTML = renderedHTML;
        
        // Fade in
        setTimeout(() => {
            container.style.opacity = '1';
        }, 100);
        
        // Mettre à jour les indicateurs
        this.updateNavigationIndicators();
    }
    
    nextAnnouncement() {
        if (this.displayTimer) {
            clearTimeout(this.displayTimer);
        }
        
        this.currentIndex = (this.currentIndex + 1) % this.priorityQueue.length;
        this.showCurrentAnnouncement();
    }
    
    previousAnnouncement() {
        if (this.displayTimer) {
            clearTimeout(this.displayTimer);
        }
        
        this.currentIndex = this.currentIndex > 0 ? 
            this.currentIndex - 1 : this.priorityQueue.length - 1;
        this.showCurrentAnnouncement();
    }
    
    startCountdown(duration) {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        
        let remaining = duration;
        const countdownElement = document.getElementById('countdown');
        
        this.countdownTimer = setInterval(() => {
            remaining--;
            if (countdownElement) {
                countdownElement.textContent = remaining;
            }
            
            if (remaining <= 0) {
                clearInterval(this.countdownTimer);
            }
        }, 1000);
    }
    
    updateNavigationIndicators() {
        const indicatorsContainer = document.getElementById('navigation-indicators');
        
        // Créer les indicateurs si nécessaire
        if (indicatorsContainer.children.length !== this.priorityQueue.length) {
            indicatorsContainer.innerHTML = '';
            
            for (let i = 0; i < this.priorityQueue.length; i++) {
                const indicator = document.createElement('span');
                indicator.className = 'nav-indicator';
                indicator.addEventListener('click', () => {
                    this.goToAnnouncement(i);
                });
                indicatorsContainer.appendChild(indicator);
            }
        }
        
        // Mettre à jour l'indicateur actif
        Array.from(indicatorsContainer.children).forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    updateAnnouncementCounters() {
        const currentSpan = document.getElementById('current-announcement');
        const totalSpan = document.getElementById('total-announcements');
        
        if (currentSpan) currentSpan.textContent = this.currentIndex + 1;
        if (totalSpan) totalSpan.textContent = this.priorityQueue.length;
    }
    
    goToAnnouncement(index) {
        if (index >= 0 && index < this.priorityQueue.length) {
            if (this.displayTimer) {
                clearTimeout(this.displayTimer);
            }
            
            this.currentIndex = index;
            this.showCurrentAnnouncement();
        }
    }
    
    showNoAnnouncementsMessage() {
        const container = document.getElementById('announcement-container');
        container.innerHTML = `
            <div class="no-announcements">
                <div class="no-announcements-icon">📢</div>
                <h2>Aucune annonce à afficher</h2>
                <p>Connectez-vous en mode administrateur pour ajouter des annonces</p>
                <small>Appuyez sur Ctrl+A pour accéder à l'administration</small>
            </div>
        `;
    }
    
    startClock() {
        const updateClock = () => {
            const now = new Date();
            
            const dateElement = document.getElementById('current-date');
            const timeElement = document.getElementById('current-time');
            
            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            
            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('fr-FR');
            }
            
            // Mettre à jour le timestamp de dernière mise à jour
            const lastUpdateElement = document.getElementById('last-update-time');
            if (lastUpdateElement) {
                lastUpdateElement.textContent = now.toLocaleTimeString('fr-FR');
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    setupEventListeners() {
        // Contrôles clavier pour la navigation
        document.addEventListener('keydown', (e) => {
            if (this.isInAdminMode()) return;
            
            switch (e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextAnnouncement();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousAnnouncement();
                    break;
                case 'p':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'r':
                    e.preventDefault();
                    this.refresh();
                    break;
            }
        });
        
        // Gestion du redimensionnement de fenêtre
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Gestion de la visibilité de la page (pour pause/resume)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.resume();
        }
    }
    
    pause() {
        this.isPlaying = false;
        if (this.displayTimer) {
            clearTimeout(this.displayTimer);
        }
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        console.log('Affichage en pause');
    }
    
    resume() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.showCurrentAnnouncement();
            console.log('Affichage repris');
        }
    }
    
    refresh() {
        console.log('Actualisation des annonces...');
        this.loadAnnouncements();
        if (this.priorityQueue.length > 0) {
            this.currentIndex = 0;
            this.showCurrentAnnouncement();
        }
    }
    
    handleResize() {
        // Réajuster l'affichage si nécessaire
        const container = document.getElementById('announcement-container');
        if (container) {
            // Forcer un reflow pour les éléments responsive
            container.style.height = window.innerHeight - 200 + 'px';
        }
    }
    
    isInAdminMode() {
        const adminMode = document.getElementById('admin-mode');
        return adminMode && adminMode.style.display !== 'none';
    }
    
    destroy() {
        if (this.displayTimer) {
            clearTimeout(this.displayTimer);
        }
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        console.log('Display Manager détruit');
    }
    
    // Méthodes publiques pour l'administration
    getCurrentAnnouncement() {
        return this.priorityQueue[this.currentIndex];
    }
    
    getQueueInfo() {
        return {
            total: this.priorityQueue.length,
            current: this.currentIndex + 1,
            emergencyMode: this.emergencyMode,
            isPlaying: this.isPlaying
        };
    }
    
    forceShowAnnouncement(announcementId) {
        const index = this.priorityQueue.findIndex(a => a.id === announcementId);
        if (index !== -1) {
            this.goToAnnouncement(index);
        }
    }
}
