
document.addEventListener('DOMContentLoaded', function() {
  console.log('Cart.js loaded');
  
  if (document.body.dataset.page === 'cart') {
    console.log('Cart page detected, loading cart');
    loadCartPage();
  }
  
  updateCartCountFromLocalStorage();
});

function loadCartPage() {
  const cartContainer = document.getElementById('cart-items-container');
  const cartSummary = document.getElementById('cart-summary-container');
  
  if (!cartContainer || !cartSummary) {
    console.error('Cart containers not found in the DOM');
    return;
  }
  
  cartContainer.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
    </div>
  `;
  
  const savedCart = localStorage.getItem('cart');
  let cart = [];
  
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      if (!Array.isArray(cart)) cart = [];
    } catch (e) {
      console.error('Error parsing cart', e);
      cart = [];
    }
  }
  
  renderCartItems(cart, cartContainer, cartSummary);
}

function renderCartItems(cart, cartContainer, cartSummary) {
  if (!cart || cart.length === 0) {
  
    cartContainer.innerHTML = `
      <div class="empty-cart-container">
        <div class="empty-cart-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h3>Your shopping bag is empty</h3>
        <p>Browse our products and add items to your cart</p>
        <a href="index.html" class="btn btn-pink">Start Shopping</a>
      </div>
    `;
    cartSummary.innerHTML = '';
    return;
  }
  
  cartContainer.innerHTML = `
    <div class="cart-header">
      <div class="row align-items-center">
        <div class="col-md-6">
          <h5>Product</h5>
        </div>
        <div class="col-md-2 text-center">
          <h5>Price</h5>
        </div>
        <div class="col-md-2 text-center">
          <h5>Quantity</h5>
        </div>
        <div class="col-md-2 text-center">
          <h5>Total</h5>
        </div>
      </div>
    </div>
  `;
  
  let totalPrice = 0;
  
  cart.forEach(function(item, index) {
    const itemPrice = parseFloat(item.price) || 0;
    const itemTotal = itemPrice * item.quantity;
    totalPrice += itemTotal;
    
    const cartItemDiv = document.createElement('div');
    cartItemDiv.className = 'cart-item';
    cartItemDiv.style.setProperty('--item-index', index);
    cartItemDiv.innerHTML = `
      <div class="row align-items-center">
        <div class="col-md-6">
          <div class="d-flex align-items-center">
            <div class="cart-item-image mr-3">
              <img src="${item.image || 'https://placehold.co/300x300/f8bbd0/333333?text=Product'}" 
                   alt="${item.title}"
                   onerror="this.onerror=null; this.src='https://placehold.co/300x300/f8bbd0/333333?text=Product'">
            </div>
            <div class="cart-item-details">
              <h5><a href="product-details.html?id=${item.id}">${item.title}</a></h5>
              <p class="text-muted">ID: ${item.id}</p>
              <span class="badge-category">Product</span>
            </div>
          </div>
        </div>
        <div class="col-md-2 text-center">
          <span class="price">${itemPrice.toFixed(2)}₾</span>
        </div>
        <div class="col-md-2">
          <div class="quantity-control">
            <button type="button" class="quantity-btn decrease-btn" data-product-id="${item.id}">
              <i class="fas fa-minus"></i>
            </button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
            <button type="button" class="quantity-btn increase-btn" data-product-id="${item.id}">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        <div class="col-md-2 d-flex justify-content-between align-items-center">
          <span class="item-total">${itemTotal.toFixed(2)}₾</span>
          <button class="remove-item" data-product-id="${item.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `;
    
    cartContainer.appendChild(cartItemDiv);
  });
  const continueShoppingDiv = document.createElement('div');
  continueShoppingDiv.className = 'text-left mb-4 mt-4';
  continueShoppingDiv.innerHTML = `
    <a href="index.html" class="continue-shopping-btn">
      <i class="fas fa-arrow-left"></i>Continue Shopping
    </a>
  `;
  cartContainer.appendChild(continueShoppingDiv);
  
  const shipping = 0;
  const tax = totalPrice * 0.1; 
  const total = totalPrice + shipping + tax;
  
  cartSummary.innerHTML = `
    <div class="cart-summary">
      <h4 class="summary-title">
        <i class="fas fa-receipt"></i>
        Order Summary
      </h4>
      
      <div class="summary-item">
        <span>Subtotal:</span>
        <span id="subtotal">${totalPrice.toFixed(2)}₾</span>
      </div>
      
      <div class="summary-item">
        <span>Shipping:</span>
        <span id="shipping" class="text-success">${shipping === 0 ? 'Free' : `${shipping.toFixed(2)}₾`}</span>
      </div>
      
      <div class="summary-item">
        <span>Tax (10%):</span>
        <span id="tax">${tax.toFixed(2)}₾</span>
      </div>
      
      <div class="summary-total">
        <span>Total:</span>
        <span id="total">${total.toFixed(2)}₾</span>
      </div>
      
      <div class="promo-code-container">
        <label for="promo-code">Promo Code</label>
        <div class="promo-code-input">
          <input type="text" id="promo-code" placeholder="Enter promo code">
          <button type="button">Apply</button>
        </div>
      </div>
      
      <button id="checkout-btn" class="checkout-btn">
        <i class="fas fa-lock"></i>Proceed to Checkout
      </button>
      
      <div class="payment-methods">
        <p>We Accept</p>
        <div class="payment-icons">
          <i class="fab fa-cc-visa"></i>
          <i class="fab fa-cc-mastercard"></i>
          <i class="fab fa-cc-amex"></i>
          <i class="fab fa-cc-paypal"></i>
        </div>
      </div>
      
      <div class="secure-checkout">
        <i class="fas fa-shield-alt"></i>
        <span>Secure Checkout</span>
      </div>
    </div>
  `;
  
  setupQuantityControls();
  setupRemoveButtons();
  setupCheckoutButton();
}
function setupQuantityControls() {
  document.querySelectorAll('.decrease-btn').forEach(function(button) {
    button.addEventListener('click', function() {
      const productId = this.dataset.productId;
      const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
      if (!input) return;
      
      const currentValue = parseInt(input.value);
      
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateCartItemQuantity(productId, currentValue - 1);
      }
    });
  });
  document.querySelectorAll('.increase-btn').forEach(function(button) {
    button.addEventListener('click', function() {
      const productId = this.dataset.productId;
      const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
      if (!input) return;
      
      const currentValue = parseInt(input.value);
      
      input.value = currentValue + 1;
      updateCartItemQuantity(productId, currentValue + 1);
    });
  });
  document.querySelectorAll('.quantity-input').forEach(function(input) {
    input.addEventListener('change', function() {
      const productId = this.dataset.productId;
      let quantity = parseInt(this.value);
      
      if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        this.value = 1;
      }
      
      updateCartItemQuantity(productId, quantity);
    });
  });
}


