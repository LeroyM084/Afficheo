class TemplateManager {
    constructor() {
        this.templates = [];
        this.currentEditingIndex = -1;
        this.init();
    }

    init() {
        this.loadTemplates();
        this.createDefaultTemplates();
        console.log('Template Manager initialisé');
    }

    loadTemplates() {
        const saved = localStorage.getItem('templates');
        if (saved) {
            this.templates = JSON.parse(saved);
        }
    }

    saveTemplates() {
        localStorage.setItem('templates', JSON.stringify(this.templates));
    }

    createDefaultTemplates() {
        if (this.templates.length === 0) {
            const defaultTemplates = [
                {
                    id: 1,
                    name: 'Information Standard',
                    category: 'info',
                    description: 'Template standard pour les informations générales',
                    layout: 'text-only',
                    theme: 'campus',
                    config: {
                        titleFont: 'Roboto',
                        titleSize: 'large',
                        entryAnimation: 'fadeIn',
                        exitAnimation: 'fadeOut',
                        colors: {
                            primary: '#2196F3',
                            secondary: '#FFF',
                            accent: '#FF9800'
                        }
                    },
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Alerte Urgence',
                    category: 'urgence',
                    description: 'Template pour les messages d\'urgence',
                    layout: 'text-only',
                    theme: 'urgence',
                    config: {
                        titleFont: 'Montserrat',
                        titleSize: 'xlarge',
                        entryAnimation: 'bounceIn',
                        exitAnimation: 'zoomOut',
                        colors: {
                            primary: '#f44336',
                            secondary: '#FFF',
                            accent: '#FFEB3B'
                        }
                    },
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Événement avec Image',
                    category: 'evenement',
                    description: 'Template pour les événements avec support d\'image',
                    layout: 'image-left',
                    theme: 'success',
                    config: {
                        titleFont: 'Poppins',
                        titleSize: 'medium',
                        entryAnimation: 'slideInLeft',
                        exitAnimation: 'slideOutRight',
                        colors: {
                            primary: '#4caf50',
                            secondary: '#FFF',
                            accent: '#FFC107'
                        }
                    },
                    createdAt: new Date().toISOString()
                },
                {
                    id: 4,
                    name: 'Annonce Sportive',
                    category: 'sport',
                    description: 'Template dynamique pour les événements sportifs',
                    layout: 'split-screen',
                    theme: 'gradient',
                    config: {
                        titleFont: 'Montserrat',
                        titleSize: 'large',
                        entryAnimation: 'zoomIn',
                        exitAnimation: 'slideOutUp',
                        colors: {
                            primary: '#667eea',
                            secondary: '#FFF',
                            accent: '#764ba2'
                        }
                    },
                    createdAt: new Date().toISOString()
                },
                {
                    id: 5,
                    name: 'Promotion Campus',
                    category: 'promo',
                    description: 'Template attractif pour les promotions',
                    layout: 'image-background',
                    theme: 'warning',
                    config: {
                        titleFont: 'Poppins',
                        titleSize: 'xlarge',
                        entryAnimation: 'slideInUp',
                        exitAnimation: 'fadeOut',
                        colors: {
                            primary: '#ff9800',
                            secondary: '#FFF',
                            accent: '#4caf50'
                        }
                    },
                    createdAt: new Date().toISOString()
                }
            ];

            this.templates = defaultTemplates;
            this.saveTemplates();
        }
    }

    renderTemplatesGrid() {
        // Correction : cibler la bonne grille et message vide cohérent avec admin.js
        const grid = document.getElementById('existing-templates');
        if (!grid) {
            console.warn('Grille de templates non trouvée');
            return;
        }

        if (this.templates.length === 0) {
            grid.innerHTML = `
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
            return;
        }

        grid.innerHTML = this.templates.map((template, index) => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-preview-thumb">
                    ${this.generatePreviewHTML(template)}
                </div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <span class="template-category ${template.category}">${template.category}</span>
                    <p class="template-description">${template.description}</p>
                    <div class="template-actions">
                        <button class="btn btn-secondary btn-sm" onclick="editTemplate(${index})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="duplicateTemplate(${index})">
                            <i class="fas fa-copy"></i> Dupliquer
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteTemplate(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    generatePreviewHTML(template) {
        const layoutClass = `layout-${template.layout}`;
        const themeClass = `template-${template.theme}`;
        
        return `
            <div class="template-preview ${layoutClass} ${themeClass}" style="width: 100%; height: 100%;">
                ${this.getLayoutContent(template)}
            </div>
        `;
    }

    getLayoutContent(template) {
        switch (template.layout) {
            case 'text-only':
                return `
                    <div style="padding: 10px; text-align: center;">
                        <h3 style="margin: 0 0 5px 0; font-size: 0.9em;">Titre de l'annonce</h3>
                        <p style="margin: 0; font-size: 0.7em; opacity: 0.8;">Contenu de l'annonce...</p>
                    </div>
                `;
                
            case 'image-left':
                return `
                    <div style="display: grid; grid-template-columns: 30px 1fr; padding: 8px; gap: 8px; height: 100%;">
                        <div style="background: rgba(255,255,255,0.3); border-radius: 3px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-image" style="font-size: 0.7em;"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0 0 3px 0; font-size: 0.8em;">Titre</h4>
                            <p style="margin: 0; font-size: 0.6em; opacity: 0.8;">Contenu...</p>
                        </div>
                    </div>
                `;
                
            case 'image-right':
                return `
                    <div style="display: grid; grid-template-columns: 1fr 30px; padding: 8px; gap: 8px; height: 100%;">
                        <div>
                            <h4 style="margin: 0 0 3px 0; font-size: 0.8em;">Titre</h4>
                            <p style="margin: 0; font-size: 0.6em; opacity: 0.8;">Contenu...</p>
                        </div>
                        <div style="background: rgba(255,255,255,0.3); border-radius: 3px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-image" style="font-size: 0.7em;"></i>
                        </div>
                    </div>
                `;
                
            case 'image-top':
                return `
                    <div style="height: 100%;">
                        <div style="height: 40%; background: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-image" style="font-size: 0.8em;"></i>
                        </div>
                        <div style="padding: 5px; height: 60%;">
                            <h4 style="margin: 0 0 2px 0; font-size: 0.7em;">Titre</h4>
                            <p style="margin: 0; font-size: 0.5em; opacity: 0.8;">Contenu...</p>
                        </div>
                    </div>
                `;
                
            case 'split-screen':
                return `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; height: 100%;">
                        <div style="padding: 8px; background: rgba(0,0,0,0.1);">
                            <h4 style="margin: 0 0 3px 0; font-size: 0.7em;">Section 1</h4>
                            <p style="margin: 0; font-size: 0.5em;">Contenu...</p>
                        </div>
                        <div style="padding: 8px;">
                            <h4 style="margin: 0 0 3px 0; font-size: 0.7em;">Section 2</h4>
                            <p style="margin: 0; font-size: 0.5em;">Contenu...</p>
                        </div>
                    </div>
                `;
                
            default:
                return `
                    <div style="padding: 10px; text-align: center; display: flex; align-items: center; justify-content: center; height: 100%;">
                        <div>
                            <i class="fas fa-eye" style="font-size: 1.2em; margin-bottom: 5px; display: block;"></i>
                            <span style="font-size: 0.7em;">Aperçu</span>
                        </div>
                    </div>
                `;
        }
    }

    addTemplate(templateData) {
        const template = {
            id: Date.now(),
            ...templateData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.templates.push(template);
        this.saveTemplates();
        this.renderTemplatesGrid();
        
        return template;
    }

    updateTemplate(index, templateData) {
        if (index >= 0 && index < this.templates.length) {
            this.templates[index] = {
                ...this.templates[index],
                ...templateData,
                updatedAt: new Date().toISOString()
            };
            this.saveTemplates();
            this.renderTemplatesGrid();
            
            return this.templates[index];
        }
        return null;
    }

    deleteTemplate(index) {
        if (index >= 0 && index < this.templates.length) {
            this.templates.splice(index, 1);
            this.saveTemplates();
            this.renderTemplatesGrid();
            return true;
        }
        return false;
    }

    duplicateTemplate(index) {
        if (index >= 0 && index < this.templates.length) {
            const original = this.templates[index];
            const duplicate = {
                ...original,
                id: Date.now(),
                name: `${original.name} (Copie)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.templates.push(duplicate);
            this.saveTemplates();
            this.renderTemplatesGrid();
            
            return duplicate;
        }
        return null;
    }

    getTemplate(id) {
        return this.templates.find(template => template.id === id);
    }

    getTemplatesByCategory(category) {
        return this.templates.filter(template => template.category === category);
    }

    exportTemplates() {
        const dataStr = JSON.stringify(this.templates, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'templates_campus_emineo.json';
        link.click();
    }

    importTemplates(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTemplates = JSON.parse(e.target.result);
                if (Array.isArray(importedTemplates)) {
                    this.templates = [...this.templates, ...importedTemplates];
                    this.saveTemplates();
                    this.renderTemplatesGrid();
                    alert(`${importedTemplates.length} templates importés avec succès!`);
                }
            } catch (error) {
                alert('Erreur lors de l\'importation des templates');
            }
        };
        reader.readAsText(file);
    }
}

