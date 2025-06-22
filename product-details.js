window.addEventListener('error', function(e) {
  if (e.target.tagName === 'IMG') {
    console.error('Image loading error:', e.target.src);
    e.target.src = 'https://placehold.co/600x600/f8bbd0/333333?text=Image+Error';
    e.target.classList.add('error');
  }
}, true);

console.log('Product details script loaded');

if (!window.API_URL) {
  window.API_URL = 'https://api.everrest.educata.dev';
  console.log('API URL set to:', window.API_URL);
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  console.log('Page type:', document.body ? document.body.dataset.page : 'body not available yet');
  
  if (document.body.dataset.page === 'product-details') {
    console.log('Product details page detected');
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    console.log('Product ID from URL:', productId);
    
    if (productId) {
      loadProductDetails(productId);
    } else {
      console.error('No product ID found in URL');
      window.location.href = 'index.html';
    }
  }  
  loadCartCount();
});

function loadCartCount() {
  const cartBadge = document.getElementById('cart-badge');
  if (!cartBadge) return;
  
  updateCartCountFromLocalStorage();
  
  const token = localStorage.getItem('token');
  if (!token) return; 
  
  fetch(`${window.API_URL || 'https://api.everrest.educata.dev'}/shop/cart`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      console.warn(`Cart API error: ${response.status}`);
      return null;
    }
    return response.json();
  })
  .then(cart => {
    if (!cart) return; 
    
    if (cart && cart.items && cart.items.length) {
      const totalItems = cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      cartBadge.textContent = totalItems;
      cartBadge.classList.remove('d-none');
    }
  })
  .catch(error => {
    console.error('Error loading cart count:', error);
  });
}

