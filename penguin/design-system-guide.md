# 🐧 Penguin Sensei Design System Guide

A comprehensive, professional CSS framework inspired by modern glassmorphism design and Japanese aesthetics.

## 🎨 Overview

The Penguin Sensei Design System provides everything you need to build beautiful, modern web applications with a consistent visual language. It features glassmorphism effects, professional gradients, comprehensive components, and mobile-first responsive design.

## 🚀 Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
    <link rel="stylesheet" href="penguin-sensei-design-system.css">
</head>
<body>
    <!-- Your content here -->
</body>
</html>
```

## 🎯 Core Principles

1. **Glassmorphism First** - Beautiful backdrop blur effects and transparency
2. **Mobile Responsive** - Mobile-first design that scales beautifully
3. **Professional Gradients** - Carefully crafted color combinations
4. **Japanese Typography** - Optimized for both Latin and Japanese text
5. **Accessibility** - Proper contrast ratios and keyboard navigation
6. **Performance** - Lightweight and optimized for fast loading

## 🌈 Color System

### Primary Colors
```css
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--primary-blue: #667eea
--primary-purple: #764ba2
```

### Semantic Colors
```css
--success: #48bb78
--warning: #ed8936  
--error: #f56565
--info: #3cb5e5
```

### WaniKani SRS Colors
```css
--wk-lesson: #ff6b6b      /* Red - not started */
--wk-apprentice: #ff8f23  /* Orange - learning */
--wk-guru: #9c4699        /* Purple - confident */
--wk-master: #3cb5e5      /* Blue - mastered */
--wk-enlightened: #3cb5e5 /* Light blue - mastered+ */
--wk-burned: #434343      /* Gray - permanent */
```

### Neutral Grays
```css
--gray-50: #f7fafc   /* Very light backgrounds */
--gray-100: #edf2f7  /* Light backgrounds */
--gray-200: #e2e8f0  /* Borders */
--gray-300: #cbd5e0  /* Disabled states */
--gray-500: #718096  /* Secondary text */
--gray-700: #2d3748  /* Primary text */
--gray-800: #1a202c  /* Dark text */
```

## 📐 Layout System

### Container
```html
<div class="container">
    <!-- Content constrained to max 1200px width -->
</div>
```

### Flexbox Utilities
```html
<div class="flex items-center justify-between gap-md">
    <div>Left content</div>
    <div>Right content</div>
</div>
```

### Grid System
```html
<!-- Auto-fill grid for cards -->
<div class="grid grid-auto-fill gap-lg">
    <div class="glass-card">Card 1</div>
    <div class="glass-card">Card 2</div>
    <div class="glass-card">Card 3</div>
</div>

<!-- Fixed columns -->
<div class="grid grid-cols-3 gap-lg">
    <div>Column 1</div>
    <div>Column 2</div>
    <div>Column 3</div>
</div>
```

## 🧩 Components

### Glass Cards
```html
<!-- Standard glass card -->
<div class="glass-card">
    <h3>Card Title</h3>
    <p>Beautiful glassmorphism effect with backdrop blur.</p>
</div>

<!-- Dark glass card -->
<div class="glass-card glass-card-dark">
    <h3>Dark Card</h3>
    <p>Perfect for overlays and hero sections.</p>
</div>
```

### Buttons
```html
<!-- Primary button -->
<button class="btn btn-primary">
    <span>Save Changes</span>
</button>

<!-- Secondary button -->
<button class="btn btn-secondary">
    Cancel
</button>

<!-- Success button with icon -->
<button class="btn btn-success">
    <span>✓</span>
    <span>Complete</span>
</button>

<!-- Loading button -->
<button class="btn btn-primary loading">
    <div class="loading-spinner"></div>
    <span>Processing...</span>
</button>

<!-- Round icon button -->
<button class="btn btn-primary btn-round">
    ⚙️
</button>
```

### Form Controls
```html
<div class="form-group">
    <label class="form-label" for="email">Email Address</label>
    <input type="email" id="email" class="form-input" placeholder="Enter your email">
</div>

<div class="form-group">
    <label class="form-label" for="message">Message</label>
    <textarea id="message" class="form-textarea" placeholder="Your message"></textarea>
</div>

