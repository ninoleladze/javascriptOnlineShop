document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  
  const authContainer = document.getElementById('auth-container');
  const userContainer = document.getElementById('user-container');
  const userNameElement = document.getElementById('user-name');
  
  if (token && userName && authContainer && userContainer && userNameElement) {
    authContainer.classList.add('d-none');
    userContainer.classList.remove('d-none');
    
    userContainer.classList.add('animate__animated', 'animate__fadeIn');
    userNameElement.textContent = userName;
    
    api.getUserProfile(token)
      .catch(function(error) {
        console.error('Invalid token:', error);
        handleLogout();
      });
  }
}

function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');
  const loginBtn = document.querySelector('#login-form button[type="submit"]');
  
  if (!errorElement) {
    console.error('Login error element not found');
    return;
  }
  
  errorElement.classList.add('d-none');
  
  if (loginBtn) {
    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
    loginBtn.disabled = true;
  }
  
  api.login(email, password)
    .then(function(data) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.name);
      
      const loginModal = document.getElementById('loginModal');
      if (loginModal && typeof $.fn !== 'undefined') {
        $(loginModal).fadeOut(300, function() {
          $('#loginModal').modal('hide');
        });
      }
      checkAuthStatus();
      if (typeof showAlert === 'function') {
        showAlert('Login successful! Welcome back.', 'success');
      }
      
      if (typeof loadCartCount === 'function') {
        loadCartCount();
      }
    })
    .catch(function(error) {
      console.error('Login error:', error);
      errorElement.textContent = 'Invalid email or password. Please try again.';
      errorElement.classList.remove('d-none');
      
      errorElement.classList.add('animate__animated', 'animate__shakeX');
      
      setTimeout(() => {
        errorElement.classList.remove('animate__animated', 'animate__shakeX');
      }, 1000);
    })
    .finally(function() {
      if (loginBtn) {
        loginBtn.innerHTML = 'Login';
        loginBtn.disabled = false;
      }
    });
}

function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorElement = document.getElementById('register-error');
  const registerBtn = document.querySelector('#register-form button[type="submit"]');
  
  if (!errorElement) {
    console.error('Register error element not found');
    return;
  }
  
  errorElement.classList.add('d-none');
  
  if (registerBtn) {
    registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
    registerBtn.disabled = true;
  }
  
  api.register(name, email, password)
    .then(function(data) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.name);
      
      const registerModal = document.getElementById('registerModal');
      if (registerModal && typeof $.fn !== 'undefined') {
        $(registerModal).fadeOut(300, function() {
          $('#registerModal').modal('hide');
        });
      }
      
      checkAuthStatus();
      
      if (typeof showAlert === 'function') {
        showAlert('Registration successful! Welcome to PinkShop.', 'success');
      }
    })
    .catch(function(error) {
      console.error('Registration error:', error);
      errorElement.textContent = 'Registration failed. Email may already be in use.';
      errorElement.classList.remove('d-none');
      
      errorElement.classList.add('animate__animated', 'animate__shakeX');
      
      setTimeout(() => {
        errorElement.classList.remove('animate__animated', 'animate__shakeX');
      }, 1000);
    })
    .finally(function() {
      if (registerBtn) {
        registerBtn.innerHTML = 'Register';
        registerBtn.disabled = false;
      }
    });
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  
  const authContainer = document.getElementById('auth-container');
  const userContainer = document.getElementById('user-container');
  
  if (authContainer && userContainer) {
    userContainer.classList.add('animate__animated', 'animate__fadeOut');
    
    setTimeout(() => {
      userContainer.classList.add('d-none');
      userContainer.classList.remove('animate__animated', 'animate__fadeOut');
      
      authContainer.classList.remove('d-none');
      authContainer.classList.add('animate__animated', 'animate__fadeIn');
      
      setTimeout(() => {
        authContainer.classList.remove('animate__animated', 'animate__fadeIn');
      }, 1000);
    }, 500);
  }
  
  if (typeof showAlert === 'function') {
    showAlert('You have been logged out successfully.', 'info');
  }
  
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.classList.add('animate__animated', 'animate__fadeOut');
    setTimeout(() => {
      cartCountElement.classList.add('d-none');
      cartCountElement.classList.remove('animate__animated', 'animate__fadeOut');
    }, 500);
  }
}