function loadProductDetails(productId) {
  const productContainer = document.getElementById('product-container');
  if (!productContainer) {
    console.error('Product container not found in the DOM');
    return;
  }
  
  productContainer.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
    </div>
  `;
  
  console.log('Loading product details for ID:', productId);
  
  fetch(`${window.API_URL || 'https://api.everrest.educata.dev'}/shop/products/${productId}`)
    .then(response => {
      if (!response.ok) {
        console.warn(`Product ID ${productId} not found, fetching alternative product`);
        return fetch(`${window.API_URL || 'https://api.everrest.educata.dev'}/shop/products/all`)
          .then(resp => {
            if (!resp.ok) throw new Error(`Failed to fetch products: ${resp.status}`);
            return resp.json();
          })
          .then(data => {
            if (data && data.products && data.products.length > 0) {
              return data.products[0];
            }
            throw new Error('No products available');
          });
      }
      return response.json();
    })
    .then(product => {
      console.log('Product data:', product);
      
      const starsHtml = generateStarRating(product.rating || 0);
      
      let price = 0;
      if (product.price) {
        if (product.price.current) {
          price = product.price.current;
        } else if (typeof product.price === 'number') {
          price = product.price;
        }
      }
      
      let categoryName = 'Uncategorized';
      if (product.category) {
        if (typeof product.category === 'string') {
          categoryName = product.category;
        } else if (product.category.name) {
          categoryName = product.category.name;
        }
      }
      
      let imageUrl = '';

      const hasImgurImage = product.thumbnail && product.thumbnail.includes('imgur.com');
      
      if (hasImgurImage) {
        if (product.category && typeof product.category === 'object' && product.category.image) {
          imageUrl = product.category.image;
        } else {
          imageUrl = `https://placehold.co/600x600/f8bbd0/333333?text=${encodeURIComponent(product.title || 'Product')}`;
        }
      } else {
        if (product.thumbnail && product.thumbnail.trim() !== '') {
          imageUrl = product.thumbnail;
        } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          for (let i = 0; i < product.images.length; i++) {
            if (product.images[i] && product.images[i].trim() !== '') {
              imageUrl = product.images[i];
              break;
            }
          }
        } else if (product.image) {
          if (typeof product.image === 'string') {
            imageUrl = product.image;
          } else if (product.image.url) {
            imageUrl = product.image.url;
          }
        } else if (product.category && typeof product.category === 'object' && product.category.image) {
          imageUrl = product.category.image;
        }
      }

      if (!imageUrl || imageUrl.trim() === '') {
        imageUrl = `https://placehold.co/600x600/f8bbd0/333333?text=${encodeURIComponent(product.title || 'Product')}`;
      }

      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        imageUrl = `${window.API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      console.log('Product image URL:', imageUrl);
      
      productContainer.innerHTML = `
        <div class="row">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <div class="product-gallery">
              <img src="${imageUrl}" 
                   class="img-fluid product-image" 
                   alt="${product.title || 'Product'}"
                   onerror="this.onerror=null; this.src='https://placehold.co/600x600/f8bbd0/333333?text=No+Image'; this.classList.add('error');"
                   onload="this.classList.add('loaded');">
            </div>
          </div>
          
          <div class="col-lg-6">
            <div class="product-info">
              <h1 class="product-title">${product.title || 'Product'}</h1>
              
              <div class="d-flex align-items-center mb-3">
                <div class="stars mr-3">${starsHtml}</div>
                <span class="text-muted">(${(product.rating || 0).toFixed(1)})</span>
              </div>
              
              <h2 class="product-price">${price}₾</h2>
              
              <div class="product-meta">
                <div class="meta-item">
                  <span class="meta-label">Brand:</span>
                  <span>${product.brand || 'N/A'}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Category:</span>
                  <span>${categoryName}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Availability:</span>
                  <span>${product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}</span>
                </div>
              </div>
              
              <div class="product-description mb-4">
                <p>${product.description || 'No description available'}</p>
              </div>
              
              <div class="d-flex align-items-center mb-4">
                <div class="quantity-control mr-3">
                  <button type="button" class="quantity-btn" id="decrease-quantity">-</button>
                  <input type="number" id="product-quantity" class="quantity-input" value="1" min="1" max="${product.stock || 99}">
                  <button type="button" class="quantity-btn" id="increase-quantity">+</button>
                </div>
                
                <button class="btn btn-pink" id="add-to-cart-btn" ${product.stock <= 0 ? 'disabled' : ''}>
                  <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                </button>
                
                <button class="btn btn-outline-pink ml-2" id="add-to-wishlist-btn">
                  <i class="far fa-heart"></i>
                </button>
              </div>
              
              <div class="product-actions">
                <button class="btn btn-outline-pink btn-sm mr-2" id="rate-product-btn" data-toggle="modal" data-target="#ratingModal">
                  <i class="far fa-star mr-1"></i>Rate this product
                </button>
                
                <button class="btn btn-outline-pink btn-sm" id="share-product-btn">
                  <i class="fas fa-share-alt mr-1"></i>Share
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row mt-5">
          <div class="col-12">
            <ul class="nav nav-tabs" id="productTabs" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" id="description-tab" data-toggle="tab" href="#description" role="tab">Description</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" id="reviews-tab" data-toggle="tab" href="#reviews" role="tab">Reviews</a>
              </li>
            </ul>
            
            <div class="tab-content" id="productTabsContent">
              <div class="tab-pane fade show active" id="description" role="tabpanel">
                <div class="p-4">
                  <p>${product.description || 'No description available'}</p>
                </div>
              </div>
              
              <div class="tab-pane fade" id="reviews" role="tabpanel">
                <div class="p-4">
                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4>Customer Reviews</h4>
                    <button class="btn btn-pink" data-toggle="modal" data-target="#ratingModal">
                      <i class="far fa-star mr-1"></i>Write a Review
                    </button>
                  </div>
                  
                  <div id="reviews-container">
                    <div class="spinner-container">
                      <div class="spinner"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      loadProductReviews(productId);
      
      setupQuantityControls();
      
      setupAddToCartButton(product._id || productId, product.title || 'Product', price);
      
      setupRatingForm(product._id || productId);
      
      setupShareButton(product);
      
      if (product.category) {
        const categoryId = typeof product.category === 'string' ? product.category : 
                          (product.category.id || product.category.name);
        loadRelatedProducts(categoryId);
      }
    })
    .catch(error => {
      console.error('Failed to load product details:', error);
      productContainer.innerHTML = `
        <div class="text-center py-5">
          <h3 class="text-danger">Error loading product details</h3>
          <p>Please try again later</p>
          <a href="index.html" class="btn btn-pink mt-3">Back to Home</a>
        </div>
      `;
    });
}

