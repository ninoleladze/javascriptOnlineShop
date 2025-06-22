
window.API_URL = "https://api.everrest.educata.dev";

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener("DOMContentLoaded", function() {
  console.log('App initialized');
  
  const currentPage = document.body.dataset.page;
  console.log('Current page:', currentPage);
  
  if (currentPage === "home") {
    initializeHomePage();
  } else if (currentPage === "product-details") {
    console.log('Product details page detected');
  } else if (currentPage === "cart") {
    console.log('Cart page detected');
  }
  
  initializeSharedFeatures();
  
  if (typeof checkAuthStatus === 'function') {
    checkAuthStatus();
  }
  
  updateCartCountFromLocalStorage();
});

function initializeHomePage() {
  let productsContainer = document.getElementById("products-container");
  let searchInput = document.getElementById("search-input");
  let filterForm = document.getElementById("filter-form");
  let categoryFilter = document.getElementById("category-filter");
  let brandFilter = document.getElementById("brand-filter");
  let minPriceInput = document.getElementById("min-price");
  let maxPriceInput = document.getElementById("max-price");
  let ratingFilter = document.getElementById("rating-filter");
  
  if (productsContainer) {
    fetchProducts();
  }
  
  if (categoryFilter || brandFilter) {
    loadFilters();
  }
  
  if (filterForm) {
    filterForm.addEventListener("submit", function(e) {
      e.preventDefault();
      applyFilters();
    });
    
    filterForm.addEventListener("reset", function() {
      setTimeout(() => {
        fetchProducts();
      }, 10);
    });
  }
  
  if (searchInput) {
    let searchForm = document.getElementById("search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", function(e) {
        e.preventDefault();
        handleSearch();
      });
    }
    
    searchInput.addEventListener("input", debounce(handleSearch, 500));
  }
}


function initializeSharedFeatures() {
  if (typeof $ !== 'undefined') {
    $('[data-toggle="tooltip"]').tooltip();
  }
  
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
  
  if ('IntersectionObserver' in window && animateElements.length > 0) {
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
  } else if (animateElements.length > 0) {
    animateElements.forEach(element => {
      element.classList.add('animate__fadeIn');
    });
  }
  
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput && searchInput.value.trim()) {
        if (document.body.dataset.page !== 'home') {
          window.location.href = `index.html?search=${encodeURIComponent(searchInput.value.trim())}`;
        } else {
          handleSearch();
        }
      }
    });
  }
}

