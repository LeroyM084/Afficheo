// js/templates.js
class TemplateEngine {
    static templates = {
        basic: `
            <div class="announcement-slide template-basic">
                <div class="content">
                    <div class="logo">
                        <h2>{{schoolName}}</h2>
                    </div>
                    <div class="main-content">
                        <h1>{{title}}</h1>
                        <p class="description">{{content}}</p>
                        {{#if location}}
                        <div class="location">
                            <i class="icon-location"></i>
                            <span>{{location}}</span>
                        </div>
                        {{/if}}
                    </div>
                    <div class="category-tag category-{{category}}">
                        {{categoryName}}
                    </div>
                </div>
            </div>
        `,
        
        'breaking-news': `
            <div class="announcement-slide template-breaking-news">
                <div class="breaking-header">
                    <div class="breaking-text">BREAKING NEWS</div>
                    <div class="breaking-time">{{currentTime}}</div>
                </div>
                <div class="content">
                    <h1>{{title}}</h1>
                    <p class="news-content">{{content}}</p>
                    <div class="news-footer">
                        <span class="school-badge">{{schoolName}}</span>
                        <span class="priority-badge priority-{{priority}}">{{priorityText}}</span>
                    </div>
                </div>
                <div class="ticker">
                    <div class="ticker-content">
                        <span>{{tickerText}}</span>
                    </div>
                </div>
            </div>
        `,
        
        event: `
            <div class="announcement-slide template-event">
                <div class="event-header">
                    <div class="event-date">
                        <div class="day">{{eventDay}}</div>
                        <div class="month">{{eventMonth}}</div>
                    </div>
                    <div class="event-title">
                        <h1>{{title}}</h1>
                        <div class="event-type">{{categoryName}}</div>
                    </div>
                </div>
                <div class="event-content">
                    <p class="description">{{content}}</p>
                    {{#if location}}
                    <div class="event-details">
                        <div class="detail-item">
                            <strong>Lieu :</strong> {{location}}
                        </div>
                        <div class="detail-item">
                            <strong>École :</strong> {{schoolName}}
                        </div>
                    </div>
                    {{/if}}
                </div>
                <div class="event-footer">
                    <div class="cta">Ne manquez pas cet événement !</div>
                </div>
            </div>
        `,
        
        planning: `
            <div class="announcement-slide template-planning">
                <div class="planning-header">
                    <h1>Planning</h1>
                    <div class="week-info">{{weekDate}}</div>
                </div>
                <div class="planning-content">
                    <div class="school-section">
                        <h2>{{schoolName}}</h2>
                        <div class="planning-title">{{title}}</div>
                        <div class="planning-description">{{content}}</div>
                    </div>
                </div>
                <div class="planning-footer">
                    <div class="update-info">Dernière mise à jour : {{updateTime}}</div>
                </div>
            </div>
        `
    };
    
    static render(templateName, data) {
        const template = this.templates[templateName];
        if (!template) {
            console.warn(`Template "${templateName}" not found, using basic template`);
            return this.render('basic', data);
        }
        
        const processedData = this.preprocessData(data);
        return this.processTemplate(template, processedData);
    }
    
    static processTemplate(template, data) {
        let rendered = template;
        
        // Process conditional blocks {{#if property}}...{{/if}}
        rendered = rendered.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, property, content) => {
            return data[property] ? content : '';
        });
        
        // Process simple variables {{property}}
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            rendered = rendered.replace(regex, data[key] || '');
        });
        
        return rendered;
    }
    
    static preprocessData(announcement) {
        const data = { ...announcement };
        
        // Add current time
        data.currentTime = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Add update time
        data.updateTime = new Date().toLocaleString('fr-FR');
        
        // Process dates
        if (announcement.startDate) {
            const date = new Date(announcement.startDate);
            data.eventDay = date.getDate().toString().padStart(2, '0');
            data.eventMonth = date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
            data.weekDate = `Semaine du ${date.toLocaleDateString('fr-FR')}`;
        }
        
        // School name mapping
        const schoolNames = {
            'sup-de-vinci': 'Sup de Vinci',
            'isvm': 'ISVM',
            'formasup': 'Formasup',
            'apivet': 'Apivet'
        };
        data.schoolName = schoolNames[data.school] || data.school;
        
        // Category name mapping
        const categoryNames = {
            'planning': 'Planning',
            'event': 'Événement',
            'promo': 'Promotion',
            'student-project': 'Projet Étudiant'
        };
        data.categoryName = categoryNames[data.category] || data.category;
        
        // Priority text mapping
        const priorityTexts = {
            'low': 'Information',
            'medium': 'Important',
            'high': 'Prioritaire',
            'urgent': 'Urgent'
        };
        data.priorityText = priorityTexts[data.priority] || data.priority;
        
        // Default ticker text
        data.tickerText = data.tickerText || `${data.schoolName} - ${data.title}`;
        
        return data;
    }
}

// Global template functions
window.TemplateEngine = TemplateEngine;
