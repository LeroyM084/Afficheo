class RoyalSliderManager {
    constructor() {
        this.slider = null;
        this.currentSlides = [];
        this.isInitialized = false;
        this.settings = {
            autoPlay: {
                enabled: true,
                pauseOnHover: false,
                delay: 10000
            },
            transitionSpeed: 600,
            keyboardNavEnabled: false,
            controlNavigation: 'none',
            arrowsNavigation: false,
            fadeinLoadedSlide: false,
            slidesSpacing: 0,
            loop: true,
            imageScaleMode: 'fill',
            imageAlignCenter: true,
            autoScaleSlider: true,
            allowCSS3: true,
            addActiveClass: true
        };
    }

    async init() {
        if (!window.jQuery) {
            console.error('jQuery requis pour RoyalSlider');
            return false;
        }

        const sliderContainer = $('#announcement-slider');
        if (sliderContainer.length === 0) {
            console.error('Container slider non trouvé');
            return false;
        }

        this.slider = sliderContainer.royalSlider(this.settings);
        this.isInitialized = true;
        
        // Event listeners
        this.slider.ev.on('rsAfterSlideChange', () => {
            this.onSlideChange();
        });

        console.log('RoyalSlider initialisé');
        return true;
    }

    loadAnnouncements(announcements) {
        if (!this.isInitialized) {
            console.error('Slider non initialisé');
            return;
        }

        this.currentSlides = announcements.filter(ann => 
            ann.status === 'active' && this.isAnnouncementValid(ann)
        );

        this.refreshSlider();
    }

    refreshSlider() {
        if (!this.slider) return;

        // Arrêter le slider
        this.slider.ev.trigger('rsPause');
        
        // Vider les slides existantes
        const sliderData = this.slider.data('royalSlider');
        sliderData.slides.forEach(() => {
            sliderData.removeSlide(0);
        });

        // Ajouter les nouvelles slides
        this.currentSlides.forEach(announcement => {
            const slideHTML = this.generateSlideHTML(announcement);
            sliderData.appendSlide(slideHTML);
        });

        if (this.currentSlides.length > 0) {
            // Redémarrer le slider
            sliderData.goTo(0);
            this.slider.ev.trigger('rsPlay');
        }
    }

    generateSlideHTML(announcement) {
        const template = this.getTemplate(announcement.templateId);
        if (!template) {
            return this.generateDefaultSlide(announcement);
        }

        return this.generateTemplatedSlide(announcement, template);
    }

    generateTemplatedSlide(announcement, template) {
        const layoutClass = `layout-${template.layout}`;
        const themeClass = `template-${template.theme}`;
        
        let slideContent = '';
        
        switch (template.layout) {
            case 'text-only':
                slideContent = `
                    <div class="slide-content ${layoutClass} ${themeClass}">
                        <div class="text-container">
                            <h1 class="slide-title">${announcement.title}</h1>
                            <div class="slide-description">${announcement.message}</div>
                            ${this.generateMetaInfo(announcement)}
                        </div>
                    </div>
                `;
                break;
                
            case 'image-left':
                slideContent = `
                    <div class="slide-content ${layoutClass} ${themeClass}">
                        <div class="image-container">
                            ${announcement.imageUrl ? 
                                `<img src="${announcement.imageUrl}" alt="${announcement.title}">` :
                                `<div class="placeholder-image"><i class="fas fa-image"></i></div>`
                            }
                        </div>
                        <div class="text-container">
                            <h1 class="slide-title">${announcement.title}</h1>
                            <div class="slide-description">${announcement.message}</div>
                            ${this.generateMetaInfo(announcement)}
                        </div>
                    </div>
                `;
                break;
                
            case 'image-right':
                slideContent = `
                    <div class="slide-content ${layoutClass} ${themeClass}">
                        <div class="text-container">
                            <h1 class="slide-title">${announcement.title}</h1>
                            <div class="slide-description">${announcement.message}</div>
                            ${this.generateMetaInfo(announcement)}
                        </div>
                        <div class="image-container">
                            ${announcement.imageUrl ? 
                                `<img src="${announcement.imageUrl}" alt="${announcement.title}">` :
                                `<div class="placeholder-image"><i class="fas fa-image"></i></div>`
                            }
                        </div>
                    </div>
                `;
                break;
                
            case 'image-background':
                slideContent = `
                    <div class="slide-content ${layoutClass} ${themeClass}" ${announcement.imageUrl ? `style="background-image: url('${announcement.imageUrl}')"` : ''}>
                        <div class="overlay"></div>
                        <div class="text-container">
                            <h1 class="slide-title">${announcement.title}</h1>
                            <div class="slide-description">${announcement.message}</div>
                            ${this.generateMetaInfo(announcement)}
                        </div>
                    </div>
                `;
                break;
                
            default:
                slideContent = this.generateDefaultSlide(announcement);
        }
        
        return `<div class="announcement-slide" data-id="${announcement.id}">${slideContent}</div>`;
    }

    generateDefaultSlide(announcement) {
        const priorityClass = `priority-${announcement.priority}`;
        
        return `
            <div class="slide-content default-layout ${priorityClass}">
                <div class="text-container">
                    <h1 class="slide-title">${announcement.title}</h1>
                    <div class="slide-description">${announcement.message}</div>
                    ${this.generateMetaInfo(announcement)}
                </div>
            </div>
        `;
    }

    generateMetaInfo(announcement) {
        const now = new Date();
        const created = new Date(announcement.createdAt);
        const isRecent = (now - created) < 24 * 60 * 60 * 1000; // Moins de 24h
        
        return `
            <div class="slide-meta">
                ${isRecent ? '<span class="new-badge">NOUVEAU</span>' : ''}
                ${announcement.priority === 'urgence' ? '<span class="priority-badge urgence"><i class="fas fa-exclamation-triangle"></i> URGENT</span>' : ''}
                ${announcement.location ? `<span class="location-badge"><i class="fas fa-map-marker-alt"></i> ${announcement.location}</span>` : ''}
            </div>
        `;
    }

    getTemplate(templateId) {
        if (window.templateManager) {
            return window.templateManager.getTemplate(templateId);
        }
        return null;
    }

    isAnnouncementValid(announcement) {
        const now = new Date();
        
        if (announcement.startDate && new Date(announcement.startDate) > now) {
            return false;
        }
        
        if (announcement.endDate && new Date(announcement.endDate) < now) {
            return false;
        }
        
        return true;
    }

    onSlideChange() {
        // Logique pour gérer le changement de slide
        const currentSlide = this.slider.data('royalSlider').currSlideId;
        console.log('Slide changée:', currentSlide);
    }

    pause() {
        if (this.slider) {
            this.slider.ev.trigger('rsPause');
        }
    }

    play() {
        if (this.slider) {
            this.slider.ev.trigger('rsPlay');
        }
    }

    goToSlide(index) {
        if (this.slider) {
            this.slider.data('royalSlider').goTo(index);
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        if (this.slider) {
            // Reinitialiser avec les nouveaux paramètres
            this.destroy();
            this.init();
        }
    }

    destroy() {
        if (this.slider) {
            this.slider.data('royalSlider').destroy();
            this.slider = null;
            this.isInitialized = false;
        }
    }
}

// Instance globale
window.royalSliderManager = new RoyalSliderManager();
