class TemplateEditor {
    constructor() {
        this.currentTemplate = null;
        this.selectedElement = null;
        this.canvas = null;
        this.zoom = 1;
        this.draggedElement = null;
        this.elementCounter = 0;
        
        this.init();
    }
    
    init() {
        this.canvas = document.getElementById('canvas-content');
        this.setupEventListeners();
        this.loadExistingTemplates();
    }
    
    setupEventListeners() {
        // Modal controls
        const createTemplateBtn = document.getElementById('create-template-btn');
        if (createTemplateBtn) {
            createTemplateBtn.addEventListener('click', () => {
                this.openTemplateEditor();
            });
        }
        
        const closeTemplateEditorBtn = document.getElementById('close-template-editor');
        if (closeTemplateEditorBtn) {
            closeTemplateEditorBtn.addEventListener('click', () => {
                this.closeTemplateEditor();
            });
        }
        
        const closePreviewBtn = document.getElementById('close-preview');
        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => {
                this.closePreview();
            });
        }
        
        // Editor controls
        const saveTemplateBtn = document.getElementById('save-template');
        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', () => {
                this.saveTemplate();
            });
        }
        
        const cancelTemplateEditBtn = document.getElementById('cancel-template-edit');
        if (cancelTemplateEditBtn) {
            cancelTemplateEditBtn.addEventListener('click', () => {
                this.closeTemplateEditor();
            });
        }
        
        const previewTemplateBtn = document.getElementById('preview-template');
        if (previewTemplateBtn) {
            previewTemplateBtn.addEventListener('click', () => {
                this.previewTemplate();
            });
        }
        
        const clearCanvasBtn = document.getElementById('clear-canvas');
        if (clearCanvasBtn) {
            clearCanvasBtn.addEventListener('click', () => {
                this.clearCanvas();
            });
        }
        
        // Zoom controls
        const zoomInBtn = document.getElementById('zoom-in');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoomIn();
            });
        }
        
        const zoomOutBtn = document.getElementById('zoom-out');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoomOut();
            });
        }
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Layout options
        this.setupLayoutOptions();
        
        // Canvas interactions
        this.setupCanvasInteractions();
    }
    
    setupDragAndDrop() {
        const draggableElements = document.querySelectorAll('.draggable-element');
        
        draggableElements.forEach(element => {
            element.addEventListener('dragstart', (e) => {
                this.draggedElement = e.target.dataset.type;
                e.dataTransfer.effectAllowed = 'copy';
            });
            
            element.draggable = true;
        });
        
        // Canvas drop zone
        if (this.canvas) {
            this.canvas.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                this.canvas.classList.add('drag-over');
            });
            
            this.canvas.addEventListener('dragleave', () => {
                this.canvas.classList.remove('drag-over');
            });
            
            this.canvas.addEventListener('drop', (e) => {
                e.preventDefault();
                this.canvas.classList.remove('drag-over');
                
                if (this.draggedElement) {
                    const rect = this.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    this.createElement(this.draggedElement, x, y);
                    this.draggedElement = null;
                }
            });
        }
    }
    
    setupLayoutOptions() {
        const layoutOptions = document.querySelectorAll('.layout-option');
        
        layoutOptions.forEach(option => {
            option.addEventListener('click', () => {
                const layout = option.dataset.layout;
                this.applyLayout(layout);
                
                // Update active state
                layoutOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }
    
    setupCanvasInteractions() {
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => {
                if (e.target === this.canvas || e.target.classList.contains('drop-zone')) {
                    this.deselectElement();
                }
            });
        }
    }
    
    openTemplateEditor(template = null) {
        this.currentTemplate = template;
        
        if (template) {
            document.getElementById('template-editor-title').textContent = 'Modifier le Template';
            document.getElementById('template-name').value = template.name;
            document.getElementById('template-description').value = template.description;
            this.loadTemplateToCanvas(template);
        } else {
            document.getElementById('template-editor-title').textContent = 'Créer un Template';
            document.getElementById('template-name').value = '';
            document.getElementById('template-description').value = '';
            this.clearCanvas();
        }
        
        document.getElementById('template-editor-modal').style.display = 'block';
    }
    
    closeTemplateEditor() {
        document.getElementById('template-editor-modal').style.display = 'none';
        this.currentTemplate = null;
        this.selectedElement = null;
        this.clearCanvas();
    }
    
    clearCanvas() {
        // Remove drop zone if it exists
        const dropZone = this.canvas.querySelector('.drop-zone');
        if (dropZone) {
            dropZone.remove();
        }
        
        // Clear all elements
        const elements = this.canvas.querySelectorAll('.canvas-element');
        elements.forEach(el => el.remove());
        
        // Add drop zone back
        this.addDropZone();
        
        // Clear properties panel
        this.updatePropertiesPanel(null);
    }
    
    addDropZone() {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = `
            <i class="icon-plus"></i>
            <p>Glissez des éléments ici ou choisissez un layout</p>
        `;
        this.canvas.appendChild(dropZone);
    }
    
    createElement(type, x, y) {
        // Remove drop zone if it exists
        const dropZone = this.canvas.querySelector('.drop-zone');
        if (dropZone) {
            dropZone.remove();
        }
        
        this.elementCounter++;
        const element = document.createElement('div');
        element.className = 'canvas-element';
        element.dataset.type = type;
        element.dataset.id = `element_${this.elementCounter}`;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        
        // Add controls
        const controls = document.createElement('div');
        controls.className = 'element-controls';
        controls.innerHTML = `
            <button class="element-control-btn edit" title="Modifier">
                <i class="icon-edit"></i>
            </button>
            <button class="element-control-btn copy" title="Dupliquer">
                <i class="icon-copy"></i>
            </button>
            <button class="element-control-btn delete" title="Supprimer">
                <i class="icon-trash"></i>
            </button>
        `;
        element.appendChild(controls);
        
        // Add content based on type
        this.setElementContent(element, type);
        
        // Make draggable
        this.makeElementDraggable(element);
        
        // Add click handler
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });
        
        // Add control handlers
        controls.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteElement(element);
        });
        
        controls.querySelector('.copy').addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyElement(element);
        });
        
        this.canvas.appendChild(element);
        this.selectElement(element);
        
        return element;
    }
    
    setElementContent(element, type) {
        let content = '';
        let className = `element-${type}`;
        
        switch (type) {
            case 'title':
                content = '<h1 contenteditable="true">Titre de l\'annonce</h1>';
                break;
            case 'text':
                content = '<p contenteditable="true">Votre texte ici...</p>';
                break;
            case 'image':
                content = '<div class="image-placeholder">Image<br><small>Cliquez pour changer</small></div>';
                break;
            case 'logo':
                content = '<div class="logo-placeholder">{{schoolName}}</div>';
                break;
             case 'date':
                content = '<div class="date-display">{{eventDate}}</div>';
                break;
            case 'category':
                content = '<span class="category-badge">{{category}}</span>';
                break;
            case 'divider':
                content = '<hr class="divider-line">';
                break;
            default:
                content = '<div>Élément inconnu</div>';
        }
        
        element.innerHTML = controls.outerHTML + `<div class="${className}">${content}</div>`;
        
        // Re-get controls after innerHTML update
        const newControls = element.querySelector('.element-controls');
        
        // Re-add control handlers
        newControls.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteElement(element);
        });
        
        newControls.querySelector('.copy').addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyElement(element);
        });
    }
    
    makeElementDraggable(element) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('element-control-btn')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(element.style.left) || 0;
            startTop = parseInt(element.style.top) || 0;
            
            element.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            element.style.left = `${startLeft + deltaX}px`;
            element.style.top = `${startTop + deltaY}px`;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'move';
            }
        });
    }
    
    selectElement(element) {
        // Deselect previous
        this.deselectElement();
        
        // Select new
        element.classList.add('selected');
        this.selectedElement = element;
        
        // Update properties panel
        this.updatePropertiesPanel(element);
    }
    
    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
            this.selectedElement = null;
        }
        this.updatePropertiesPanel(null);
    }
    
    deleteElement(element) {
        if (confirm('Supprimer cet élément ?')) {
            element.remove();
            if (this.selectedElement === element) {
                this.selectedElement = null;
                this.updatePropertiesPanel(null);
            }
            
            // Add drop zone if no elements left
            const elements = this.canvas.querySelectorAll('.canvas-element');
            if (elements.length === 0) {
                this.addDropZone();
            }
        }
    }
    
    copyElement(element) {
        const rect = element.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const newX = parseInt(element.style.left) + 20;
        const newY = parseInt(element.style.top) + 20;
        
        this.createElement(element.dataset.type, newX, newY);
    }
    
    updatePropertiesPanel(element) {
        const panel = document.getElementById('properties-content');
        
        if (!element) {
            panel.innerHTML = '<p>Sélectionnez un élément pour voir ses propriétés</p>';
            return;
        }
        
        const type = element.dataset.type;
        let propertiesHTML = '';
        
        // Common properties
        propertiesHTML += `
            <div class="property-group">
                <h5>Position</h5>
                <div class="property-row">
                    <label>X:</label>
                    <input type="number" id="prop-x" value="${parseInt(element.style.left) || 0}" min="0" max="800">
                </div>
                <div class="property-row">
                    <label>Y:</label>
                    <input type="number" id="prop-y" value="${parseInt(element.style.top) || 0}" min="0" max="600">
                </div>
            </div>
            
            <div class="property-group">
                <h5>Dimension</h5>
                <div class="property-row">
                    <label>Largeur:</label>
                    <input type="number" id="prop-width" value="${parseInt(element.style.width) || 200}" min="50" max="800">
                </div>
                <div class="property-row">
                    <label>Hauteur:</label>
                    <input type="number" id="prop-height" value="${parseInt(element.style.height) || 50}" min="20" max="600">
                </div>
            </div>
        `;
        
        // Type-specific properties
        switch (type) {
            case 'title':
            case 'text':
                propertiesHTML += `
                    <div class="property-group">
                        <h5>Texte</h5>
                        <div class="property-row">
                            <label>Taille:</label>
                            <select id="prop-font-size">
                                <option value="12px">12px</option>
                                <option value="14px">14px</option>
                                <option value="16px" selected>16px</option>
                                <option value="18px">18px</option>
                                <option value="24px">24px</option>
                                <option value="32px">32px</option>
                                <option value="48px">48px</option>
                            </select>
                        </div>
                        <div class="property-row">
                            <label>Couleur:</label>
                            <input type="color" id="prop-color" value="#333333" class="color-picker">
                        </div>
                        <div class="property-row">
                            <label>Alignement:</label>
                            <select id="prop-text-align">
                                <option value="left">Gauche</option>
                                <option value="center">Centre</option>
                                <option value="right">Droite</option>
                            </select>
                        </div>
                        <div class="property-row">
                            <label>Gras:</label>
                            <input type="checkbox" id="prop-bold">
                        </div>
                    </div>
                `;
                break;
                
            case 'image':
                propertiesHTML += `
                    <div class="property-group">
                        <h5>Image</h5>
                        <div class="property-row">
                            <label>URL:</label>
                            <input type="url" id="prop-image-url" placeholder="https://...">
                        </div>
                        <div class="property-row">
                            <label>Ajustement:</label>
                            <select id="prop-object-fit">
                                <option value="cover">Couvrir</option>
                                <option value="contain">Contenir</option>
                                <option value="fill">Remplir</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'category':
                propertiesHTML += `
                    <div class="property-group">
                        <h5>Catégorie</h5>
                        <div class="property-row">
                            <label>Couleur de fond:</label>
                            <input type="color" id="prop-bg-color" value="#ffc107" class="color-picker">
                        </div>
                        <div class="property-row">
                            <label>Couleur texte:</label>
                            <input type="color" id="prop-text-color" value="#333333" class="color-picker">
                        </div>
                        <div class="property-row">
                            <label>Bordure arrondie:</label>
                            <input type="range" id="prop-border-radius" min="0" max="25" value="20" class="slider-input">
                        </div>
                    </div>
                `;
                break;
        }
        
        // Background properties
        propertiesHTML += `
            <div class="property-group">
                <h5>Arrière-plan</h5>
                <div class="property-row">
                    <label>Couleur:</label>
                    <input type="color" id="prop-background" value="#ffffff" class="color-picker">
                </div>
                <div class="property-row">
                    <label>Opacité:</label>
                    <input type="range" id="prop-opacity" min="0" max="1" step="0.1" value="1" class="slider-input">
                </div>
            </div>
        `;
        
        panel.innerHTML = propertiesHTML;
        
        // Add event listeners for property changes
        this.setupPropertyListeners(element);
    }
    
    setupPropertyListeners(element) {
        // Position
        const propX = document.getElementById('prop-x');
        const propY = document.getElementById('prop-y');
        const propWidth = document.getElementById('prop-width');
        const propHeight = document.getElementById('prop-height');
        
        if (propX) propX.addEventListener('input', (e) => {
            element.style.left = e.target.value + 'px';
        });
        
        if (propY) propY.addEventListener('input', (e) => {
            element.style.top = e.target.value + 'px';
        });
        
        if (propWidth) propWidth.addEventListener('input', (e) => {
            element.style.width = e.target.value + 'px';
        });
        
        if (propHeight) propHeight.addEventListener('input', (e) => {
            element.style.height = e.target.value + 'px';
        });
        
        // Text properties
        const propFontSize = document.getElementById('prop-font-size');
        const propColor = document.getElementById('prop-color');
        const propTextAlign = document.getElementById('prop-text-align');
        const propBold = document.getElementById('prop-bold');
        
        if (propFontSize) propFontSize.addEventListener('change', (e) => {
            const textElement = element.querySelector('h1, p, div');
            if (textElement) textElement.style.fontSize = e.target.value;
        });
        
        if (propColor) propColor.addEventListener('input', (e) => {
            const textElement = element.querySelector('h1, p, div');
            if (textElement) textElement.style.color = e.target.value;
        });
        
        if (propTextAlign) propTextAlign.addEventListener('change', (e) => {
            const textElement = element.querySelector('h1, p, div');
            if (textElement) textElement.style.textAlign = e.target.value;
        });
        
        if (propBold) propBold.addEventListener('change', (e) => {
            const textElement = element.querySelector('h1, p, div');
            if (textElement) textElement.style.fontWeight = e.target.checked ? 'bold' : 'normal';
        });
        
        // Background properties
        const propBackground = document.getElementById('prop-background');
        const propOpacity = document.getElementById('prop-opacity');
        
        if (propBackground) propBackground.addEventListener('input', (e) => {
            element.style.backgroundColor = e.target.value;
        });
        
        if (propOpacity) propOpacity.addEventListener('input', (e) => {
            element.style.opacity = e.target.value;
        });
    }
    
    applyLayout(layoutType) {
        this.clearCanvas();
        
        switch (layoutType) {
            case 'basic':
                this.createElement('title', 50, 50);
                this.createElement('text', 50, 150);
                break;
                
            case 'two-column':
                this.createElement('title', 50, 50);
                this.createElement('text', 50, 150);
                this.createElement('image', 450, 150);
                break;
                
            case 'header-content':
                this.createElement('logo', 50, 30);
                this.createElement('category', 650, 40);
                this.createElement('title', 50, 100);
                this.createElement('text', 50, 200);
                this.createElement('divider', 50, 350);
                this.createElement('date', 50, 400);
                break;
                
            case 'full-image':
                this.createElement('image', 50, 50);
                this.createElement('title', 50, 400);
                this.createElement('text', 50, 500);
                break;
        }
    }
    
    zoomIn() {
        this.zoom = Math.min(2, this.zoom + 0.2);
        this.updateZoom();
    }
    
    zoomOut() {
        this.zoom = Math.max(0.5, this.zoom - 0.2);
        this.updateZoom();
    }
    
    updateZoom() {
        this.canvas.style.transform = `scale(${this.zoom})`;
        document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';
    }
    
    saveTemplate() {
        const name = document.getElementById('template-name').value;
        const description = document.getElementById('template-description').value;
        
        if (!name.trim()) {
            alert('Veuillez saisir un nom pour le template');
            return;
        }
        
        const elements = [];
        const canvasElements = this.canvas.querySelectorAll('.canvas-element');
        
        canvasElements.forEach(element => {
            elements.push(this.serializeElement(element));
        });
        
        const template = {
            id: this.currentTemplate ? this.currentTemplate.id : Date.now(),
            name: name.trim(),
            description: description.trim(),
            elements: elements,
            createdAt: this.currentTemplate ? this.currentTemplate.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage (you can replace with API call)
        const templates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
        
        if (this.currentTemplate) {
            const index = templates.findIndex(t => t.id === this.currentTemplate.id);
            if (index !== -1) {
                templates[index] = template;
            }
        } else {
            templates.push(template);
        }
        
        localStorage.setItem('customTemplates', JSON.stringify(templates));
        
        alert('Template sauvegardé avec succès !');
        this.closeTemplateEditor();
        this.loadExistingTemplates();
    }
    
    serializeElement(element) {
        return {
            id: element.dataset.id,
            type: element.dataset.type,
            style: {
                left: element.style.left,
                top: element.style.top,
                width: element.style.width,
                height: element.style.height,
                backgroundColor: element.style.backgroundColor,
                opacity: element.style.opacity
            },
            content: this.getElementContent(element)
        };
    }
    
    getElementContent(element) {
        const contentElement = element.querySelector('.element-title, .element-text, .element-image, .element-logo, .element-date, .element-category, .element-divider');
        return contentElement ? contentElement.innerHTML : '';
    }
    
    loadExistingTemplates() {
        const templates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
        const container = document.getElementById('existing-templates');
        
        container.innerHTML = '';
        
        templates.forEach(template => {
            const card = this.createTemplateCard(template);
            container.appendChild(card);
        });
        
        if (templates.length === 0) {
            container.innerHTML = '<p class="text-muted">Aucun template personnalisé trouvé.</p>';
        }
    }
    
    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        
        card.innerHTML = `
            <div class="template-preview-thumb">
                <div class="template-thumb-content">
                    ${this.generateThumbnail(template)}
                </div>
            </div>
            <div class="template-card-content">
                <h4>${template.name}</h4>
                <p>${template.description || 'Aucune description'}</p>
                <div class="template-actions">
                    <button class="btn btn-sm btn-primary edit-template" data-id="${template.id}">
                        <i class="icon-edit"></i> Modifier
                    </button>
                    <button class="btn btn-sm btn-secondary duplicate-template" data-id="${template.id}">
                        <i class="icon-copy"></i> Dupliquer
                    </button>
                    <button class="btn btn-sm btn-danger delete-template" data-id="${template.id}">
                        <i class="icon-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.edit-template').addEventListener('click', () => {
            this.openTemplateEditor(template);
        });
        
        card.querySelector('.duplicate-template').addEventListener('click', () => {
            this.duplicateTemplate(template);
        });
        
        card.querySelector('.delete-template').addEventListener('click', () => {
            this.deleteTemplate(template.id);
        });
        
        return card;
    }
    
    generateThumbnail(template) {
        // Generate a simple thumbnail representation
        let thumbnailHTML = '<div style="position: relative; width: 100%; height: 100%; font-size: 8px;">';
        
        template.elements.forEach(element => {
            const x = parseInt(element.style.left) / 10;
            const y = parseInt(element.style.top) / 10;
            const width = parseInt(element.style.width) / 10 || 20;
            const height = parseInt(element.style.height) / 10 || 5;
            
            let color = '#ddd';
            switch (element.type) {
                case 'title': color = '#007bff'; break;
                case 'text': color = '#666'; break;
                case 'image': color = '#28a745'; break;
                case 'logo': color = '#ffc107'; break;
            }
            
            thumbnailHTML += `
                <div style="
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    width: ${width}px;
                    height: ${height}px;
                    background: ${color};
                    border-radius: 1px;
                "></div>
            `;
        });
        
        thumbnailHTML += '</div>';
        return thumbnailHTML;
    }
    
    duplicateTemplate(template) {
        const newTemplate = {
            ...template,
            id: Date.now(),
            name: template.name + ' (Copie)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const templates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
        templates.push(newTemplate);
        localStorage.setItem('customTemplates', JSON.stringify(templates));
        
        this.loadExistingTemplates();
        alert('Template dupliqué avec succès !');
    }
    
    deleteTemplate(templateId) {
        if (confirm('Supprimer ce template définitivement ?')) {
            const templates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
            const filteredTemplates = templates.filter(t => t.id !== templateId);
            localStorage.setItem('customTemplates', JSON.stringify(filteredTemplates));
            
            this.loadExistingTemplates();
            alert('Template supprimé avec succès !');
        }
    }
    
    previewTemplate() {
        const elements = [];
        const canvasElements = this.canvas.querySelectorAll('.canvas-element');
        
        canvasElements.forEach(element => {
            elements.push(this.serializeElement(element));
        });
        
        if (elements.length === 0) {
            alert('Aucun élément à prévisualiser');
            return;
        }
        
        this.showPreview(elements);
    }
    
    showPreview(elements) {
        const previewScreen = document.getElementById('preview-screen');
        
        let previewHTML = '<div style="position: relative; width: 100%; height: 100%; color: white; font-family: Arial, sans-serif;">';
        
        elements.forEach(element => {
            previewHTML += `
                <div style="
                    position: absolute;
                    left: ${element.style.left};
                    top: ${element.style.top};
                    width: ${element.style.width || 'auto'};
                    height: ${element.style.height || 'auto'};
                    background-color: ${element.style.backgroundColor || 'transparent'};
                    opacity: ${element.style.opacity || 1};
                ">
                    ${this.renderElementForPreview(element)}
                </div>
            `;
        });
        
        previewHTML += '</div>';
        previewScreen.innerHTML = previewHTML;
        
        document.getElementById('template-preview-modal').style.display = 'block';
    }
    
    renderElementForPreview(element) {
        // Replace placeholders with sample data
        let content = element.content;
        content = content.replace('{{schoolName}}', 'Sup de Vinci');
        content = content.replace('{{eventDate}}', new Date().toLocaleDateString());
        content = content.replace('{{category}}', 'Événement');
        
        return content;
    }
    
    closePreview() {
        document.getElementById('template-preview-modal').style.display = 'none';
    }
}

// Initialize template editor when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.templateEditor = new TemplateEditor();
});
