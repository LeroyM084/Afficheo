class TemplateRenderer {
    constructor() {
        this.templates = {
            'basic': this.basicTemplate,
            'breaking-news': this.breakingNewsTemplate,
            'event': this.eventTemplate,
            'planning': this.planningTemplate,
            'promo': this.promoTemplate
        };
    }
    
    render(announcement) {
        const template = announcement.template || 'basic';
        const renderFunction = this.templates[template] || this.templates['basic'];
        
        return renderFunction.call(this, announcement);
    }
    
    basicTemplate(announcement) {
        return `
            <div class="announcement-content basic-template">
                <div class="announcement-header">
                    <div class="school-badge ${this.getSchoolColor(announcement.school)}">
                        ${this.getSchoolName(announcement.school)}
                    </div>
                    <div class="category-badge ${announcement.category}">
                        ${this.getCategoryName(announcement.category)}
                    </div>
                </div>
                
                <div class="announcement-body">
                    <h1 class="announcement-title">${announcement.title}</h1>
                    <div class="announcement-text">
                        ${this.formatContent(announcement.content)}
                    </div>
                </div>
                
                <div class="announcement-footer">
                    <div class="announcement-date">
                        ${this.formatDate(announcement.createdAt)}
                    </div>
                    <div class="priority-indicator priority-${announcement.priority}">
                        ${this.getPriorityIcon(announcement.priority)}
                    </div>
                </div>
            </div>
        `;
    }
    
    breakingNewsTemplate(announcement) {
        return `
            <div class="announcement-content breaking-news-template">
                <div class="breaking-news-banner">
                    <div class="breaking-news-ticker">
                        🚨 ANNONCE IMPORTANTE 🚨
                    </div>
                </div>
                
                <div class="breaking-news-content">
                    <div class="news-header">
                        <div class="school-logo">
                            ${this.getSchoolLogo(announcement.school)}
                        </div>
                        <div class="news-info">
                            <div class="school-name">${this.getSchoolName(announcement.school)}</div>
                            <div class="news-time">${this.formatTime(new Date())}</div>
                        </div>
                    </div>
                    
                    <div class="news-body">
                        <h1 class="news-title">${announcement.title}</h1>
                        <div class="news-content">
                            ${this.formatContent(announcement.content)}
                        </div>
                    </div>
                </div>
                
                <div class="breaking-news-footer">
                    <div class="news-ticker">
                        <span>📢 ${this.getSchoolName(announcement.school)} • ${this.getCategoryName(announcement.category)} • ${this.formatDate(announcement.createdAt)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    eventTemplate(announcement) {
        // Extraire les informations de l'événement depuis le contenu
        const eventInfo = this.parseEventInfo(announcement.content);
        
        return `
            <div class="announcement-content event-template">
                <div class="event-header">
                    <div class="event-type-badge">
                        📅 ÉVÉNEMENT
                    </div>
                    <div class="school-badge ${this.getSchoolColor(announcement.school)}">
                        ${this.getSchoolName(announcement.school)}
                    </div>
                </div>
                
                <div class="event-main">
                    <div class="event-visual">
                        <div class="event-icon">
                            ${this.getEventIcon(announcement.category)}
                        </div>
                    </div>
                    
                    <div class="event-details">
                        <h1 class="event-title">${announcement.title}</h1>
                        
                        <div class="event-info-grid">
                            ${eventInfo.date ? `
                                <div class="event-info-item">
                                    <span class="info-icon">📅</span>
                                    <span class="info-label">Date :</span>
                                    <span class="info-value">${eventInfo.date}</span>
                                </div>
                            ` : ''}
                            
                            ${eventInfo.time ? `
                                <div class="event-info-item">
                                    <span class="info-icon">🕐</span>
                                    <span class="info-label">Heure :</span>
                                    <span class="info-value">${eventInfo.time}</span>
                                </div>
                            ` : ''}
                            
                            ${eventInfo.location ? `
                                <div class="event-info-item">
                                    <span class="info-icon">📍</span>
                                    <span class="info-label">Lieu :</span>
                                    <span class="info-value">${eventInfo.location}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="event-description">
                            ${this.formatContent(eventInfo.description || announcement.content)}
                        </div>
                    </div>
                </div>
                
                <div class="event-footer">
                    <div class="event-cta">
                        <span class="cta-text">Plus d'informations auprès de l'accueil</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    planningTemplate(announcement) {
        return `
            <div class="announcement-content planning-template">
                <div class="planning-header">
                    <div class="planning-title">
                        <h1>📋 ${announcement.title}</h1>
                    </div>
                    <div class="school-badge ${this.getSchoolColor(announcement.school)}">
                        ${this.getSchoolName(announcement.school)}
                    </div>
                </div>
                
                <div class="planning-content">
                    <div class="planning-grid">
                        ${this.formatPlanningContent(announcement.content)}
                    </div>
                </div>
                
                <div class="planning-footer">
                    <div class="planning-note">
                        ⚠️ Vérifiez régulièrement les mises à jour
                    </div>
                    <div class="last-update">
                        Mis à jour le ${this.formatDate(announcement.createdAt)}
                    </div>
                </div>
            </div>
        `;
    }
    
    promoTemplate(announcement) {
        return `
            <div class="announcement-content promo-template">
                <div class="promo-background">
                    <div class="promo-overlay">
                        <div class="promo-content">
                            <div class="promo-header">
                                <div class="school-logo-large">
                                    ${this.getSchoolLogo(announcement.school)}
                                </div>
                                <div class="promo-badge">
                                    ✨ ${this.getSchoolName(announcement.school)} ✨
                                </div>
                            </div>
                            
                            <div class="promo-main">
                                <h1 class="promo-title">${announcement.title}</h1>
                                <div class="promo-description">
                                    ${this.formatContent(announcement.content)}
                                </div>
                            </div>
                            
                            <div class="promo-footer">
                                <div class="promo-cta">
                                    <span class="cta-highlight">Rejoignez-nous !</span>
                                </div>
                                <div class="contact-info">
                                    www.emineo-education.fr
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Méthodes utilitaires
    getSchoolName(schoolCode) {
        const schools = {
            'sup-de-vinci': 'Sup de Vinci',
            'isvm': 'ISVM',
            'formasup': 'Formasup',
            'apivet': 'Apivet'
        };
        return schools[schoolCode] || schoolCode;
    }
    
    getSchoolColor(schoolCode) {
        const colors = {
            'sup-de-vinci': 'blue',
            'isvm': 'green',
            'formasup': 'orange',
            'apivet': 'purple'
        };
        return colors[schoolCode] || 'blue';
    }
    
    getSchoolLogo(schoolCode) {
        const logos = {
            'sup-de-vinci': '🎓',
            'isvm': '💼',
            'formasup': '🏢',
            'apivet': '🐾'
        };
        return logos[schoolCode] || '🎓';
    }
    
    getCategoryName(categoryCode) {
        const categories = {
            'planning': 'Planning',
            'event': 'Événement',
            'promo': 'Promotion',
            'project': 'Projet',
            'info': 'Information'
        };
        return categories[categoryCode] || categoryCode;
    }
    
    getPriorityIcon(priority) {
        const icons = {
            'emergency': '🚨',
            'urgent': '⚠️',
            'high': '❗',
            'normal': 'ℹ️',
            'low': '💬'
        };
        return icons[priority] || 'ℹ️';
    }
    
    getEventIcon(category) {
        const icons = {
            'event': '🎉',
            'planning': '📋',
            'project': '💡',
            'info': '📢',
            'promo': '✨'
        };
        return icons[category] || '📅';
    }
    
    formatContent(content) {
        if (!content) return '';
        
        // Convertir les retours à la ligne en <br>
        content = content.replace(/\n/g, '<br>');
        
        // Formater les liens
        content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Formater les emails
        content = content.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 
            '<a href="mailto:$1">$1</a>');
        
        return content;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    formatTime(date) {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    parseEventInfo(content) {
        const eventInfo = {
            date: null,
            time: null,
            location: null,
            description: content
        };
        
        // Rechercher des patterns dans le contenu
        const datePattern = /Date\s*:\s*([^\n\r]+)/i;
        const timePattern = /Heure\s*:\s*([^\n\r]+)/i;
        const locationPattern = /Lieu\s*:\s*([^\n\r]+)/i;
        
        const dateMatch = content.match(datePattern);
        const timeMatch = content.match(timePattern);
        const locationMatch = content.match(locationPattern);
        
        if (dateMatch) eventInfo.date = dateMatch[1].trim();
        if (timeMatch) eventInfo.time = timeMatch[1].trim();
        if (locationMatch) eventInfo.location = locationMatch[1].trim();
        
        // Nettoyer la description en retirant les informations extraites
        let cleanDescription = content;
        if (dateMatch) cleanDescription = cleanDescription.replace(dateMatch[0], '');
        if (timeMatch) cleanDescription = cleanDescription.replace(timeMatch[0], '');
        if (locationMatch) cleanDescription = cleanDescription.replace(locationMatch[0], '');
        
        eventInfo.description = cleanDescription.trim();
        
        return eventInfo;
    }
    
    formatPlanningContent(content) {
        // Tenter de parser le contenu comme un planning
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) return '';
        
        return lines.map(line => {
            // Détecter si la ligne contient un horaire
            const timePattern = /(\d{1,2}[h:]\d{0,2})/;
            const timeMatch = line.match(timePattern);
            
            if (timeMatch) {
                const parts = line.split(timeMatch[0]);
                return `
                    <div class="planning-item">
                        <div class="planning-time">${timeMatch[0]}</div>
                        <div class="planning-activity">${parts[1] ? parts[1].trim() : parts[0].trim()}</div>
                    </div>
                `;
            } else {
                return `
                    <div class="planning-item full-width">
                        <div class="planning-activity">${line}</div>
                    </div>
                `;
            }
        }).join('');
    }
}