// Instance globale
let templateManager;

// Fonctions globales pour l'interface
function showAddTemplateModal() {
    templateManager.currentEditingIndex = -1;
    document.getElementById('template-modal-title').textContent = 'Nouveau Template';
    fillTemplateForm();
    updateLayoutPreview();
    document.getElementById('template-modal').style.display = 'block';
}

function editTemplate(index) {
    templateManager.currentEditingIndex = index;
    const template = templateManager.templates[index];
    
    document.getElementById('template-modal-title').textContent = 'Modifier Template';
    fillTemplateForm(template);
    updateLayoutPreview();
    document.getElementById('template-modal').style.display = 'block';
}

function duplicateTemplate(index) {
    if (confirm('Dupliquer ce template?')) {
        templateManager.duplicateTemplate(index);
    }
}

function deleteTemplate(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template?')) {
        templateManager.deleteTemplate(index);
    }
}

function closeTemplateModal() {
    document.getElementById('template-modal').style.display = 'none';
    resetTemplateForm();
}

function fillTemplateForm(template = null) {
    const form = document.getElementById('template-form');
    
    if (template) {
        document.getElementById('template-name').value = template.name || '';
        document.getElementById('template-category').value = template.category || 'info';
        document.getElementById('template-description').value = template.description || '';
        document.getElementById('template-layout').value = template.layout || 'text-only';
        document.getElementById('template-theme').value = template.theme || 'campus';
        
        if (template.config) {
            document.getElementById('title-font').value = template.config.titleFont || 'Roboto';
            document.getElementById('title-size').value = template.config.titleSize || 'medium';
            document.getElementById('entry-animation').value = template.config.entryAnimation || 'fadeIn';
            document.getElementById('exit-animation').value = template.config.exitAnimation || 'fadeOut';
            
            if (template.config.colors) {
                document.getElementById('primary-color').value = template.config.colors.primary || '#2196F3';
                document.getElementById('secondary-color').value = template.config.colors.secondary || '#FFF';
                document.getElementById('accent-color').value = template.config.colors.accent || '#FF9800';
            }
        }
    } else {
        form.reset();
        document.getElementById('template-category').value = 'info';
        document.getElementById('template-layout').value = 'text-only';
        document.getElementById('template-theme').value = 'campus';
        document.getElementById('title-font').value = 'Roboto';
        document.getElementById('title-size').value = 'medium';
        document.getElementById('entry-animation').value = 'fadeIn';
        document.getElementById('exit-animation').value = 'fadeOut';
    }
    
    updateThemeControls();
}

