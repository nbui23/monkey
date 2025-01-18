function initializeApp() {
    console.log('Initializing app...');
    console.log('Products:', products);

    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.error('Products grid container not found');
        return;
    }

    renderProductGrid(products);

    window.productModal = new ProductModal();

    console.log('App initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

window.goToCheckout = function() {
    const sessionSummary = activityTracker.getSessionSummary();
    console.log('Checkout initiated with session data:', sessionSummary);
    window.location.href = 'checkout.html';
};

window.closeModal = function() {
    if (window.productModal) {
        productModal.close();
    }
};
