// Function to fetch and display featured products
async function loadFeaturedProducts() {
    try {
        const response = await fetch('/api/products/all');
        const products = await response.json();

        const featuredContainer = document.querySelector('#featured-books .product-list .row');
        featuredContainer.innerHTML = products.map(product => `
            <div class="col-md-3">
                <div class="product-item">
                    <figure class="product-style">
                        <img src="${product.image}" alt="${product.name}" class="product-item">
                        <button type="button" class="add-to-cart" 
                            data-product-id="${product._id}" 
                            data-product-name="${product.name}" 
                            data-product-price="${product.price}" 
                            data-product-image="${product.image}">
                            Add to Cart
                        </button>
                    </figure>
                    <figcaption>
                        <h3>${product.name}</h3>
                        <span>${product.description}</span>
                        <div class="item-price">$ ${product.price.toFixed(2)}</div>
                    </figcaption>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Function to fetch and display popular products
/* async function loadPopularProducts() {
    try {
        const response = await fetch('/api/products/popular');
        const products = await response.json();

        const popularContainer = document.querySelector('#popular-books .tab-content #all-genre .row');
        popularContainer.innerHTML = products.map(product => `
            <div class="col-md-3">
                <div class="product-item">
                    <figure class="product-style">
                        <img src="${product.image}" alt="${product.name}" class="product-item">
                        <button type="button" class="add-to-cart" 
                            data-product-id="${product._id}" 
                            data-product-name="${product.name}" 
                            data-product-price="${product.price}" 
                            data-product-image="${product.image}">
                            Add to Cart
                        </button>
                    </figure>
                    <figcaption>
                        <h3>${product.name}</h3>
                        <span>${product.description}</span>
                        <div class="item-price">$ ${product.price.toFixed(2)}</div>
                    </figcaption>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading popular products:', error);
    }
} */

// Function to fetch and display special offers
/* async function loadSpecialOffers() {
    try {
        const response = await fetch('/api/products/special-offers');
        const products = await response.json();

        const specialOffersContainer = document.querySelector('#special-offer .product-grid');
        specialOffersContainer.innerHTML = products.map(product => `
            <div class="product-item">
                <figure class="product-style">
                    <img src="${product.image}" alt="${product.name}" class="product-item">
                    <button type="button" class="add-to-cart" 
                        data-product-id="${product._id}" 
                        data-product-name="${product.name}" 
                        data-product-price="${product.price}" 
                        data-product-image="${product.image}">
                        Add to Cart
                    </button>
                </figure>
                <figcaption>
                    <h3>${product.name}</h3>
                    <span>${product.description}</span>
                    <div class="item-price">
                        ${product.originalPrice ? `<span class="prev-price">$ ${product.originalPrice.toFixed(2)}</span>` : ''}
                        $ ${product.price.toFixed(2)}
                    </div>
                </figcaption>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading special offer products:', error);
    }
} */

// Event delegation for dynamically created Add to Cart buttons
document.addEventListener("DOMContentLoaded", async () => {
    await loadFeaturedProducts();

    const addToCartBtns = document.querySelectorAll(".add-to-cart");
    addToCartBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('You need to be logged in to add items to the cart.');
                window.location.href = '/login.html';
                return;
            }

            const productId = e.target.dataset.productId;
            const productName = e.target.dataset.productName;
            const productPrice = e.target.dataset.productPrice;
            const productImage = e.target.dataset.productImage;

            fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId, productId, productName, productPrice, productImage
                })
            })
            .then(response => response.json())
            .then(data => {
                alert('Product added to cart');
                updateCartBadge(data.cart);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error adding product to cart');
            });
        });
    });
});


// Function to update cart badge
function updateCartBadge(cart) {
    const cartBadge = document.querySelector("#cart-badge");
    if (cartBadge) {
        cartBadge.textContent = cart.items.length;
    }
}