function loadRelatedProducts(category) {
  const relatedProductsContainer = document.getElementById('related-products-container');
  if (!relatedProductsContainer) return;
  
  relatedProductsContainer.innerHTML = `
    <div class="col-12">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
    </div>
  `;
  
  try {
    fetch(`${window.API_URL || 'https://api.everrest.educata.dev'}/shop/products/category/${category}`)
      .then(response => {
        if (!response.ok) {
          return fetch(`${window.API_URL || 'https://api.everrest.educata.dev'}/shop/products/all`);
        }
        return response;
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const products = data.products || [];
        
        const relatedProducts = products.slice(0, 4);
        
        if (relatedProducts.length === 0) {
          relatedProductsContainer.innerHTML = `
            <div class="col-12 text-center">
              <p class="text-muted">No related products found</p>
            </div>
          `;
          return;
        }
        
        relatedProductsContainer.innerHTML = '';
        
        relatedProducts.forEach(function(product) {
          const starsHtml = generateStarRating(product.rating || 0);
          
          let price = 0;
          if (product.price) {
            if (product.price.current) {
              price = product.price.current;
            } else if (typeof product.price === 'number') {
              price = product.price;
            }
          }
          
          let imageUrl = '';
          
          if (product.thumbnail && product.thumbnail.trim() !== '') {
            imageUrl = product.thumbnail;
          } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            imageUrl = product.images[0];
          } else if (product.category && product.category.image) {
            imageUrl = product.category.image;
          }
          
          const hasImgurImage = imageUrl && imageUrl.includes('imgur.com');
          
          if (hasImgurImage || !imageUrl) {
            imageUrl = `https://placehold.co/300x300/f8bbd0/333333?text=${encodeURIComponent(product.title || 'Product')}`;
          }
          
          const productCol = document.createElement('div');
          productCol.className = 'col-md-3 col-sm-6 mb-4';
          
          productCol.innerHTML = `
            <div class="card h-100">
              <img src="${imageUrl}" 
                   class="card-img-top" 
                   alt="${product.title || 'Product'}"
                   onerror="this.onerror=null; this.src='https://placehold.co/300x300/f8bbd0/333333?text=No+Image'">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">
                  <a href="product-details.html?id=${product._id}" class="text-decoration-none">
                    ${product.title || 'Product'}
                  </a>
                </h5>
                <div class="stars mb-2">${starsHtml}</div>
                <p class="price mb-3">${price}₾</p>
                <button class="btn btn-pink mt-auto add-to-cart-btn" data-product-id="${product._id}" data-product-name="${(product.title || 'Product').replace(/"/g, '&quot;')}" data-product-price="${price}">
                  <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                </button>
              </div>
            </div>
          `;
          
          relatedProductsContainer.appendChild(productCol);
        });
        
        relatedProductsContainer.querySelectorAll('.add-to-cart-btn').forEach(function(button) {
          button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            const productPrice = parseFloat(this.dataset.productPrice);
            
            addToLocalCart(productId, productName, productPrice, 1);
            showToast("Item added to cart!");
            loadCartCount();
          });
        });
      })
      .catch(function(error) {
        console.error('Failed to load related products:', error);
        relatedProductsContainer.innerHTML = `
          <div class="col-12 text-center">
            <p class="text-muted">Related products unavailable</p>
          </div>
        `;
      });
  } catch (error) {
    console.error('Exception in loadRelatedProducts:', error);
    relatedProductsContainer.innerHTML = `
      <div class="col-12 text-center">
        <p class="text-muted">Related products unavailable</p>
      </div>
    `;
  }
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

