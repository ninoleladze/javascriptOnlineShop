
document.addEventListener('DOMContentLoaded', function() {
  $('[data-toggle="tooltip"]').tooltip();
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      if (this.getAttribute('href') !== '#') {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  const animateElements = document.querySelectorAll('.animate__animated');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate__fadeIn');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    animateElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    animateElements.forEach(element => {
      element.classList.add('animate__fadeIn');
    });
  }
});

function showAlert(message, type) {
  let alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.className = 'alert-container';
    document.body.appendChild(container);
    alertContainer = container;
  }
  
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  `;
  
  alertContainer.appendChild(alertDiv);
  
  setTimeout(function() {
    alertDiv.classList.remove('show');
    setTimeout(function() {
      alertDiv.parentNode.removeChild(alertDiv);
    }, 150);
  }, 3000);
}

function updateCartCount(count) {
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = count;
    if (count > 0) {
      cartCountElement.classList.remove('d-none');
    } else {
      cartCountElement.classList.add('d-none');
    }
  }
}
