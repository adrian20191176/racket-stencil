class SVGGridPlayground {
    constructor() {
        this.svg = document.getElementById('playground');
        this.objectsContainer = document.getElementById('objects');
        this.selectedObjectType = 'circle';
        this.objects = [];
        this.draggedObject = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createGridLines();
        this.setupObjectSelector();
    }
    
    setupEventListeners() {
        // SVG click event for placing objects
        this.svg.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.placeObject(e);
            }
        });
        
        // Mouse events for dragging
        this.svg.addEventListener('mousedown', (e) => {
            this.startDrag(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            this.drag(e);
        });
        
        document.addEventListener('mouseup', () => {
            this.endDrag();
        });
        
        // Touch events for mobile
        this.svg.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.startDrag(mouseEvent);
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.drag(mouseEvent);
        });
        
        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endDrag();
        });
        
        // Prevent context menu
        this.svg.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    setupObjectSelector() {
        const circleBtn = document.getElementById('circle-btn');
        const boxBtn = document.getElementById('box-btn');
        
        circleBtn.addEventListener('click', () => {
            this.selectedObjectType = 'circle';
            this.updateActiveButton(circleBtn, boxBtn);
        });
        
        boxBtn.addEventListener('click', () => {
            this.selectedObjectType = 'box';
            this.updateActiveButton(boxBtn, circleBtn);
        });
    }
    
    updateActiveButton(activeBtn, inactiveBtn) {
        activeBtn.classList.add('active');
        inactiveBtn.classList.remove('active');
    }
    
    createGridLines() {
        // Create a badminton racket head with 22 vertical and 23 horizontal strings
        const racketWidth = 800;
        const racketHeight = 600;
        const stringSpacing = 20; // Reduced spacing for smaller racket
        
        // Create oval racket head shape (vertical orientation) - smaller size
        const centerX = racketWidth / 2;
        const centerY = racketHeight / 2;
        const racketRadiusX = 180; // Horizontal radius (smaller)
        const racketRadiusY = 250; // Vertical radius (smaller - fits in viewport)
        
        // Calculate starting positions to center the racket
        const startX = centerX - (10.5 * stringSpacing);
        const startY = centerY - (11 * stringSpacing);
        
        // Create 22 vertical strings (curved to follow oval shape)
        for (let i = 0; i < 22; i++) {
            const stringX = startX + (i * stringSpacing);
            
            // Create vertical string segments that follow the oval curve
            for (let y = startY; y < startY + (22 * stringSpacing); y += 5) {
                // Check if this point is within the oval
                const normalizedX = (stringX - centerX) / racketRadiusX;
                const normalizedY = (y - centerY) / racketRadiusY;
                const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
                
                if (distance <= 1) {
                    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    vLine.setAttribute('x1', stringX);
                    vLine.setAttribute('y1', y);
                    vLine.setAttribute('x2', stringX);
                    vLine.setAttribute('y2', y + 5);
                    vLine.setAttribute('stroke', '#e0e0e0');
                    vLine.setAttribute('stroke-width', '1');
                    vLine.setAttribute('data-grid-line', 'vertical');
                    vLine.setAttribute('data-x', stringX);
                    vLine.setAttribute('data-y', y);
                    this.svg.appendChild(vLine);
                }
            }
        }
        
        // Create 23 horizontal strings (curved to follow oval shape)
        for (let i = 0; i < 23; i++) {
            const stringY = startY + (i * stringSpacing);
            
            // Create horizontal string segments that follow the oval curve
            for (let x = startX; x < startX + (21 * stringSpacing); x += 5) {
                // Check if this point is within the oval
                const normalizedX = (x - centerX) / racketRadiusX;
                const normalizedY = (stringY - centerY) / racketRadiusY;
                const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
                
                if (distance <= 1) {
                    const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    hLine.setAttribute('x1', x);
                    hLine.setAttribute('y1', stringY);
                    hLine.setAttribute('x2', x + 5);
                    hLine.setAttribute('y2', stringY);
                    hLine.setAttribute('stroke', '#e0e0e0');
                    hLine.setAttribute('stroke-width', '1');
                    hLine.setAttribute('data-grid-line', 'horizontal');
                    hLine.setAttribute('data-x', x);
                    hLine.setAttribute('data-y', stringY);
                    this.svg.appendChild(hLine);
                }
            }
        }
        
        // Add racket frame border
        const frame = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        frame.setAttribute('cx', centerX);
        frame.setAttribute('cy', centerY);
        frame.setAttribute('rx', racketRadiusX);
        frame.setAttribute('ry', racketRadiusY);
        frame.setAttribute('fill', 'none');
        frame.setAttribute('stroke', '#2c3e50');
        frame.setAttribute('stroke-width', '3');
        this.svg.appendChild(frame);
    }
    
    placeObject(e) {
        const rect = this.svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const object = this.createObject(x, y);
        this.objects.push(object);
        this.objectsContainer.appendChild(object.element);
        this.updateGridLines();
    }
    
    createObject(x, y) {
        const object = {
            id: Date.now() + Math.random(),
            type: this.selectedObjectType,
            x: x,
            y: y,
            element: null
        };
        
        if (this.selectedObjectType === 'circle') {
            object.element = this.createCircle(x, y);
        } else {
            object.element = this.createBox(x, y);
        }
        
        return object;
    }
    
    createCircle(x, y) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('data-object-id', Date.now() + Math.random());
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '25');
        circle.setAttribute('fill', 'transparent');
        circle.setAttribute('stroke', 'transparent');
        circle.setAttribute('stroke-width', '0');
        circle.setAttribute('cursor', 'move');
        circle.setAttribute('data-type', 'circle');
        
        // Add resize handle
        const resizeHandle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        resizeHandle.setAttribute('cx', x + 35);
        resizeHandle.setAttribute('cy', y + 35);
        resizeHandle.setAttribute('r', '8');
        resizeHandle.setAttribute('fill', 'rgba(52, 152, 219, 0.3)');
        resizeHandle.setAttribute('stroke', '#3498db');
        resizeHandle.setAttribute('stroke-width', '3');
        resizeHandle.setAttribute('cursor', 'nw-resize');
        resizeHandle.setAttribute('data-type', 'resize-handle');
        resizeHandle.style.display = 'none';
        
        group.appendChild(circle);
        group.appendChild(resizeHandle);
        
        return group;
    }
    
    createBox(x, y) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('data-object-id', Date.now() + Math.random());
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x - 25);
        rect.setAttribute('y', y - 25);
        rect.setAttribute('width', '50');
        rect.setAttribute('height', '50');
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('stroke', 'transparent');
        rect.setAttribute('stroke-width', '0');
        rect.setAttribute('cursor', 'move');
        rect.setAttribute('data-type', 'box');
        
        // Add resize handle
        const resizeHandle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        resizeHandle.setAttribute('x', x + 20);
        resizeHandle.setAttribute('y', y + 20);
        resizeHandle.setAttribute('width', '16');
        resizeHandle.setAttribute('height', '16');
        resizeHandle.setAttribute('fill', 'rgba(52, 152, 219, 0.3)');
        resizeHandle.setAttribute('stroke', '#3498db');
        resizeHandle.setAttribute('stroke-width', '3');
        resizeHandle.setAttribute('cursor', 'nw-resize');
        resizeHandle.setAttribute('data-type', 'resize-handle');
        resizeHandle.style.display = 'none';
        
        group.appendChild(rect);
        group.appendChild(resizeHandle);
        
        return group;
    }
    
    startDrag(e) {
        const target = e.target;
        const parentGroup = target.closest('g');
        
        if (target.getAttribute('data-type') === 'resize-handle') {
            // Start resizing
            this.isResizing = true;
            this.draggedObject = parentGroup;
            this.resizeStartX = e.clientX;
            this.resizeStartY = e.clientY;
            this.originalSize = this.getObjectSize(parentGroup);
        } else if (target.getAttribute('data-type') === 'circle' || target.getAttribute('data-type') === 'box') {
            // Start dragging
            this.draggedObject = parentGroup;
            this.isDragging = true;
            
            const rect = this.svg.getBoundingClientRect();
            const objectX = target.getAttribute('data-type') === 'circle' ? 
                parseFloat(target.getAttribute('cx')) : 
                parseFloat(target.getAttribute('x')) + 25;
            const objectY = target.getAttribute('data-type') === 'circle' ? 
                parseFloat(target.getAttribute('cy')) : 
                parseFloat(target.getAttribute('y')) + 25;
            
            this.dragOffset.x = e.clientX - rect.left - objectX;
            this.dragOffset.y = e.clientY - rect.top - objectY;
            
            // Show resize handle
            this.showResizeHandle(parentGroup);
        }
    }
    
    drag(e) {
        if (!this.isDragging && !this.isResizing) return;
        
        if (this.isDragging && this.draggedObject) {
            const rect = this.svg.getBoundingClientRect();
            const x = e.clientX - rect.left - this.dragOffset.x;
            const y = e.clientY - rect.top - this.dragOffset.y;
            
                         // Constrain to racket boundaries (oval shape)
             const centerX = 400;
             const centerY = 300;
             const racketRadiusX = 180;
             const racketRadiusY = 250;
            
            const normalizedX = (x - centerX) / racketRadiusX;
            const normalizedY = (y - centerY) / racketRadiusY;
            const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
            
            let constrainedX = x;
            let constrainedY = y;
            
            if (distance > 0.8) { // Keep objects within 80% of racket area
                const angle = Math.atan2(normalizedY, normalizedX);
                constrainedX = centerX + Math.cos(angle) * racketRadiusX * 0.8;
                constrainedY = centerY + Math.sin(angle) * racketRadiusY * 0.8;
            }
            
            const object = this.draggedObject.querySelector('[data-type="circle"], [data-type="box"]');
            const resizeHandle = this.draggedObject.querySelector('[data-type="resize-handle"]');
            
            if (object.getAttribute('data-type') === 'circle') {
                object.setAttribute('cx', constrainedX);
                object.setAttribute('cy', constrainedY);
                resizeHandle.setAttribute('cx', constrainedX + 35);
                resizeHandle.setAttribute('cy', constrainedY + 35);
            } else {
                const size = this.getObjectSize(this.draggedObject);
                object.setAttribute('x', constrainedX - size.width / 2);
                object.setAttribute('y', constrainedY - size.height / 2);
                resizeHandle.setAttribute('x', constrainedX + size.width / 2 + 5);
                resizeHandle.setAttribute('y', constrainedY + size.height / 2 + 5);
            }
            
            this.updateGridLines();
        } else if (this.isResizing && this.draggedObject) {
            const deltaX = e.clientX - this.resizeStartX;
            const deltaY = e.clientY - this.resizeStartY;
            const scale = Math.max(0.5, 1 + (deltaX + deltaY) / 100);
            
            this.resizeObject(this.draggedObject, scale);
            this.updateGridLines();
        }
    }
    
    endDrag() {
        if (this.draggedObject) {
            this.draggedObject = null;
        }
        this.isDragging = false;
        this.isResizing = false;
    }
    
    updateGridLines() {
        // Reset all grid lines to default color
        const gridLines = this.svg.querySelectorAll('[data-grid-line]');
        gridLines.forEach(line => {
            line.setAttribute('stroke', '#e0e0e0');
            line.setAttribute('stroke-width', '1');
        });
        
        // Check each object against grid line segments
        this.objects.forEach(object => {
            const element = object.element;
            const objectElement = element.querySelector('[data-type="circle"], [data-type="box"]');
            let objectX, objectY, objectRadius;
            
            if (objectElement.getAttribute('data-type') === 'circle') {
                objectX = parseFloat(objectElement.getAttribute('cx'));
                objectY = parseFloat(objectElement.getAttribute('cy'));
                objectRadius = parseFloat(objectElement.getAttribute('r'));
            } else {
                const size = this.getObjectSize(element);
                objectX = parseFloat(objectElement.getAttribute('x')) + size.width / 2;
                objectY = parseFloat(objectElement.getAttribute('y')) + size.height / 2;
                objectRadius = Math.max(size.width, size.height) / 2;
            }
            
            // Check each line segment
            const allLines = this.svg.querySelectorAll('[data-grid-line]');
            allLines.forEach(line => {
                const lineX = parseFloat(line.getAttribute('data-x'));
                const lineY = parseFloat(line.getAttribute('data-y'));
                const isVertical = line.getAttribute('data-grid-line') === 'vertical';
                
                let lineCenterX, lineCenterY;
                
                if (isVertical) {
                    lineCenterX = lineX;
                    lineCenterY = lineY + 2.5; // Center of the 5px vertical segment
                } else {
                    lineCenterX = lineX + 2.5; // Center of the 5px horizontal segment
                    lineCenterY = lineY;
                }
                
                // Check if this line segment overlaps with the object
                const distance = Math.sqrt(
                    Math.pow(objectX - lineCenterX, 2) + 
                    Math.pow(objectY - lineCenterY, 2)
                );
                
                if (distance <= objectRadius) {
                    line.setAttribute('stroke', '#000000');
                    line.setAttribute('stroke-width', '2');
                }
            });
        });
    }
    
    getObjectSize(group) {
        const object = group.querySelector('[data-type="circle"], [data-type="box"]');
        if (object.getAttribute('data-type') === 'circle') {
            const radius = parseFloat(object.getAttribute('r'));
            return { width: radius * 2, height: radius * 2 };
        } else {
            return {
                width: parseFloat(object.getAttribute('width')),
                height: parseFloat(object.getAttribute('height'))
            };
        }
    }
    
    resizeObject(group, scale) {
        const object = group.querySelector('[data-type="circle"], [data-type="box"]');
        const resizeHandle = group.querySelector('[data-type="resize-handle"]');
        
        if (object.getAttribute('data-type') === 'circle') {
            const newRadius = 25 * scale;
            object.setAttribute('r', newRadius);
            resizeHandle.setAttribute('cx', parseFloat(object.getAttribute('cx')) + newRadius + 10);
            resizeHandle.setAttribute('cy', parseFloat(object.getAttribute('cy')) + newRadius + 10);
        } else {
            const newWidth = 50 * scale;
            const newHeight = 50 * scale;
            object.setAttribute('width', newWidth);
            object.setAttribute('height', newHeight);
            resizeHandle.setAttribute('x', parseFloat(object.getAttribute('x')) + newWidth + 5);
            resizeHandle.setAttribute('y', parseFloat(object.getAttribute('y')) + newHeight + 5);
        }
    }
    
    showResizeHandle(group) {
        const resizeHandle = group.querySelector('[data-type="resize-handle"]');
        resizeHandle.style.display = 'block';
        
        // Hide other resize handles
        this.svg.querySelectorAll('[data-type="resize-handle"]').forEach(handle => {
            if (handle !== resizeHandle) {
                handle.style.display = 'none';
            }
        });
    }
}

// Initialize the playground when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SVGGridPlayground();
});
