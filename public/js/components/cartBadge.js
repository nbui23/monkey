class CartBadge {
    constructor() {
        this.element = document.getElementById('cart-count');
        this.count = 0;
        this.initialize();
    }

    initialize() {
        if (!this.element) {
            console.error('Cart badge element not found, creating one');
            this.element = document.createElement('div');
            this.element.id = 'cart-count';
            document.body.appendChild(this.element);
        }

        if (cartService) {
            const currentCount = cartService.getTotalQuantity();
            this.updateCount(currentCount);
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('cart-updated', (event) => {
            console.log('Cart update event received:', event.detail);
            this.updateCount(event.detail.count);
        });

        this.element.addEventListener('click', () => {
            this.handleBadgeClick();
        });
    }

    updateCount(newCount) {
        console.log('Updating cart badge count to:', newCount);
        this.count = newCount;
        this.element.textContent = this.count;

        if (this.count === 0) {
            this.element.classList.add('hidden');
        } else {
            this.element.classList.remove('hidden');
            if (newCount > parseInt(this.element.textContent || '0')) {
                this.animateBadge();
            }
        }
    }

    animateBadge() {
        this.element.classList.remove('badge-bounce');
        void this.element.offsetWidth;
        this.element.classList.add('badge-bounce');
    }

    handleBadgeClick() {
        const event = new CustomEvent('show-cart-preview', {
            detail: {
                itemCount: this.count,
                position: this.getBadgePosition()
            }
        });
        document.dispatchEvent(event);
    }

    getBadgePosition() {
        const rect = this.element.getBoundingClientRect();
        return {
            top: rect.bottom,
            right: window.innerWidth - rect.right
        };
    }

    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.className = 'cart-badge-notification';
        notification.textContent = message;

        this.element.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, duration);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cartBadge = new CartBadge();
});