function fetchProducts() {
  const productsContainer = document.getElementById("products-container");
  if (!productsContainer) return;
  
  productsContainer.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
    </div>
  `;
  
  fetch(`${window.API_URL}/shop/products/all`)
    .then(res => res.json())
    .then(data => {
      if (data && data.products) {
        displayProducts(data.products);
      } else {
        console.error("Invalid data format:", data);
        showEmptyState("Products could not be loaded.");
      }
    })
    .catch(error => {
      console.error("Error fetching products", error);
      showEmptyState("Products could not be loaded. Please try again later.");
    });
}
function handleSearch() {
  const searchInput = document.getElementById("search-input");
  const productsContainer = document.getElementById("products-container");
  if (!searchInput || !productsContainer) return;
  
  let searchTerm = searchInput.value.trim();
  if (searchTerm) {
    productsContainer.innerHTML = `
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
    `;
    
    fetch(`${window.API_URL}/shop/products/search?q=${encodeURIComponent(searchTerm)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.products) {
          displayProducts(data.products);
          if (data.products.length === 0) {
            showEmptyState(`No products found matching "${searchTerm}"`);
          }
        } else {
          showEmptyState(`No products found matching "${searchTerm}"`);
        }
      })
      .catch(error => {
        console.error("Error during search", error);
        showEmptyState("Search error. Please try again.");
      });
  } else {
    fetchProducts();
  }
}
function applyFilters() {
  const productsContainer = document.getElementById("products-container");
  if (!productsContainer) return;
  
  const categoryFilter = document.getElementById("category-filter");
  const brandFilter = document.getElementById("brand-filter");
  const minPriceInput = document.getElementById("min-price");
  const maxPriceInput = document.getElementById("max-price");
  const ratingFilter = document.getElementById("rating-filter");
  
  productsContainer.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
    </div>
  `;
  
  let selectedCategory = categoryFilter ? categoryFilter.value : "";
  let selectedBrand = brandFilter ? brandFilter.value : "";
  let minPrice = minPriceInput ? parseFloat(minPriceInput.value) : null;
  let maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) : null;
  let selectedRating = ratingFilter ? ratingFilter.value : "";
  
  let fetchUrl = `${window.API_URL}/shop/products/all`;
  
  if (selectedCategory && selectedCategory !== "") {
    fetchUrl = `${window.API_URL}/shop/products/category/${encodeURIComponent(selectedCategory)}`;
  } else if (selectedBrand && selectedBrand !== "") {
    fetchUrl = `${window.API_URL}/shop/products/brand/${encodeURIComponent(selectedBrand)}`;
  }
  
  fetch(fetchUrl)
    .then(res => res.json())
    .then(data => {
      if (data && data.products) {
        let filteredProducts = data.products;
        
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
          filteredProducts = filteredProducts.filter(product => {
            let price = product.price && product.price.value ? product.price.value : 0;
            
            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
              return price >= minPrice && price <= maxPrice;
            } else if (!isNaN(minPrice)) {
              return price >= minPrice;
            } else if (!isNaN(maxPrice)) {
              return price <= maxPrice;
            }
            
            return true;
          });
        }
        
        if (selectedRating && selectedRating !== "") {
          let minRating = Number(selectedRating);
          filteredProducts = filteredProducts.filter(product =>
            product.rating >= minRating
          );
        }
        
        displayProducts(filteredProducts);
        
        if (filteredProducts.length === 0) {
          showEmptyState("No products match your filter criteria.");
        }
      } else {
        showEmptyState("No products found.");
      }
    })
    .catch(error => {
      console.error("Error applying filters", error);
      showEmptyState("Error applying filters. Please try again.");
    });
}
function loadFilters() {
  const categoryFilter = document.getElementById("category-filter");
  const brandFilter = document.getElementById("brand-filter");
  
  if (!categoryFilter && !brandFilter) return;
  
  fetch(`${window.API_URL}/shop/products/all`)
    .then(res => res.json())
    .then(data => {
      if (data && data.products) {
        if (categoryFilter) {
          let categoryMap = new Map();
          
          data.products.forEach(product => {
            if (product.category) {
              if (typeof product.category === 'string') {
                categoryMap.set(product.category, product.category);
              } else if (typeof product.category === 'object' && product.category.name) {
                categoryMap.set(product.category.name, product.category.id || product.category.name);
              }
            }
          });
          
          let categories = Array.from(categoryMap.entries())
            .filter(([name]) => name)
            .sort((a, b) => a[0].localeCompare(b[0]));
          
          categoryFilter.innerHTML = '<option value="">All Categories</option>';
          
          categories.forEach(([name, id]) => {
            categoryFilter.innerHTML += `<option value="${id}">${name}</option>`;
          });
        }
        if (brandFilter) {
          let brands = [...new Set(data.products.map(product => product.brand))]
            .filter(Boolean)
            .sort();
          
          brandFilter.innerHTML = '<option value="">All Brands</option>';
          brands.forEach(brand => {
            brandFilter.innerHTML += `<option value="${brand}">${brand}</option>`;
          });
        }
      }
    })
    .catch(error => console.error("Error loading filters", error));
}
function displayProducts(products) {
  const productsContainer = document.getElementById("products-container");
  if (!productsContainer) return;
  
  productsContainer.innerHTML = "";
  
  if (!products || products.length === 0) {
    showEmptyState("No products found.");
    return;
  }
  
  products.forEach(product => {
    let imageUrl = getProductImageUrl(product);
    
    let title = product.title || 'Unknown Product';
    let price = getProductPrice(product);
    let rating = product.rating || 0;
    let description = product.description || 'No description available';
    let truncatedDescription = description.length > 70 ? description.substring(0, 70) + '...' : description;
    let discount = product.price && product.price.discountPercentage ? product.price.discountPercentage : 0;
    let oldPrice = product.price && product.price.beforeDiscount ? product.price.beforeDiscount : null;
    let brand = product.brand || 'Unknown Brand';
    let category = getProductCategory(product);
    
    let starsHtml = generateStarRating(rating);
    
    let productCard = document.createElement('div');
    productCard.className = 'col-md-6 col-lg-4 mb-4';
    productCard.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="position-relative">
          ${discount > 0 ? `<span class="badge badge-danger position-absolute" style="top: 10px; left: 10px;">-${discount}%</span>` : ''}
          <span class="badge badge-secondary position-absolute" style="top: 10px; right: 10px;">${category}</span>
          <img src="${imageUrl}" class="card-img-top" alt="${title}" style="height: 200px; object-fit: cover;"
               onerror="this.src='https://placehold.co/300x300/f8bbd0/333333?text=${encodeURIComponent(title)}'">
          <div class="card-img-overlay d-flex align-items-center justify-content-center" style="background-color: rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s;">
            <button class="btn btn-sm btn-light" onclick="showProductDetails('${product._id}')">
              <i class="fas fa-eye"></i> Quick View
            </button>
          </div>
        </div>
        
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted small">${brand}</span>
            <div class="stars small" style="color: #ffc107;">
              ${starsHtml}
              <span class="text-muted ml-1">(${rating.toFixed(1)})</span>
            </div>
          </div>
          
          <h5 class="card-title" style="min-height: 48px;">
            <a href="product-details.html?id=${product._id}" class="text-decoration-none text-dark">
              ${title}
            </a>
          </h5>
          
          <p class="card-text text-muted small" style="min-height: 60px;">${truncatedDescription}</p>
          
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <div>
              <h5 class="mb-0 font-weight-bold">${price}₾</h5>
              ${oldPrice ? `<small class="text-muted"><s>${oldPrice}₾</s></small>` : ''}
            </div>
            
            <button class="btn btn-pink add-to-cart-btn" data-id="${product._id}" data-title="${title.replace(/"/g, '&quot;')}" data-price="${price}">
              <i class="fas fa-shopping-cart"></i>
              <span class="d-none d-md-inline ml-1">Add</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    productsContainer.appendChild(productCard);
  });
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.querySelector('.card-img-overlay').style.opacity = '1';
    });
    
    card.addEventListener('mouseleave', function() {
      this.querySelector('.card-img-overlay').style.opacity = '0';
    });
  });
  
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function() {
      let productId = this.getAttribute('data-id');
      let title = this.getAttribute('data-title');
      let price = this.getAttribute('data-price');
      
      let originalHTML = this.innerHTML;
      this.innerHTML = '<i class="fas fa-check"></i><span class="d-none d-md-inline ml-1">Added!</span>';
      this.classList.add('btn-success');
      this.classList.remove('btn-pink');
      
      setTimeout(() => {
        this.innerHTML = originalHTML;
        this.classList.remove('btn-success');
        this.classList.add('btn-pink');
      }, 1500);
      
      addToCart(productId, title, price);
    });
  });
}
function showEmptyState(message) {
  const productsContainer = document.getElementById("products-container");
  if (!productsContainer) return;
  
  productsContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="empty-state">
        <i class="fas fa-search fa-3x mb-3"></i>
        <h3>No Products Found</h3>
        <p class="text-muted">${message}</p>
        <button class="btn btn-outline-pink mt-3" onclick="fetchProducts()">
          <i class="fas fa-sync-alt mr-2"></i>Show All Products
        </button>
      </div>
    </div>
  `;
}
function addToCart(productId, title, price) {
  const token = localStorage.getItem('token');
  
  if (token) {
    let url = `${window.API_URL}/shop/cart/product`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId,
        quantity: 1
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to add product to cart: ${response.status}`);
      }
      return response.json();
    })
    .then(() => {
      showToast("Product added to cart!");
      loadCartCount();
    })
    .catch(error => {
      console.error("Error adding to cart", error);
      
      addToLocalCart(productId, title, price);
      showToast("Product added to cart!");
      updateCartCountFromLocalStorage();
    });
  } else {
    addToLocalCart(productId, title, price);
    showToast("Product added to cart!");
    updateCartCountFromLocalStorage();
  }
}
function addToLocalCart(productId, title, price, quantity = 1) {
  let cart = [];
  const savedCart = localStorage.getItem('cart');
  
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      if (!Array.isArray(cart)) cart = [];
    } catch (e) {
      console.error('Error parsing cart', e);
      cart = [];
    }
  }
  
  let productCard = document.querySelector(`[data-id="${productId}"]`)?.closest('.card');
  let imageUrl = productCard ? productCard.querySelector('img')?.src : null;
  
  let existingItemIndex = cart.findIndex(item => item.id === productId);
  
  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: productId,
      title,
      price,
      quantity,
      image: imageUrl || ''
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
}
function loadCartCount() {
  const cartBadge = document.getElementById('cart-badge');
  if (!cartBadge) return;
  
  updateCartCountFromLocalStorage();
  
  const token = localStorage.getItem('token');
  if (!token) return;
  
  fetch(`${window.API_URL}/shop/cart`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to get cart: ${response.status}`);
    }
    return response.json();
  })
  .then(cart => {
    if (cart && cart.items && cart.items.length) {
      const totalItems = cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      cartBadge.textContent = totalItems;
      cartBadge.classList.remove('d-none');
    } else {
      updateCartCountFromLocalStorage();
    }
  })
  .catch(error => {
    console.error('Error loading cart count:', error);
    updateCartCountFromLocalStorage();
  });
}
function updateCartCountFromLocalStorage() {
  const cartBadge = document.getElementById('cart-badge');
  if (!cartBadge) return;
  
  const localCart = localStorage.getItem('cart');
  if (localCart) {
    try {
      const cartItems = JSON.parse(localCart);
      if (Array.isArray(cartItems) && cartItems.length > 0) {
        const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        cartBadge.textContent = count;
        cartBadge.classList.remove('d-none');
        return;
      }
    } catch (e) {
      console.error('Error parsing local cart:', e);
    }
  }
  cartBadge.classList.add('d-none');
}
function showToast(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  const toastId = `toast-${Date.now()}`;
  
  const toastEl = document.createElement('div');
  toastEl.className = 'toast show';
  toastEl.id = toastId;
  toastEl.innerHTML = `
    <div class="toast-body">
      <i class="fas fa-check-circle mr-2"></i>${message}
    </div>
    <button type="button" class="close ml-2 mr-2" data-dismiss="toast">
      <span aria-hidden="true">&times;</span>
    </button>
  `;
  
  toastContainer.appendChild(toastEl);
  setTimeout(() => {
    if (document.getElementById(toastId)) {
      document.getElementById(toastId).remove();
    }
  }, 3000);
  const closeBtn = toastEl.querySelector('[data-dismiss="toast"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toastEl.remove();
    });
  }
}
function showAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) return;
  
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
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 150);
  }, 3000);
}

