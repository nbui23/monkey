class CheckoutPage {
    constructor() {
        this.cartItems = [];
        this.initializeCheckout();
        this.setupEventListeners();
    }

    initializeCheckout() {
        console.log('Initializing checkout...');
        // Get cart items from cartService
        this.cartItems = cartService.getItems();
        console.log('Cart items:', this.cartItems);
        this.renderCartItems();
        this.updateTotal();
    }

    setupEventListeners() {
        const checkoutBtn = document.getElementById('completeCheckout');
        checkoutBtn.addEventListener('click', () => this.handleCheckout());
    }

    renderCartItems() {
        const cartContainer = document.getElementById('cartItems');
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
                <img src="${product.image}" alt="${product.name}">
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
        const total = this.cartItems.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
        document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
    }

    handleCheckout() {
        console.log('Processing checkout...');
        // For now, just show a success message and clear cart
        alert('Thank you for your purchase!');
        cartService.clearCart();
        window.location.href = 'index.html';
    }
}

// Initialize checkout page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Checkout page loaded');
    window.checkoutPage = new CheckoutPage();
});
