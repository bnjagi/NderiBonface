// DOM Elements
const header = document.querySelector('header');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navLinksElements = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');
const contactForm = document.getElementById('contactForm');
const yearSpan = document.getElementById('year');

// Set current year in footer
yearSpan.textContent = new Date().getFullYear();

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on links
navLinksElements.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    
    // Update icon
    const icon = themeToggle.querySelector('i');
    if (body.classList.contains('dark-theme')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    const icon = themeToggle.querySelector('i');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

// Portfolio Filtering with Database
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Get filter value
        const filter = btn.getAttribute('data-filter');
        
        // Get projects from database
        if (filter === 'all') {
            fetchProjects();
        } else {
            fetchProjectsByCategory(filter);
        }
    });
});

// Fetch all projects from the database
async function fetchProjects() {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Error:', error);
        // If API fails, fall back to the static filtering
        portfolioItems.forEach(item => {
            item.style.display = 'block';
        });
    }
}

// Fetch projects by category
async function fetchProjectsByCategory(category) {
    try {
        const response = await fetch(`/api/projects/${category}`);
        if (!response.ok) {
            throw new Error('Failed to fetch projects by category');
        }
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Error:', error);
        // If API fails, fall back to the static filtering
        portfolioItems.forEach(item => {
            if (item.getAttribute('data-category') === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// Display projects in the portfolio grid
function displayProjects(projects) {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    // Clear current portfolio items
    portfolioGrid.innerHTML = '';
    
    // Create HTML for each project
    projects.forEach(project => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.setAttribute('data-category', project.category);
        
        portfolioItem.innerHTML = `
            <div class="portfolio-img">
                <img src="${project.image_url}" alt="${project.title}">
                <div class="portfolio-overlay">
                    <div class="portfolio-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <a href="#" class="btn btn-sm btn-white">View Details</a>
                    </div>
                </div>
            </div>
            <div class="portfolio-details">
                <h3>${project.title}</h3>
                <p>${project.tags.join(', ')}</p>
            </div>
        `;
        
        portfolioGrid.appendChild(portfolioItem);
    });
}

// Load projects on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
});

// Form Submission with Database
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Create loading indicator
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
        
        try {
            // Send data to server
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, subject, message })
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit the form');
            }
            
            const result = await response.json();
            
            // Show success message
            alert('Thank you for your message! I will get back to you soon.');
            
            // Reset form
            this.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('Sorry, there was an error submitting your message. Please try again later.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Active navigation link on scroll
function setActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinksElements.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}
setActiveNavLink();

// Header shadow on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});

// Animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Add animate-on-scroll class to elements that should animate
document.querySelectorAll('.section-header, .about-text, .about-image, .portfolio-item, .contact-form, .contact-info').forEach(element => {
    element.classList.add('animate-on-scroll');
});

// Initialize animations
animateOnScroll();

// Initialize portfolio ZIP download
const downloadBtn = document.querySelector('.download .btn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', function(e) {
        // In a real application, you would have a real ZIP file to download
        alert('Download Succesful!');
    });
}

// Preload images for smoother transitions
function preloadImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
            const newImg = new Image();
            newImg.src = src;
        }
    });
}
preloadImages();