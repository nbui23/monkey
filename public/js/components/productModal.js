class ProductModal {
    constructor() {
        this.modal = document.getElementById('productModal');
        this.details = document.getElementById('productDetails');
        this.currentProduct = null;
    }

    open(product) {
        this.currentProduct = product;
        activityTracker.trackProductView(product.id);
        this.details.innerHTML = `
            <img src="${product.colors[product.defaultColor].image}"
                 alt="${product.name}"
                 class="product-image"
                 id="modalProductImage">
            <h2>${product.name}</h2>
            <p class="product-type">${product.type}</p>
            <p class="product-price">$${product.price}</p>
            <div class="product-options">
                <div class="option-group">
                    <label>Size:</label>
                    <select id="sizeSelect">
                        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                </div>
                <div class="option-group">
                    <label>Color:</label>
                    <select id="colorSelect" onchange="productModal.handleColorChange()">
                        ${Object.keys(product.colors).map(color => `
                            <option value="${color}" ${color === product.defaultColor ? 'selected' : ''}>
                                ${color}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="option-group">
                    <label>Quantity:</label>
                    <select id="quantitySelect">
                        ${[1, 2, 3, 4, 5].map(num => `<option value="${num}">${num}</option>`).join('')}
                    </select>
                </div>
            </div>
            <button class="add-to-cart-btn" onclick="productModal.addToCart()">Add to Cart</button>
        `;
        this.modal.style.display = 'block';
    }

    handleColorChange() {
        const colorSelect = document.getElementById('colorSelect');
        const selectedColor = colorSelect.value;
        const productImage = document.getElementById('modalProductImage');

        if (this.currentProduct && this.currentProduct.colors[selectedColor]) {
            productImage.src = this.currentProduct.colors[selectedColor].image;
            productImage.alt = `${this.currentProduct.name} in ${selectedColor}`;
        }
    }

    close() {
        this.modal.style.display = 'none';
        this.currentProduct = null;
    }

    addToCart() {
        if (!this.currentProduct) return;

        const size = document.getElementById('sizeSelect').value;
        const color = document.getElementById('colorSelect').value;
        const quantity = parseInt(document.getElementById('quantitySelect').value);

        cartService.addItem(
            this.currentProduct.id,
            size,
            color,
            quantity
        );

        this.close();
    }
}

const productModal = new ProductModal();

function closeModal() {
    productModal.close();
}
