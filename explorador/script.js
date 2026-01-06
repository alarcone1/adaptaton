// Navigation smooth scrolling with accessibility
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Update URL without triggering scroll
            history.pushState(null, null, this.getAttribute('href'));
            // Focus management for accessibility
            target.setAttribute('tabindex', '-1');
            target.focus();
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(21, 31, 59, 0.95)';
    } else {
        navbar.style.background = 'rgba(21, 31, 59, 0.9)';
    }
});

// Initialize Leaflet map
const map = L.map('map').setView([4.5709, -74.2973], 6); // Centered on Colombia

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add custom markers for Colombian camper ecosystem
const markers = [
    { lat: 6.2442, lng: -75.5812, title: 'Medellín - Nodo Formal', description: 'Centro urbano con buena infraestructura para campers.', type: 'formal' },
    { lat: 4.6097, lng: -74.0817, title: 'Bogotá - Nodo Formal', description: 'Capital con múltiples opciones de carga y servicios.', type: 'formal' },
    { lat: 10.9685, lng: -74.7813, title: 'Barranquilla - Nodo Formal', description: 'Costa Caribe con acceso a playas y servicios.', type: 'formal' },
    { lat: 3.4372, lng: -76.5225, title: 'Cali - Oasis Informal', description: 'Zona rural con conexiones comunitarias.', type: 'informal' },
    { lat: 5.0703, lng: -75.5138, title: 'Pereira - Conexión Rural', description: 'Rutas rurales con potencial para camping.', type: 'rural' }
];

markers.forEach(marker => {
    const iconColor = marker.type === 'formal' ? '#FF8C00' : marker.type === 'informal' ? '#99F683' : '#FFD700';
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #FFFFFF;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    L.marker([marker.lat, marker.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
            <h3>${marker.title}</h3>
            <p>${marker.description}</p>
            <button onclick="openModal('${marker.title}', '${marker.description}')">Ver más</button>
        `);
});

// Modal functionality (simplified)
function openModal(title, description) {
    alert(`${title}\n\n${description}`);
    // In a real implementation, this would open a proper modal
}

// Blog filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const blogPosts = [
    { id: 1, title: 'Reflexiones en la Carretera', category: 'solo', excerpt: 'Un viaje solitario por las montañas...', date: '2023-10-01', image: 'https://via.placeholder.com/400x200/151F3B/FFFFFF?text=Viaje+Solo' },
    { id: 2, title: 'Aventuras con mi Hijo', category: 'hijo', excerpt: 'Enseñando lecciones de vida en el camino...', date: '2023-09-15', image: 'https://via.placeholder.com/400x200/151F3B/FFFFFF?text=Con+Hijo' },
    { id: 3, title: 'Romance en la Ruta', category: 'esposa', excerpt: 'Redescubriendo el amor en cada kilómetro...', date: '2023-08-20', image: 'https://via.placeholder.com/400x200/151F3B/FFFFFF?text=Con+Esposa' },
    { id: 4, title: 'Familia en Movimiento', category: 'juntos', excerpt: 'Las mejores lecciones vienen del camino...', date: '2023-07-10', image: 'https://via.placeholder.com/400x200/151F3B/FFFFFF?text=Todos+Juntos' },
    { id: 5, title: 'La Soledad del Viajero', category: 'solo', excerpt: 'Encontrando paz en la quietud del viaje...', date: '2023-06-05', image: 'https://via.placeholder.com/400x200/151F3B/FFFFFF?text=Viaje+Solo+2' }
];

function renderBlogPosts(category = 'all') {
    const blogFeed = document.getElementById('blog-feed');
    const filteredPosts = category === 'all' ? blogPosts : blogPosts.filter(post => post.category === category);

    blogFeed.innerHTML = filteredPosts.map(post => `
        <div class="blog-post" data-category="${post.category}">
            <img src="${post.image}" alt="${post.title}">
            <div class="blog-post-content">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <p class="date">${new Date(post.date).toLocaleDateString('es-ES')}</p>
            </div>
        </div>
    `).join('');
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        renderBlogPosts(button.dataset.category);
    });
});

// Initialize blog posts
renderBlogPosts();

// Tab functionality
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        const tabId = button.dataset.tab;
        document.getElementById(tabId).classList.add('active');
    });
});

// Accordion functionality
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isOpen = content.style.display === 'block';

        // Close all accordions
        document.querySelectorAll('.accordion-content').forEach(item => {
            item.style.display = 'none';
        });

        // Open clicked accordion if it was closed
        if (!isOpen) {
            content.style.display = 'block';
        }
    });
});

// Scrollytelling effect (simplified)
const heroText = document.querySelector('.hero-text');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

    if (scrollDirection === 'down' && currentScrollY > 100) {
        heroText.style.transform = 'translateY(-20px)';
        heroText.style.opacity = '0.8';
    } else {
        heroText.style.transform = 'translateY(0)';
        heroText.style.opacity = '1';
    }

    lastScrollY = currentScrollY;
});

// Add more equipment data to accordion
const equipmentData = [
    {
        module: 'Módulo 2: La Oficina Móvil',
        items: [
            { name: 'Laptop Potente', indispensable: 1, description: 'Es el "cerebro" de su proyecto.' },
            { name: 'Sistema de Conectividad', indispensable: 1, description: 'Es su "puente" con el mundo.' }
        ]
    },
    {
        module: 'Módulo 3: Pernocta "Modo Stealth"',
        items: [
            { name: 'Sistema de Oscuridad', indispensable: 1, description: 'Es la esencia del "Modo Stealth".' },
            { name: 'Sistema de Ventilación', indispensable: 1, description: 'Un auto sellado es un riesgo.' }
        ]
    }
    // Add more modules as needed
];

function populateAccordion() {
    const accordion = document.querySelector('.accordion');
    equipmentData.forEach(module => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.innerHTML = `
            <button class="accordion-header">${module.module}</button>
            <div class="accordion-content">
                <table>
                    <thead>
                        <tr>
                            <th>Elemento</th>
                            <th>Indispensable (1-5)</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${module.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.indispensable}</td>
                                <td>${item.description}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        accordion.appendChild(item);
    });
}

populateAccordion();

// Re-attach accordion event listeners after populating
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isOpen = content.style.display === 'block';

        document.querySelectorAll('.accordion-content').forEach(item => {
            item.style.display = 'none';
        });

        if (!isOpen) {
            content.style.display = 'block';
        }
    });
});