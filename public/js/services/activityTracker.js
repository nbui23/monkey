class ActivityTracker {
    constructor() {
        const savedActivities = localStorage.getItem('activities');
        this.activities = savedActivities ? JSON.parse(savedActivities) : {
            viewedProducts: [],
            cartItems: [],
            sessionStartTime: new Date().toISOString(),
            interactions: []
        };
        // Convert viewedProducts array to Set
        this.activities.viewedProducts = new Set(this.activities.viewedProducts);
    }

    trackProductView(productId) {
        this.activities.viewedProducts.add(productId);
        this.trackInteraction('view_product', { productId });
        this.saveActivities();
    }

    trackInteraction(type, data) {
        this.activities.interactions.push({
            type,
            data,
            timestamp: new Date().toISOString()
        });
        this.saveActivities();
        console.log('User Activity Updated:', this.activities);
    }

    saveActivities() {
        // Convert Set to Array for storage
        const activitiesForStorage = {
            ...this.activities,
            viewedProducts: Array.from(this.activities.viewedProducts)
        };
        localStorage.setItem('activities', JSON.stringify(activitiesForStorage));
    }

    getSessionSummary() {
        return {
            ...this.activities,
            sessionDuration: (new Date() - new Date(this.activities.sessionStartTime)) / 1000,
            totalCartItems: this.activities.cartItems.length,
            uniqueProductsViewed: this.activities.viewedProducts.size
        };
    }
}

const activityTracker = new ActivityTracker();
