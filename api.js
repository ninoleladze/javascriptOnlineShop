window.apiService = (function() {
    const API_URL = "https://api.everrest.educata.dev";
    
    return {
        async getAllProducts() {
            try {
                const url = `${API_URL}/shop/products/all`;
                console.log('Fetching all products from:', url);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching all products:', error);
                throw error;
            }
        },
        
        async searchProducts(query) {
            try {
                const url = `${API_URL}/shop/products/search?q=${encodeURIComponent(query)}`;
                console.log('Searching products from:', url);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Failed to search products: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error searching products:', error);
                throw error;
            }
        },
        
        async getProductsByCategory(categoryId) {
            try {
                const url = `${API_URL}/shop/products/category/${encodeURIComponent(categoryId)}`;
                console.log('Fetching products by category from:', url);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch products by category: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching products by category:', error);
                throw error;
            }
        },
        
        async getProductsByBrand(brandName) {
            try {
                const url = `${API_URL}/shop/products/brand/${encodeURIComponent(brandName)}`;
                console.log('Fetching products by brand from:', url);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch products by brand: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching products by brand:', error);
                throw error;
            }
        },
        
        async getProductDetails(productId) {
            try {
                const url = `${API_URL}/shop/products/${productId}`;
                console.log('Fetching product details from:', url);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch product details: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching product details:', error);
                throw error;
            }
        },
        
        async getCategories() {
            try {
                const data = await this.getAllProducts();
                // Extract unique categories from products
                const categories = [...new Set(data.products.map(product => product.category))].filter(Boolean);
                return { categories };
            } catch (error) {
                console.error('Error fetching categories:', error);
                throw error;
            }
        },

        async getBrands() {
            try {
                const data = await this.getAllProducts();
                // Extract unique brands from products
                const brands = [...new Set(data.products.map(product => product.brand))].filter(Boolean);
                return { brands };
            } catch (error) {
                console.error('Error fetching brands:', error);
                throw error;
            }
        },

        async signIn(email, password) {
            try {
                const url = `${API_URL}/auth/sign_in`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email, 
                        password 
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to sign in: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error signing in:', error);
                throw error;
            }
        },
        
        async signUp(userData) {
            try {
                const requiredFields = ['email', 'password', 'firstName', 'lastName'];
                for (const field of requiredFields) {
                    if (!userData[field]) {
                        throw new Error(`Missing required field: ${field}`);
                    }
                }
                
                const url = `${API_URL}/auth/sign_up`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: userData.email,
                        password: userData.password,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        phone: userData.phone || '',
                        address: userData.address || '',
                        city: userData.city || '',
                        zipCode: userData.zipCode || '',
                        country: userData.country || ''
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to sign up: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error signing up:', error);
                throw error;
            }
        },
        
        async addToCart(productId, quantity = 1) {
            try {
                const url = `${API_URL}/shop/cart/product`;
                
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        productId, 
                        quantity 
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to add product to cart: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error adding to cart:', error);
                throw error;
            }
        },
        
          async getCart() {
    try {
        const url = `${API_URL}/shop/cart`;
        
        const token = localStorage.getItem('token');
        if (!token) {
            return { items: [] }; 
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 400 || response.status === 401) {
                
                return { items: [] };
            }
            throw new Error(`Failed to get cart: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error getting cart:', error);
        return { items: [] }; 
    }
},

       
        
        async updateCartItem(productId, quantity) {
            try {
                const url = `${API_URL}/shop/cart/product`;
                
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        productId, 
                        quantity 
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to update cart item: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error updating cart item:', error);
                throw error;
            }
        },
        async removeFromCart(productId) {
            try {
                const url = `${API_URL}/shop/cart/product/${productId}`;
                
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to remove item from cart: ${response.status} ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error removing from cart:', error);
                throw error;
            }
        }
    };
})();