<!-- Search input -->
<input type="search" class="search-input" placeholder="Search...">
```

### Level Cards (for learning apps)
```html
<div class="level-card">
    <div class="level-header">
        <h3 class="level-title">Level 1</h3>
        <span class="level-badge">Beginner</span>
    </div>
    
    <div class="progress">
        <div class="progress-header">
            <span>Progress</span>
            <span>75%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 75%"></div>
        </div>
    </div>
    
    <div class="cta">
        <button class="btn btn-primary">Start Learning</button>
    </div>
</div>
```

### Kanji Grid System
```html
<div class="kanji-grid">
    <div class="kanji-item">上</div>
    <div class="kanji-item wk-guru">下</div>
    <div class="kanji-item wk-master">大</div>
    <!-- Add WaniKani SRS classes: wk-lesson, wk-apprentice, wk-guru, wk-master, wk-enlightened, wk-burned -->
</div>
```

### Modal System
```html
<div id="myModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2 class="modal-title">Settings</h2>
            <button class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
            <p>Modal content goes here.</p>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-secondary">Cancel</button>
            <button class="btn btn-primary">Save</button>
        </div>
    </div>
</div>

<!-- JavaScript to show modal -->
<script>
document.getElementById('myModal').classList.add('active');
</script>
```

### Tab System
```html
<div class="tabs">
    <button class="tab active" data-tab="profile">Profile</button>
    <button class="tab" data-tab="settings">Settings</button>
    <button class="tab" data-tab="data">Data</button>
</div>

<div id="profile" class="tab-content active">
    <p>Profile content</p>
</div>

<div id="settings" class="tab-content">
    <p>Settings content</p>
</div>

<div id="data" class="tab-content">
    <p>Data content</p>
</div>
```

### Header Component
```html
<header class="header">
    <div class="container">
        <div class="logo">
            <img src="logo.png" alt="Logo">
            <a href="#">App Name</a>
        </div>
        
        <div class="flex items-center gap-lg">
            <input type="search" class="search-input" placeholder="Search...">
            <button class="btn btn-round btn-primary">⚙️</button>
        </div>
    </div>
</header>
```

### Image Upload & Gallery
```html
<!-- Upload area -->
<div class="image-upload-area">
    <p class="upload-text">📸 Click or drag to upload images</p>
</div>

<!-- Image gallery -->
<div class="uploaded-images">
    <div class="uploaded-image">
        <img src="image1.jpg" alt="Image 1">
        <button class="delete-image">×</button>
    </div>
    <div class="uploaded-image">
        <img src="image2.jpg" alt="Image 2">
        <button class="delete-image">×</button>
    </div>
</div>
```

### Image Lightbox
```html
<div id="lightbox" class="lightbox">
    <div class="lightbox-content">
        <button class="lightbox-close">×</button>
        <img class="lightbox-image" src="" alt="Full size image">
    </div>
</div>
```

### Status Indicators
```html
<div class="flex items-center gap-sm">
    <span class="status-indicator connected"></span>
    <span>API Connected</span>
</div>

<div class="flex items-center gap-sm">
    <span class="status-indicator disconnected"></span>
    <span>Not Connected</span>
</div>

<div class="flex items-center gap-sm">
    <span class="status-indicator checking"></span>
    <span>Checking Connection...</span>
</div>
```

## 🔤 Typography

### Headings
```html
<h1 class="h1">Main Title</h1>
<h2 class="h2">Section Title</h2>
<h3 class="h3">Subsection</h3>
<!-- Or use regular h1, h2, h3 tags -->
```

### Text Sizes
```html
<p class="text-xs">Extra small text</p>
<p class="text-sm">Small text</p>
<p class="text-base">Regular text</p>
<p class="text-lg">Large text</p>
<p class="text-xl">Extra large text</p>
```

### Font Weights & Colors
```html
<p class="font-light text-gray-500">Light gray text</p>
<p class="font-medium text-gray-700">Medium weight</p>
<p class="font-bold text-primary">Bold primary color</p>
```

### Japanese Text
```html
<p class="font-japanese text-2xl">日本語のテキスト</p>
```

### Gradient Text
```html
<h1 class="gradient-text">Beautiful Gradient Text</h1>
```

## 📱 Responsive Design

The design system is mobile-first and includes three breakpoints:

- **Mobile**: Default (< 768px)
- **Tablet**: 768px and up
- **Desktop**: 1024px and up

### Responsive Grid Examples
```html
<!-- Stack on mobile, 2 columns on tablet, 3 on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
    <div class="glass-card">Card 1</div>
    <div class="glass-card">Card 2</div>
    <div class="glass-card">Card 3</div>
