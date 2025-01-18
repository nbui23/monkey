class CartService {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        // Dispatch event for cart updates
        document.dispatchEvent(new CustomEvent('cart-updated', {
            detail: { count: this.getTotalQuantity() }
        }));
    }

    addItem(productId, size, color, quantity) {
        const item = {
            productId,
            size,
            color,
            quantity,
            timestamp: new Date().toISOString()
        };
        this.items.push(item);
        this.saveCart();
        activityTracker.trackInteraction('add_to_cart', item);
    }

    getTotalQuantity() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    updateCartCount() {
        const count = this.getTotalQuantity();
        document.dispatchEvent(new CustomEvent('cart-updated', {
            detail: { count }
        }));
    }

    getItems() {
        return this.items;
    }

    clearCart() {
        this.items = [];
        this.saveCart();
    }
}

const cartService = new CartService();