function resetTemplateForm() {
    document.getElementById('template-form').reset();
    updateThemeControls();
}

function updateThemeControls() {
    const theme = document.getElementById('template-theme').value;
    const customColors = document.getElementById('custom-colors');
    
    if (theme === 'custom') {
        customColors.style.display = 'block';
    } else {
        customColors.style.display = 'none';
    }
}

function updateLayoutPreview() {
    const preview = document.getElementById('template-preview');
    if (!preview) return;
    
    const formData = getFormData();
    const mockTemplate = {
        name: formData.name || 'Aperçu Template',
        layout: formData.layout,
        theme: formData.theme,
        config: {
            titleFont: formData.titleFont,
            titleSize: formData.titleSize,
            colors: {
                primary: formData.primaryColor,
                secondary: formData.secondaryColor,
                accent: formData.accentColor
            }
        }
    };
    
    preview.innerHTML = generateFullPreview(mockTemplate);
    applyPreviewStyles(preview, mockTemplate);
}

function generateFullPreview(template) {
    const layoutClass = `layout-${template.layout}`;
    
    switch (template.layout) {
        case 'text-only':
            return `
                <div class="preview-content ${layoutClass}" style="padding: 30px; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
                    <h2 style="margin: 0 0 15px 0; font-family: ${template.config.titleFont};">Titre de l'annonce</h2>
                    <p style="margin: 0; font-size: 1.1em; opacity: 0.9;">Contenu principal de l'annonce qui sera affiché aux étudiants...</p>
                </div>
            `;
            
        case 'image-left':
            return `
                <div class="preview-content ${layoutClass}" style="display: grid; grid-template-columns: 120px 1fr; gap: 20px; padding: 20px; height: 100%; align-items: center;">
                    <div style="background: rgba(255,255,255,0.2); border-radius: 8px; height: 80px; display: flex; align-items: center; justify-content: center; border: 2px dashed rgba(255,255,255,0.4);">
                        <i class="fas fa-image" style="font-size: 1.5em; opacity: 0.7;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0 0 10px 0; font-family: ${template.config.titleFont};">Titre avec Image</h2>
                        <p style="margin: 0; opacity: 0.9;">Description ou contenu de l'annonce...</p>
                    </div>
                </div>
            `;
            
        case 'image-right':
            return `
                <div class="preview-content ${layoutClass}" style="display: grid; grid-template-columns: 1fr 120px; gap: 20px; padding: 20px; height: 100%; align-items: center;">
                    <div>
                        <h2 style="margin: 0 0 10px 0; font-family: ${template.config.titleFont};">Titre avec Image</h2>
                        <p style="margin: 0; opacity: 0.9;">Description ou contenu de l'annonce...</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); border-radius: 8px; height: 80px; display: flex; align-items: center; justify-content: center; border: 2px dashed rgba(255,255,255,0.4);">
                        <i class="fas fa-image" style="font-size: 1.5em; opacity: 0.7;"></i>
                    </div>
                </div>
            `;
            
        case 'image-top':
            return `
                <div class="preview-content ${layoutClass}" style="height: 100%;">
                    <div style="height: 60%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; border-bottom: 2px dashed rgba(255,255,255,0.4);">
                        <i class="fas fa-image" style="font-size: 2em; opacity: 0.7;"></i>
                    </div>
                    <div style="padding: 15px; height: 40%; display: flex; flex-direction: column; justify-content: center;">
                        <h3 style="margin: 0 0 8px 0; font-family: ${template.config.titleFont};">Titre</h3>
                        <p style="margin: 0; font-size: 0.9em; opacity: 0.9;">Contenu sous l'image</p>
                    </div>
                </div>
            `;
            
        case 'split-screen':
            return `
                <div class="preview-content ${layoutClass}" style="display: grid; grid-template-columns: 1fr 1fr; height: 100%;">
                    <div style="padding: 20px; background: rgba(0,0,0,0.1); display: flex; flex-direction: column; justify-content: center;">
                        <h3 style="margin: 0 0 10px 0; font-family: ${template.config.titleFont};">Section Gauche</h3>
                        <p style="margin: 0; opacity: 0.9;">Contenu de la première section</p>
                    </div>
                    <div style="padding: 20px; display: flex; flex-direction: column; justify-content: center;">
                        <h3 style="margin: 0 0 10px 0; font-family: ${template.config.titleFont};">Section Droite</h3>
                        <p style="margin: 0; opacity: 0.9;">Contenu de la seconde section</p>
                    </div>
                </div>
            `;
            
        default:
            return `
                <div style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                    <i class="fas fa-eye" style="font-size: 2em; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="margin: 0; opacity: 0.7;">Aperçu du template</p>
                </div>
            `;
    }
}