</div>
```

## 🎪 Advanced Features

### Custom Animations
```css
/* Custom fade-in animation */
.my-element {
    animation: fadeIn 0.5s ease-in;
}

/* Use the built-in fade-in class */
<div class="fade-in">This will fade in smoothly</div>
```

### Custom CSS Variables
```css
:root {
    /* Override default colors */
    --primary-blue: #your-color;
    --primary-purple: #your-color;
    
    /* Add custom variables */
    --my-custom-color: #ff6b6b;
}

/* Use in your styles */
.my-component {
    background: var(--my-custom-color);
}
```

### Glass Effect Customization
```css
.my-glass-card {
    background: rgba(255, 255, 255, 0.1); /* More transparent */
    backdrop-filter: blur(20px); /* Stronger blur */
    border: 1px solid rgba(255, 255, 255, 0.3);
}
```

## 🛠️ JavaScript Integration

### Modal Controls
```javascript
// Show modal
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide modal
function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close on background click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        hideModal(e.target.id);
    }
});
```

### Tab Controls
```javascript
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Activate clicked tab
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Tab click handlers
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
    });
});
```

### Image Lightbox
```javascript
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    
    lightboxImage.src = imageSrc;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close lightbox on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});
```

### Loading States
```javascript
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.innerHTML = '<div class="loading-spinner"></div><span>Loading...</span>';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = 'Original Text';
    }
}
```

## 🎨 Customization Examples

### Custom Theme Colors
```css
:root {
    /* Nature theme */
    --primary-gradient: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    --primary-blue: #48bb78;
    --primary-purple: #38a169;
}

:root {
    /* Sunset theme */
    --primary-gradient: linear-gradient(135deg, #fd9644 0%, #f687b3 100%);
    --primary-blue: #fd9644;
    --primary-purple: #f687b3;
}

:root {
    /* Ocean theme */
    --primary-gradient: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
    --primary-blue: #4299e1;
    --primary-purple: #3182ce;
}
```

### Dark Mode Support
```css
[data-theme="dark"] {
    --glass-bg: rgba(0, 0, 0, 0.7);
    --glass-border: rgba(255, 255, 255, 0.1);
    --gray-50: #1a202c;
    --gray-100: #2d3748;
    --gray-700: #e2e8f0;
    --gray-800: #f7fafc;
}

[data-theme="dark"] body {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    color: var(--gray-700);
}
```

## 🏗️ Build Integration

### Webpack/Vite
```javascript
// Import in your main CSS file
@import 'penguin-sensei-design-system.css';

// Or import in JavaScript
import 'penguin-sensei-design-system.css';
```

### CDN Usage
```html
<!-- Replace with actual CDN link when published -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/penguin-sensei-design-system@latest/dist/penguin-sensei.min.css">
```

## 🤝 Best Practices

1. **Use Semantic HTML** - Always use proper HTML5 semantic elements
2. **Mobile First** - Design for mobile, then enhance for larger screens
3. **Consistent Spacing** - Use the spacing variables consistently
4. **Accessible Colors** - Ensure proper contrast ratios
5. **Performance** - Only load what you need
6. **Progressive Enhancement** - Ensure functionality without JavaScript

## 📦 What's Included

- ✅ Complete CSS framework (50+ components)
- ✅ Typography system with Japanese support
- ✅ Responsive grid system
- ✅ Glassmorphism effects
- ✅ Modal and lightbox systems
- ✅ Form controls and validation styles
- ✅ Button variants and loading states
- ✅ Progress bars and status indicators
- ✅ WaniKani SRS color system
- ✅ Mobile responsive design
- ✅ Print-friendly styles
- ✅ Accessibility features

## 🆕 Version History

### v1.0.0 (Current)
- Initial release with complete component library
- Glassmorphism effects and modern gradients
- Mobile-first responsive design
- Japanese typography support
- WaniKani SRS integration
- Comprehensive modal and form systems

---

**Built with ❤️ for beautiful, modern web applications**

*Happy coding! 🐧*