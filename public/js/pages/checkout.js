class CheckoutPage {
    constructor() {
        this.cartItems = [];
        this.initializeCheckout();
        this.setupEventListeners();
    }

    initializeCheckout() {
        console.log('Initializing checkout...');
        this.cartItems = cartService.getItems();
        this.renderCartItems();
        this.updateTotal();
    }

    setupEventListeners() {
        const checkoutBtn = document.getElementById('completeCheckout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }

        // Add event listener for survey modal close
        document.addEventListener('survey-completed', () => {
            this.finishCheckout();
        });
    }

    renderCartItems() {
        const cartContainer = document.getElementById('cartItems');
        if (!cartContainer) return;

        cartContainer.innerHTML = '';

        this.cartItems.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                console.error('Product not found:', item.productId);
                return;
            }

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${product.colors[item.color].image}" alt="${product.name}">
                <div class="item-details">
                    <span class="item-name">${product.name}</span>
                    <span class="item-options">
                        Size: ${item.size} | Color: ${item.color} | Quantity: ${item.quantity}
                    </span>
                </div>
                <span class="item-price">$${(product.price * item.quantity).toFixed(2)}</span>
            `;
            cartContainer.appendChild(cartItem);
        });

        if (this.cartItems.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty</p>';
        }
    }

    updateTotal() {
        const total = this.calculateTotal();
        const totalElement = document.getElementById('cartTotal');
        if (totalElement) {
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
    }

    async handleCheckout() {
        if (this.cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        console.log('Processing checkout...');

        // Generate comprehensive customer insights
        const customerInsights = activityTracker.generateCustomerInsights();
        console.log('Customer Insights:', customerInsights);

        // Store insights in localStorage
        const previousInsights = JSON.parse(localStorage.getItem('customerInsights') || '[]');
        previousInsights.push(customerInsights);
        localStorage.setItem('customerInsights', JSON.stringify(previousInsights));

        // Gather items before clearing cart
        const purchasedItems = [...this.cartItems];
        const userActivity = customerInsights; // Use our comprehensive insights

        // Record the checkout action with detailed insights
        activityTracker.trackInteraction('checkout_completed', {
            items: purchasedItems,
            total: this.calculateTotal(),
            insights: customerInsights
        });

        // Show purchase confirmation
        alert('Thank you for your purchase!');

        try {
            // Show survey modal with enhanced data
            if (window.surveyModal) {
                await surveyModal.show(purchasedItems, userActivity);
            } else {
                console.error('Survey modal not initialized');
                this.finishCheckout();
            }
        } catch (error) {
            console.error('Error showing survey:', error);
            this.finishCheckout();
        }
    }

    calculateTotal() {
        return this.cartItems.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    finishCheckout() {
        // Clear the cart and redirect
        cartService.clearCart();
        window.location.href = 'index.html';
    }
}

// Initialize checkout page when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Checkout page loaded');
        window.checkoutPage = new CheckoutPage();
    });
} else {
    window.checkoutPage = new CheckoutPage();
}
