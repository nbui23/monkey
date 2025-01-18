class ProductCard {
    constructor(product) {
        this.product = product;
    }

    render() {
        const card = document.createElement('div');
        card.className = 'product-card';

        const defaultColorData = this.product.colors[this.product.defaultColor] ||
                               this.product.colors[Object.keys(this.product.colors)[0]];

        const imageUrl = defaultColorData ? defaultColorData.image : '/api/placeholder/250/200?text=No+Image';

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${imageUrl}"
                     alt="${this.product.name}"
                     class="product-image">
                <div class="product-type">${this.product.type}</div>
            </div>
            <div class="product-info">
                <div class="product-name">${this.product.name}</div>
                <div class="product-price">$${this.product.price.toFixed(2)}</div>
            </div>
        `;

        card.onclick = () => {
            if (window.productModal) {
                productModal.open(this.product);
            } else {
                console.error('Product modal not initialized');
            }
        };

        return card;
    }
}

function renderProductGrid(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) {
        console.error('Products grid container not found');
        return;
    }

    grid.innerHTML = '';

    products.forEach(product => {
        const card = new ProductCard(product);
        grid.appendChild(card.render());
    });
}
