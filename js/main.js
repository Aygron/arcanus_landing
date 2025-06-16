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
});
