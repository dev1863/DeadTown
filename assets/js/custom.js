/* =========================================================
   DeadTown - Core JavaScript
   ========================================================= */

// Safe DOM Ready
document.addEventListener('DOMContentLoaded', function () {

    // ============= 01. Sidebar Toggle ============= //
    const sidebarEvent = document.getElementById('sidebarEvent');
    const sidebar = document.querySelector('.sidebar');
    const closeBtn = document.getElementById('closeBtn');

    if (sidebarEvent && sidebar) {
        sidebarEvent.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('sidebar-toggle');
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.remove('sidebar-toggle');
        });
    }

    // Close sidebar on click outside
    document.addEventListener('click', function (e) {
        if (sidebar && sidebar.classList.contains('sidebar-toggle')) {
            if (!sidebar.contains(e.target) && e.target !== sidebarEvent && (!sidebarEvent || !sidebarEvent.contains(e.target))) {
                sidebar.classList.remove('sidebar-toggle');
            }
        }
    });

    // ============= 02. Rules Search & Filter ============= //
    const rulesSearchInput = document.getElementById('rulesSearchInput');
    if (rulesSearchInput) {
        rulesSearchInput.addEventListener('input', function () {
            const term = this.value.trim().toLowerCase();
            const accordionItems = document.querySelectorAll('#accordionExample .accordion-item');
            let foundCount = 0;

            accordionItems.forEach(function (item) {
                const headerText = item.querySelector('.accordion-header')?.textContent.toLowerCase() || '';
                const bodyText = item.querySelector('.accordion-body')?.textContent.toLowerCase() || '';
                const collapseElement = item.querySelector('.accordion-collapse');
                const buttonElement = item.querySelector('.accordion-button');

                if (headerText.includes(term) || bodyText.includes(term)) {
                    item.style.display = 'block';
                    foundCount++;
                    if (term.length > 1) {
                        // Open matching accordion
                        if (collapseElement && !collapseElement.classList.contains('show')) {
                            collapseElement.classList.add('show');
                            if (buttonElement) buttonElement.classList.remove('collapsed');
                        }
                    }
                } else {
                    item.style.display = 'none';
                }
            });

            const searchCountEl = document.getElementById('rulesSearchCount');
            if (searchCountEl) {
                if (term.length > 0) {
                    searchCountEl.textContent = `تم العثور على (${foundCount}) قانون`;
                    searchCountEl.style.display = 'inline-block';
                } else {
                    searchCountEl.style.display = 'none';
                }
            }
        });
    }

    // Category Filter Buttons in Rules
    const filterButtons = document.querySelectorAll('.rules-filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const category = this.getAttribute('data-category');
                const accordionItems = document.querySelectorAll('#accordionExample .accordion-item');

                accordionItems.forEach(function (item) {
                    const itemCat = item.getAttribute('data-category') || 'all';
                    if (category === 'all' || itemCat === category || (itemCat.includes(category))) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // Expand All / Collapse All in Rules
    const expandAllBtn = document.getElementById('expandAllRules');
    const collapseAllBtn = document.getElementById('collapseAllRules');
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', function () {
            document.querySelectorAll('#accordionExample .accordion-collapse').forEach(function (collapse) {
                collapse.classList.add('show');
            });
            document.querySelectorAll('#accordionExample .accordion-button').forEach(function (btn) {
                btn.classList.remove('collapsed');
            });
        });
    }
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', function () {
            document.querySelectorAll('#accordionExample .accordion-collapse').forEach(function (collapse) {
                collapse.classList.remove('show');
            });
            document.querySelectorAll('#accordionExample .accordion-button').forEach(function (btn) {
                btn.classList.add('collapsed');
            });
        });
    }

    // ============= 04. Copy Rule Text ============= //
    document.querySelectorAll('.copy-rule-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const body = this.closest('.accordion-item').querySelector('.accordion-body');
            if (body && navigator.clipboard) {
                navigator.clipboard.writeText(body.innerText.trim()).then(function () {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'تم نسخ نص القانون بنجاح!',
                            showConfirmButton: false,
                            timer: 2000,
                            background: '#191136',
                            color: '#fff'
                        });
                    }
                });
            }
        });
    });

    // ============= 05. Back to Top Button ============= //
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex';
                backToTopBtn.style.opacity = '1';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============= 06. Footer Newsletter / Form ============= //
    const footerForm = document.getElementById('footer-form');
    const footerMessage = document.getElementById('footer-message');
    if (footerForm && footerMessage) {
        footerForm.addEventListener('submit', function (event) {
            event.preventDefault();
            footerMessage.innerHTML = 'تم الاشتراك بنجاح في نشرة DeadTown!';
            footerMessage.style.display = 'block';
            footerForm.reset();
            setTimeout(function () {
                footerMessage.style.display = 'none';
            }, 3500);
        });
    }

    // ============= 07. Animated Stats Counters ============= //
    const counterElements = document.querySelectorAll('.count');
    if (counterElements.length > 0) {
        const animateCounter = function (el) {
            const target = parseInt(el.getAttribute('data-target') || el.innerText.replace(/,/g, ''), 10);
            if (isNaN(target)) return;
            let current = 0;
            const duration = 2000;
            const stepTime = 20;
            const increment = target / (duration / stepTime);

            const timer = setInterval(function () {
                current += increment;
                if (current >= target) {
                    el.innerText = target.toLocaleString('en-US');
                    clearInterval(timer);
                } else {
                    el.innerText = Math.floor(current).toLocaleString('en-US');
                }
            }, stepTime);
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                        entry.target.classList.add('counted');
                        animateCounter(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counterElements.forEach(function (el) {
                el.setAttribute('data-target', el.innerText.trim());
                el.innerText = '0';
                observer.observe(el);
            });
        }
    }

    // ============= 08. Slick Slider Initializations (Safe jQuery check) ============= //
    if (typeof jQuery !== 'undefined' && jQuery.fn.slick) {
        // Streamers Hero Slider
        if (jQuery('.slick-slider').length) {
            jQuery('.slick-slider').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
                prevArrow: '<button type="button" class="m1shal-prev" aria-label="السابق"><i class="fa-solid fa-chevron-right"></i></button>',
                nextArrow: '<button type="button" class="m1shal-next" aria-label="التالي"><i class="fa-solid fa-chevron-left"></i></button>',
                infinite: true,
                rtl: true,
                autoplay: true,
                autoplaySpeed: 5000,
                responsive: [
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ]
            });
        }

        // Partner Slider
        if (jQuery('.partner-slider').length) {
            jQuery('.partner-slider').slick({
                dots: false,
                infinite: true,
                autoplay: true,
                speed: 3000,
                slidesToShow: 5,
                autoplaySpeed: 0,
                arrows: false,
                slidesToScroll: 1,
                cssEase: 'linear',
                rtl: true,
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: { slidesToShow: 3, slidesToScroll: 1 }
                    },
                    {
                        breakpoint: 600,
                        settings: { slidesToShow: 2, slidesToScroll: 1 }
                    }
                ]
            });
        }

        // Testimonial Sliders
        if (jQuery('.testimonials-slider').length) {
            jQuery('.testimonials-slider').slick({
                dots: false,
                infinite: true,
                autoplay: true,
                speed: 400,
                slidesToShow: 1,
                autoplaySpeed: 4500,
                arrows: true,
                rtl: true
            });
        }
    }

    // ============= 09. AOS Init ============= //
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true,
            duration: 900,
            offset: 50
        });
    }

});

// Global Helper Functions
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function soon(message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: "تنبيه",
            text: message || "التقديم سيتم فتحه قريباً!",
            icon: "info",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#8900FF",
            background: "#160e33",
            color: "#ffffff"
        });
    } else {
        alert(message || "التقديم سيتم فتحه قريباً!");
    }
}