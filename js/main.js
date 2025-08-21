// Lightbox Gallery
document.addEventListener("DOMContentLoaded", function() {
    // Cargar componentes reutilizables
    const loadComponent = (component, placeholderId) => {
        fetch(component)
            .then(response => response.text())
            .then(data => {
                document.getElementById(placeholderId).innerHTML = data;
            });
    };

    loadComponent('header.html', 'header-placeholder');
    loadComponent('footer.html', 'footer-placeholder');

    // Lightbox functionality
    let slideIndex = 1;
    showSlides(slideIndex);

    window.plusSlides = function(n) {
      showSlides(slideIndex += n);
    }

    window.currentSlide = function(n) {
      showSlides(slideIndex = n);
    }

    function showSlides(n) {
      let i;
      let slides = document.getElementsByClassName("mySlides");
      if (slides.length === 0) return; // No hacer nada si no hay slides
      if (n > slides.length) {slideIndex = 1}
      if (n < 1) {slideIndex = slides.length}
      for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
      }
      slides[slideIndex-1].style.display = "block";
    }

    window.openLightbox = function() {
      document.getElementById('myLightbox').style.display = "block";
    }

    window.closeLightbox = function() {
      document.getElementById('myLightbox').style.display = "none";
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Cuenta regresiva hasta el 29 de agosto de 2025 19:00 hs (hora Argentina)
    function updateCountdown() {
        // Fecha objetivo: 29 de agosto de 2025 19:00 hs (hora Argentina)
        const targetDate = new Date('2025-08-29T19:00:00-03:00');
        const now = new Date();
        
        // Diferencia en milisegundos
        const diff = targetDate - now;
        
        // Si la fecha ya pasó
        if (diff <= 0) {
            document.getElementById('countdown').innerHTML = '<div class="countdown-message">¡El lanzamiento ya está aquí!</div>';
            return;
        }
        
        // Calcular días, horas, minutos y segundos
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Actualizar los elementos del DOM
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        
        // Efecto de parpadeo cuando quedan pocos segundos
        if (days === 0 && hours === 0 && minutes < 5) {
            const secondsElement = document.getElementById('seconds');
            if (seconds % 2 === 0) {
                secondsElement.classList.add('pulse');
            } else {
                secondsElement.classList.remove('pulse');
            }
        }
    }
    
    // Actualizar la cuenta regresiva cada segundo
    updateCountdown();
    setInterval(updateCountdown, 1000);
});
