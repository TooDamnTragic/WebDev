# Portfolio Website

A creative portfolio website featuring interactive physics-based elements and modern design.

## 🗂️ Project Structure

```
├── pages/                    # Main pages
│   ├── index.html           # Home page
│   ├── education/           # Education section
│   ├── works/              # Portfolio works
│   ├── contact/            # Contact page
│   └── miseducation/       # Creative section
├── assets/                  # Static assets
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript files
│   ├── fonts/              # Custom fonts
│   └── media/              # Images and media
├── components/             # Reusable components
│   ├── loader/             # Loading animations
│   ├── navigation/         # Navigation components
│   └── effects/            # Visual effects
└── index.html              # Root redirect
```

## ✨ Features

### 🎨 Creative Design Elements
- **Gravity Physics**: Interactive falling tiles with realistic collision detection
- **Window Shake Detection**: Physical interaction with browser window movement
- **3D Tilt Effects**: Mouse-responsive card tilting
- **Animated Backgrounds**: Floating orbs and particle systems
- **Timeline Animations**: Comet-trail progress indicators

### 🎯 Interactive Components
- **Popup Information Panels**: Hover-activated content displays
- **Mobile Expandable Cards**: Touch-friendly information access
- **File Upload with Drag & Drop**: Enhanced contact form
- **Real-time Form Validation**: Instant feedback
- **Smooth Page Transitions**: Seamless navigation

### 📱 Responsive Design
- Mobile-first approach
- Touch-optimized interactions
- Adaptive layouts for all screen sizes
- Performance optimizations for mobile devices

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd portfolio-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Build Tool**: Vite
- **Fonts**: Custom typography (Hackney, DTGetai)
- **Physics**: Custom gravity simulation
- **Animations**: CSS animations + JavaScript interactions

## 📁 Key Files

### Core Pages
- `pages/index.html` - Main landing page with navigation bubbles
- `pages/education/education.html` - Interactive timeline with gravity physics
- `pages/contact/contact.html` - Contact form with file upload
- `pages/works/works.html` - Portfolio showcase
- `pages/miseducation/miseducation.html` - Creative interactive element

### Stylesheets
- `assets/css/main.css` - Global styles and navigation
- `assets/css/contact.css` - Contact page specific styles

### JavaScript
- `assets/js/main.js` - Main navigation and interactions
- `assets/js/education.js` - Education page physics and popups
- `assets/js/contact.js` - Contact form functionality
- `components/navigation/transition.js` - Page transition effects

## 🎮 Interactive Features

### Education Page Physics
- **Gravity Simulation**: Realistic falling animations
- **Collision Detection**: Items bounce off each other
- **Window Shake**: Browser movement affects physics
- **Priority Z-indexing**: Important items stay on top

### Contact System
- **3D Card Effects**: Mouse-responsive tilting
- **File Upload**: Drag & drop with preview
- **Form Validation**: Real-time error checking
- **Email Integration**: Ready for backend service

### Navigation
- **Bubble Interface**: Unique circular navigation
- **Smooth Transitions**: Fade effects between pages
- **Responsive Design**: Adapts to all devices

## 🎨 Design Philosophy

This portfolio emphasizes:
- **Creative Interaction**: Physics-based elements that respond to user input
- **Visual Hierarchy**: Clear information structure with engaging presentations
- **Performance**: Optimized animations that don't compromise speed
- **Accessibility**: Keyboard navigation and screen reader support
- **Mobile Experience**: Touch-optimized interactions

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔧 Development

### Adding New Pages
1. Create HTML file in appropriate `pages/` subdirectory
2. Add corresponding CSS in `assets/css/`
3. Include JavaScript in `assets/js/`
4. Update navigation in main pages

### Customizing Physics
Edit `assets/js/education.js`:
- Adjust gravity, bounce, and friction values
- Modify collision detection sensitivity
- Change particle behavior

### Styling Updates
- Global styles: `assets/css/main.css`
- Page-specific: Create new CSS file in `assets/css/`
- Fonts: Add to `assets/fonts/` and update CSS

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This portfolio showcases creative web development techniques including physics simulations, 3D effects, and interactive animations. It's designed to demonstrate both technical skills and creative problem-solving.