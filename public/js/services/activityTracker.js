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
        // Create a simplified version of the data without circular references
        const simplifiedData = this.simplifyData(data);

        this.activities.interactions.push({
            type,
            data: simplifiedData,
            timestamp: new Date().toISOString()
        });
        this.saveActivities();
        console.log('User Activity Updated:', this.activities);
    }

    simplifyData(data) {
        if (!data) return undefined;

        // Create a new object with only serializable data
        const simplified = {};
        for (const [key, value] of Object.entries(data)) {
            if (key === 'insights') continue; // Skip nested insights
            if (key === 'items' && Array.isArray(value)) {
                simplified[key] = value.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                }));
            } else if (typeof value !== 'function' && typeof value !== 'symbol') {
                simplified[key] = value;
            }
        }
        return simplified;
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

    generateCustomerInsights() {
        const cartItems = cartService.getItems();
        const now = new Date();
        const sessionStart = new Date(this.activities.sessionStartTime);

        // Get all viewed products with their details
        const viewedProducts = Array.from(this.activities.viewedProducts).map(productId => {
            const product = products.find(p => p.id === productId);
            return {
                productId,
                productType: product ? product.type : 'unknown',
                name: product ? product.name : 'unknown',
                price: product ? product.price : 0
            };
        });

        // Create simplified interactions
        const simplifiedInteractions = this.activities.interactions.map(interaction => ({
            type: interaction.type,
            timestamp: interaction.timestamp,
            data: this.simplifyData(interaction.data)
        }));

        // Calculate time spent viewing each product
        const productViewDurations = {};
        for (let i = 0; i < simplifiedInteractions.length; i++) {
            const interaction = simplifiedInteractions[i];
            if (interaction.type === 'view_product' && interaction.data?.productId) {
                const productId = interaction.data.productId;
                const startTime = new Date(interaction.timestamp);
                const endTime = simplifiedInteractions[i + 1] ?
                    new Date(simplifiedInteractions[i + 1].timestamp) : now;

                productViewDurations[productId] = (productViewDurations[productId] || 0) +
                    (endTime - startTime) / 1000;
            }
        }

        // Analyze cart behavior
        const cartAnalysis = {
            totalItems: cartItems.length,
            totalValue: cartItems.reduce((sum, item) => {
                const product = products.find(p => p.id === item.productId);
                return sum + (product ? product.price * item.quantity : 0);
            }, 0),
            itemTypes: cartItems.reduce((types, item) => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    types[product.type] = (types[product.type] || 0) + 1;
                }
                return types;
            }, {}),
            averageQuantityPerItem: cartItems.reduce((sum, item) => sum + item.quantity, 0) /
                cartItems.length || 0
        };

        const insights = {
            sessionId: crypto.randomUUID(),
            timestamp: now.toISOString(),
            sessionData: {
                duration: (now - sessionStart) / 1000,
                startTime: sessionStart.toISOString(),
                endTime: now.toISOString()
            },
            browsingBehavior: {
                totalProductsViewed: viewedProducts.length,
                uniqueProductTypesViewed: [...new Set(viewedProducts.map(p => p.productType))],
                productViewDurations,
                mostViewedCategories: Object.entries(
                    viewedProducts.reduce((acc, product) => {
                        acc[product.productType] = (acc[product.productType] || 0) + 1;
                        return acc;
                    }, {})
                ).sort((a, b) => b[1] - a[1])
            },
            cartAnalysis,
            userInteractions: {
                totalInteractions: simplifiedInteractions.length,
                interactionsByType: simplifiedInteractions.reduce((acc, interaction) => {
                    acc[interaction.type] = (acc[interaction.type] || 0) + 1;
                    return acc;
                }, {}),
                recentInteractions: simplifiedInteractions.slice(-10) // Only keep last 10 interactions
            },
            productInsights: {
                viewedProducts,
                abandonedProducts: viewedProducts.filter(
                    product => !cartItems.some(item => item.productId === product.productId)
                ),
                purchasedProducts: cartItems.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return {
                        productId: item.productId,
                        productType: product ? product.type : 'unknown',
                        name: product ? product.name : 'unknown',
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                        price: product ? product.price : 0,
                        timeInCart: item.timestamp // Already a string from cartService
                    };
                })
            }
        };

        // Verify the insights object is serializable
        try {
            JSON.stringify(insights);
            return insights;
        } catch (error) {
            console.error('Error serializing insights:', error);
            // Return a simplified version without recent interactions if there's an error
            delete insights.userInteractions.recentInteractions;
            return insights;
        }
    }
}

const activityTracker = new ActivityTracker();