function updateCartItemQuantity(productId, quantity) {
  const savedCart = localStorage.getItem('cart');
  if (!savedCart) return;
  
  try {
    const cart = JSON.parse(savedCart);
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
      cart[itemIndex].quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      
      loadCartPage();
      showToast('Cart updated successfully');
    }
  } catch (e) {
    console.error('Error updating cart item:', e);
  }
}


function setupRemoveButtons() {
  document.querySelectorAll('.remove-item').forEach(function(button) {
    button.addEventListener('click', function() {
      const productId = this.dataset.productId;
      
      this.disabled = true;
      this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
      
      removeCartItem(productId);
    });
  });
}

function removeCartItem(productId) {
  const savedCart = localStorage.getItem('cart');
  if (!savedCart) return;
  
  try {
    const cart = JSON.parse(savedCart);
    const updatedCart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    loadCartPage();
    showToast('Item removed from cart');
    
    updateCartCountFromLocalStorage();
  } catch (e) {
    console.error('Error removing item from cart:', e);
  }
}
function setupCheckoutButton() {
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      this.disabled = true;
      this.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Processing...';
      
      setTimeout(() => {
        showToast('Checkout functionality coming soon!');
        
        this.disabled = false;
        this.innerHTML = '<i class="fas fa-lock mr-2"></i>Proceed to Checkout';
      }, 1000);
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

function showToast(message) {
  if (typeof window.showToast === 'function') {
    window.showToast(message);
    return;
  }
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
window.loadCartPage = loadCartPage;
window.updateCartCountFromLocalStorage = updateCartCountFromLocalStorage;
window.showToast = showToast;
