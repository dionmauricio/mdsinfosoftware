document.addEventListener('DOMContentLoaded', () => {

    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 800);
    });

    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 3000);

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 60,
            disable: window.innerWidth < 768 ? 'phone' : false
        });
    }

    const header = document.getElementById('header');
    let lastScrollY = 0;

    function handleScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function setActiveLink() {
        const scrollY = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', setActiveLink, { passive: true });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 0) {
                if (value.length <= 2) {
                    value = `(${value}`;
                } else if (value.length <= 3) {
                    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                } else if (value.length <= 7) {
                    value = `(${value.slice(0, 2)}) ${value.slice(2, 3)} ${value.slice(3)}`;
                } else {
                    value = `(${value.slice(0, 2)}) ${value.slice(2, 3)} ${value.slice(3, 7)}-${value.slice(7)}`;
                }
            }
            e.target.value = value;
        });
    }

    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            clearFormErrors();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value.trim();

            let isValid = true;

            if (!name || name.length < 3) {
                showFieldError('name', 'Por favor, informe seu nome completo.');
                isValid = false;
            }

            if (!email || !isValidEmail(email)) {
                showFieldError('email', 'Por favor, informe um e-mail válido.');
                isValid = false;
            }

            if (!subject) {
                showFieldError('subject', 'Por favor, selecione um assunto.');
                isValid = false;
            }

            if (!message || message.length < 10) {
                showFieldError('message', 'A mensagem deve ter pelo menos 10 caracteres.');
                isValid = false;
            }

            if (!isValid) return;

            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://formsubmit.co/ajax/comercial@mdsinfosoftware.com', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone,
                        subject: subject,
                        message: message,
                        _subject: `Novo contato: ${subject}`,
                        _template: 'table',
                        _captcha: 'false'
                    })
                });

                if (!response.ok) {
                    throw new Error('Erro ao enviar mensagem');
                }

                showToast('success', 'Mensagem Enviada!', 'Recebemos sua mensagem e entraremos em contato em breve. Obrigado!');
                contactForm.reset();

            } catch (error) {
                console.error('Form error:', error);
                showToast('error', 'Erro ao Enviar', 'Não foi possível enviar sua mensagem. Tente novamente ou entre em contato pelo WhatsApp.');
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }            
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const error = document.getElementById(fieldId + 'Error');
        if (field) field.closest('.form-group').classList.add('error');
        if (error) error.textContent = message;
    }

    function clearFormErrors() {
        document.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));
        document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    }

    function showToast(type, title, message) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        
        toast.innerHTML = `
            <div class="toast-icon"><i class="${icon}"></i></div>
            <div class="toast-body">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Fechar">&times;</button>
        `;

        container.appendChild(toast);

        toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

        setTimeout(() => removeToast(toast), 6000);
    }

    function removeToast(toast) {
        if (!toast || toast.classList.contains('toast-removing')) return;
        toast.classList.add('toast-removing');
        setTimeout(() => toast.remove(), 300);
    }

    window.showToast = showToast;

    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.zIndex = '2';
        });
        card.addEventListener('mouseleave', () => {
            card.style.zIndex = '';
        });
    });

    console.log(
        '%c MDS Info Software %c Projetando, codificando e conectando soluções ',
        'background: #1A6E6E; color: white; padding: 8px 12px; border-radius: 4px 0 0 4px; font-weight: bold; font-size: 14px;',
        'background: #4AAFAF; color: white; padding: 8px 12px; border-radius: 0 4px 4px 0; font-size: 14px;'
    );
});
