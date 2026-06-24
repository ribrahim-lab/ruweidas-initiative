document.addEventListener('DOMContentLoaded', () => {
    // Navigation / Smooth Scrolling Logic
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');
    const navLogo = document.getElementById('nav-logo');
    
    function scrollToSection(targetId) {
        const targetSection = document.getElementById(targetId + '-section');
        if (targetSection) {
            const headerOffset = 80;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            scrollToSection(targetId);
            history.pushState(null, null, `#${targetId}`);
        });
    });

    navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToSection('home');
        history.pushState(null, null, '#home');
    });

    // Home Page Hero Action Buttons
    const exploreBtn = document.getElementById('explore-projects-btn');
    const supportBtn = document.getElementById('support-mission-btn');

    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => scrollToSection('projects'));
    }
    if (supportBtn) {
        supportBtn.addEventListener('click', () => scrollToSection('donate'));
    }

    // Hash routing on direct page load
    const currentHash = window.location.hash.substring(1);
    const validSections = ['home', 'about', 'projects', 'pathfinder', 'resources', 'donate', 'contact'];
    if (validSections.includes(currentHash)) {
        setTimeout(() => scrollToSection(currentHash), 100);
    }

    // Dynamic Navigation Highlighting on Scroll (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -65% 0px', // Triggers when section occupies upper-mid screen
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id.replace('-section', '');
                navItems.forEach(item => {
                    if (item.getAttribute('data-target') === targetId) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Interactive Pathfinder Quiz Logic
    const pathfinderButtons = document.querySelectorAll('.pathfinder-opt-btn');
    const resultsBox = document.getElementById('pathfinder-results-box');
    const resultTitleText = document.getElementById('result-title-text');
    const resultDescText = document.getElementById('result-desc-text');
    const resetPathfinderBtn = document.getElementById('pathfinder-reset-btn');

    const recommendations = {
        tech: {
            title: "5-Day Coding Program & Python Game Dev",
            desc: "Based on your interest in software, we recommend starting with our 5-Day Coding Program, followed by Python Game Development to turn math and logic into fun, graphical games."
        },
        finance: {
            title: "Quant Finance & Algorithmic Trading",
            desc: "For market and money enthusiasts, we recommend our Quant Finance and Algorithmic Trading workshops to learn how mathematical algorithms analyze datasets and make mock-trades."
        },
        math: {
            title: "Youth Math Tutoring & Data Science",
            desc: "If you enjoy puzzles and logic, our Math Tutoring builds core confidence in algebra/calculus, and our Data Science workshop will show you how to analyze real-world data with Python."
        }
    };

    pathfinderButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const interest = btn.getAttribute('data-interest');
            const recommendation = recommendations[interest];

            if (recommendation) {
                resultTitleText.textContent = recommendation.title;
                resultDescText.textContent = recommendation.desc;
                
                // Show result box
                resultsBox.classList.remove('hidden');
                
                // Highlight option button
                pathfinderButtons.forEach(b => b.style.borderColor = 'var(--border-color)');
                btn.style.borderColor = 'var(--accent-gold)';
            }
        });
    });

    if (resetPathfinderBtn) {
        resetPathfinderBtn.addEventListener('click', () => {
            resultsBox.classList.add('hidden');
            pathfinderButtons.forEach(b => b.style.borderColor = 'var(--border-color)');
        });
    }

    // FAQ Accordion Toggle Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question-btn');
        questionBtn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            
            // Close all items first for a clean accordion effect
            faqItems.forEach(i => i.classList.remove('open'));
            
            // If it wasn't open, open it now
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });

    // Donation Component Logic
    const tierCards = document.querySelectorAll('.tier-card');
    const customContainer = document.getElementById('custom-amount-container');
    const customInput = document.getElementById('custom-donation-input');
    const donateAmountLabel = document.getElementById('donate-amount-label');
    const donateSubmitBtn = document.getElementById('donate-submit-btn');
    
    let selectedAmount = '50'; // Default tier

    function updateDonateButtonText(amount) {
        if (!amount || isNaN(amount) || amount <= 0) {
            donateAmountLabel.textContent = '';
            donateSubmitBtn.querySelector('span').textContent = 'Enter Amount';
        } else {
            donateAmountLabel.textContent = `$${amount}`;
            donateSubmitBtn.querySelector('span').innerHTML = `Donate <span id="donate-amount-label">$${amount}</span>`;
        }
    }

    tierCards.forEach(card => {
        card.addEventListener('click', () => {
            tierCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            if (card.classList.contains('custom-tier')) {
                customContainer.classList.remove('hidden');
                customInput.focus();
                selectedAmount = customInput.value;
                updateDonateButtonText(selectedAmount);
            } else {
                customContainer.classList.add('hidden');
                selectedAmount = card.getAttribute('data-amount');
                updateDonateButtonText(selectedAmount);
            }
        });
    });

    customInput.addEventListener('input', () => {
        selectedAmount = customInput.value;
        updateDonateButtonText(selectedAmount);
    });

    // Submit Donation
    if (donateSubmitBtn) {
        donateSubmitBtn.addEventListener('click', () => {
            if (!selectedAmount || isNaN(selectedAmount) || selectedAmount <= 0) {
                showToast('Please select or enter a valid donation amount.');
                return;
            }
            showToast(`Thank you! Your donation of $${selectedAmount} was simulated successfully.`);
            
            // Reset state
            customInput.value = '';
            tierCards.forEach(c => c.classList.remove('active'));
            const defaultTier = document.querySelector('.tier-card[data-amount="50"]');
            if (defaultTier) {
                defaultTier.classList.add('active');
                customContainer.classList.add('hidden');
                selectedAmount = '50';
                updateDonateButtonText('50');
            }
        });
    }

    // Contact Form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('form-name').value;
            showToast(`Thank you, ${name}! Your outreach message has been sent.`);
            contactForm.reset();
        });
    }

    // Toast Notification System
    const toast = document.getElementById('toast-notify');
    const toastText = document.getElementById('toast-message-text');
    let toastTimeout;

    function showToast(message) {
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastText.textContent = message;
        toast.classList.remove('hidden');
        
        toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000);
    }
});