function setupQuantityControls() {
  const quantityInput = document.getElementById('product-quantity');
  const decreaseBtn = document.getElementById('decrease-quantity');
  const increaseBtn = document.getElementById('increase-quantity');
  
  if (!decreaseBtn || !increaseBtn || !quantityInput) return;
  
  decreaseBtn.addEventListener('click', function() {
    let quantity = parseInt(quantityInput.value) - 1;
    if (quantity < 1) quantity = 1;
    quantityInput.value = quantity;
  });
  
  increaseBtn.addEventListener('click', function() {
    let quantity = parseInt(quantityInput.value) + 1;
    const max = parseInt(quantityInput.getAttribute('max') || '99');
    if (quantity > max) quantity = max;
    quantityInput.value = quantity;
  });
  
  quantityInput.addEventListener('change', function() {
    let quantity = parseInt(quantityInput.value);
    const max = parseInt(quantityInput.getAttribute('max') || '99');
    
    if (isNaN(quantity) || quantity < 1) quantity = 1;
    if (quantity > max) quantity = max;
    
    quantityInput.value = quantity;
  });
}
function setupAddToCartButton(productId, productName, price) {
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (!addToCartBtn) return;
  
  addToCartBtn.addEventListener('click', function() {
    const quantityInput = document.getElementById('product-quantity');
    if (!quantityInput) return;
    
    const quantity = parseInt(quantityInput.value) || 1;
    
    const originalButtonHtml = addToCartBtn.innerHTML;
    
    addToCartBtn.disabled = true;
    addToCartBtn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Adding...';
    addToCartBtn.classList.add('btn-loading');
    
    setTimeout(() => {
      try {
        let productImage = '';
        const productImageEl = document.querySelector('.product-image');
        if (productImageEl && productImageEl.src) {
          productImage = productImageEl.src;
        }
        
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
        
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex !== -1) {
          cart[existingItemIndex].quantity += quantity;
        } else {
          cart.push({ 
            id: productId, 
            title: productName || 'Product', 
            price: price || 0, 
            quantity: quantity || 1,
            image: productImage
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        if (typeof updateCartCountFromLocalStorage === 'function') {
          updateCartCountFromLocalStorage();
        }
        
        addToCartBtn.classList.remove('btn-loading');
        addToCartBtn.classList.add('btn-success');
        addToCartBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Added to Cart';
        
        if (typeof showToast === 'function') {
          showToast(`${quantity} item(s) added to your cart`);
        }
        
        setTimeout(() => {
          addToCartBtn.disabled = false;
          addToCartBtn.classList.remove('btn-success');
          addToCartBtn.innerHTML = originalButtonHtml;
        }, 2000);
        
      } catch (error) {
        console.error('Error adding to cart:', error);
        
        addToCartBtn.disabled = false;
        addToCartBtn.classList.remove('btn-loading');
        addToCartBtn.innerHTML = originalButtonHtml;
      }
    }, 600);
  });
}

function setupRatingForm(productId) {
  const ratingForm = document.getElementById('rating-form');
  if (!ratingForm) return;
  
  ratingForm.dataset.productId = productId;
  
  ratingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    
    if (!rating) {
      showAlert('Please select a rating', 'warning');
      return;
    }
    
    setTimeout(function() {
      $('#ratingModal').modal('hide');
      showAlert('Review submitted successfully!', 'success');
      
      ratingForm.reset();
      
      loadProductReviews(productId);
    }, 500);
  });
}

function setupShareButton(product) {
  const shareBtn = document.getElementById('share-product-btn');
  if (!shareBtn) return;
  
  shareBtn.addEventListener('click', function() {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: product.title || product.name || 'Product',
        text: product.description || 'Check out this product!',
        url: shareUrl
      }).catch(function(error) {
        console.error('Error sharing:', error);
      });
    } else {
      $('#shareModal').modal('show');
      
      const shareLinkInput = document.getElementById('share-link');
      if (shareLinkInput) {
        shareLinkInput.value = shareUrl;
      }
      
      const copyLinkBtn = document.getElementById('copy-link-btn');
      if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
          const shareLinkInput = document.getElementById('share-link');
          if (shareLinkInput) {
            shareLinkInput.select();
            document.execCommand('copy');
            showAlert('Link copied to clipboard!', 'success');
          }
        });
      }
    }
  });
}

function loadProductReviews(productId) {
  const reviewsContainer = document.getElementById('reviews-container');
  if (!reviewsContainer) return;
  
  const simulatedReviews = [
    {
      name: "John Doe",
      rating: 4.5,
      date: "2023-05-15",
      comment: "Great product! I really enjoy using it."
    },
    {
      name: "Jane Smith",
      rating: 5,
      date: "2023-04-22",
      comment: "Excellent quality and fast shipping."
    }
  ];
  
  if (simulatedReviews.length === 0) {
    reviewsContainer.innerHTML = `
      <div class="text-center py-4">
        <p class="text-muted">No reviews yet. Be the first to review this product!</p>
      </div>
    `;
    return;
  }
  
  reviewsContainer.innerHTML = '';
  
  simulatedReviews.forEach(function(review) {
    const starsHtml = generateStarRating(review.rating);
    const reviewDate = new Date(review.date).toLocaleDateString();
    
    const reviewDiv = document.createElement('div');
    reviewDiv.className = 'review-item';
    
    reviewDiv.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <span class="reviewer-name">${review.name}</span>
          <div class="stars">${starsHtml}</div>
        </div>
        <span class="review-date">${reviewDate}</span>
      </div>
      ${review.comment ? `<p class="review-text">${review.comment}</p>` : ''}
    `;
    
    reviewsContainer.appendChild(reviewDiv);
  });
}

function showAlert(message, type) {
  if (typeof window.showAlert === 'function') {
    window.showAlert(message, type);
    return;
  }
  
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