function showProductDetails(productId) {
  window.location.href = `product-details.html?id=${productId}`;
}

function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let starsHtml = '';
  
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<i class="fas fa-star"></i>';
  }
  
  if (halfStar) {
    starsHtml += '<i class="fas fa-star-half-alt"></i>';
  }
  
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<i class="far fa-star"></i>';
  }
  
  return starsHtml;
}

function getProductImageUrl(product) {
  let imageUrl;
  
  const hasImgurImage = product.thumbnail && product.thumbnail.includes('imgur.com');
  
  if (hasImgurImage) {
    if (product.category && typeof product.category === 'object' && product.category.image) {
      imageUrl = product.category.image;
    } else {
      imageUrl = `https://placehold.co/300x300/f8bbd0/333333?text=${encodeURIComponent(product.title || 'Product')}`;
    }
  } else {
    if (product.thumbnail && product.thumbnail.trim() !== '') {
      imageUrl = product.thumbnail;
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = product.images[0];
    } else if (product.image) {
      if (typeof product.image === 'string') {
        imageUrl = product.image;
      } else if (product.image.url) {
        imageUrl = product.image.url;
      } else if (product.image.src) {
        imageUrl = product.image.src;
      }
    } else if (product.category && typeof product.category === 'object' && product.category.image) {
      imageUrl = product.category.image;
    }
  }
  
  if (!imageUrl) {
    imageUrl = `https://placehold.co/300x300/f8bbd0/333333?text=${encodeURIComponent(product.title || 'Product')}`;
  }
  
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${window.API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
  
  return imageUrl;
}

function getProductPrice(product) {
  if (product.price) {
    if (product.price.current) {
      return product.price.current;
    } else if (product.price.value) {
      return product.price.value;
    } else if (typeof product.price === 'number') {
      return product.price;
    }
  }
  return 'N/A';
}

function getProductCategory(product) {
  if (typeof product.category === 'string') {
    return product.category;
  } else if (product.category && product.category.name) {
    return product.category.name;
  }
  return 'Uncategorized';
}

window.fetchProducts = fetchProducts;
window.handleSearch = handleSearch;
window.applyFilters = applyFilters;
window.showProductDetails = showProductDetails;
window.addToCart = addToCart;
window.showToast = showToast;
window.showAlert = showAlert;
window.updateCartCountFromLocalStorage = updateCartCountFromLocalStorage;
window.loadCartCount = loadCartCount;