function applyPreviewStyles(preview, template) {
    let bgColor, textColor;
    
    if (template.theme === 'custom') {
        bgColor = template.config.colors.primary;
        textColor = template.config.colors.secondary;
    } else {
        switch (template.theme) {
            case 'campus':
                preview.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
                textColor = '#fff';
                break;
            case 'urgence':
                preview.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
                textColor = '#fff';
                break;
            case 'success':
                preview.style.background = 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)';
                textColor = '#fff';
                break;
            case 'warning':
                preview.style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
                textColor = '#fff';
                break;
            case 'dark':
                preview.style.background = 'linear-gradient(135deg, #424242 0%, #212121 100%)';
                textColor = '#fff';
                break;
            case 'gradient':
                preview.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                textColor = '#fff';
                break;
        }
    }
    
    if (template.theme === 'custom') {
        preview.style.background = `linear-gradient(135deg, ${bgColor} 0%, ${template.config.colors.accent} 100%)`;
    }
    
    preview.style.color = textColor;
    
    // Appliquer la police du titre
    const titleElements = preview.querySelectorAll('h1, h2, h3, h4');
    titleElements.forEach(el => {
        el.style.fontFamily = template.config.titleFont;
    });
    
    // Appliquer la taille du titre
    const titleSizes = {
        small: '1.2em',
        medium: '1.5em',
        large: '2em',
        xlarge: '2.5em'
    };
    
    titleElements.forEach(el => {
        el.style.fontSize = titleSizes[template.config.titleSize] || titleSizes.medium;
    });
}

function getFormData() {
    return {
        name: document.getElementById('template-name').value,
        category: document.getElementById('template-category').value,
        description: document.getElementById('template-description').value,
        layout: document.getElementById('template-layout').value,
        theme: document.getElementById('template-theme').value,
        titleFont: document.getElementById('title-font').value,
        titleSize: document.getElementById('title-size').value,
        entryAnimation: document.getElementById('entry-animation').value,
        exitAnimation: document.getElementById('exit-animation').value,
        primaryColor: document.getElementById('primary-color').value,
        secondaryColor: document.getElementById('secondary-color').value,
        accentColor: document.getElementById('accent-color').value
    };
}

function refreshPreview() {
    updateLayoutPreview();
}

function testAnimation() {
    const preview = document.getElementById('template-preview');
    const entryAnimation = document.getElementById('entry-animation').value;
    
    if (entryAnimation && entryAnimation !== 'none') {
        preview.style.animation = 'none';
        setTimeout(() => {
            preview.style.animation = `${entryAnimation} 1s ease-in-out`;
        }, 100);
        
        setTimeout(() => {
            preview.style.animation = 'none';
        }, 1100);
    }
}

function saveTemplate() {
    const formData = getFormData();
    
    if (!formData.name.trim()) {
        alert('Le nom du template est requis');
        return;
    }
    
    const templateData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        layout: formData.layout,
        theme: formData.theme,
        config: {
            titleFont: formData.titleFont,
            titleSize: formData.titleSize,
            entryAnimation: formData.entryAnimation,
            exitAnimation: formData.exitAnimation,
            colors: {
                primary: formData.primaryColor,
                secondary: formData.secondaryColor,
                accent: formData.accentColor
            }
        }
    };
    
    if (templateManager.currentEditingIndex >= 0) {
        templateManager.updateTemplate(templateManager.currentEditingIndex, templateData);
        alert('Template modifié avec succès!');
    } else {
        templateManager.addTemplate(templateData);
        alert('Template créé avec succès!');
    }
    
    closeTemplateModal();
}

// Event listeners pour les templates
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le template manager
    templateManager = new TemplateManager();
    
    // Event listeners pour le formulaire
    document.getElementById('template-theme')?.addEventListener('change', function() {
        updateThemeControls();
        updateLayoutPreview();
    });
    
    document.getElementById('template-layout')?.addEventListener('change', updateLayoutPreview);
    document.getElementById('title-font')?.addEventListener('change', updateLayoutPreview);
    document.getElementById('title-size')?.addEventListener('change', updateLayoutPreview);
    document.getElementById('primary-color')?.addEventListener('change', updateLayoutPreview);
    document.getElementById('secondary-color')?.addEventListener('change', updateLayoutPreview);
    document.getElementById('accent-color')?.addEventListener('change', updateLayoutPreview);
    
    // Fermeture modal avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('template-modal');
            if (modal && modal.style.display === 'block') {
                closeTemplateModal();
            }
        }
    });
    
    // Fermeture modal en cliquant en dehors
    document.getElementById('template-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeTemplateModal();
        }
    });
});

// Export pour utilisation dans d'autres modules
window.templateManager = templateManager;
