// 1. Product data
const products = [
    {
        id: 1,
        name: "Wireless Headphone",
        price: 2500,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 3500,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
    },
    {
        id: 3,
        name: "Running Shoes",
        price: 4200,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
    },
    {
        id: 4,
        name: "Camera",
        price: 15000,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"
    }
];

// 2. Select HTML elements
const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const checkoutModal = document.getElementById("checkout-modal");
const checkoutForm = document.getElementById("checkout-form");

// Load cart from LocalStorage (safe against corrupted data)
let cart = [];
try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
} catch (e) {
    cart = [];
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Toast notification
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

// 3. Display products
function displayProducts(productArray) {

    if (productArray.length === 0) {
        productList.innerHTML = "<p>No products found!</p>";
        return;
    }

    productList.innerHTML = productArray.map(product => `
        <div class="product-card">

            <img src="${product.image}" alt="${product.name}">

            <h3>${product.name}</h3>

            <p>৳ ${product.price}</p>

            <button data-add="${product.id}">
                Add to Cart
            </button>

            <button data-details="${product.id}">
                View Details
            </button>
        </div>
    `).join("");
}

// 3b. Product details modal
function showProductDetails(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) return;

    const modal = document.getElementById("product-modal");
    const modalDetails = document.getElementById("modal-details");

    modalDetails.innerHTML = `
        <img src="${product.image}" alt="${product.name}">

        <h2>${product.name}</h2>

        <p>Price: ৳ ${product.price}</p>

        <p>Category: ${product.category}</p>

        <button data-add="${product.id}">
            Add to Cart
        </button>

        <button data-close-modal>
            Close
        </button>
    `;

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("product-modal").style.display = "none";
}

// 4. Search, category filter and sort
function filterProducts() {

    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortValue = sortSelect.value;

    const filteredProducts = products.filter(product => {

        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (sortValue === "price-asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === "price-desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === "name-asc") {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    displayProducts(filteredProducts);
}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
sortSelect.addEventListener("change", filterProducts);

// 5. Add product to cart
function addToCart(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    displayCart();
    showToast(product.name + " added to cart ✓");
}

// 6. Display cart
function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function displayCart() {

    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const navCartCount = document.getElementById("nav-cart-count");
    const cartTotal = document.getElementById("cart-total");

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty!</p>";
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">

                <span>${item.name}</span>
                <span>৳ ${item.price}</span>

                <button data-decrease="${item.id}">−</button>

                <span>${item.quantity}</span>

                <button data-increase="${item.id}">+</button>

                <button data-remove="${item.id}">
                    Remove
                </button>

            </div>
        `).join("");
    }

    cartCount.textContent = totalItems;
    navCartCount.textContent = totalItems;
    cartTotal.textContent = getCartTotal();
}

function clearCart() {
    cart = [];
    saveCart();
    displayCart();
}

// 7. Checkout
function openCheckout() {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    document.getElementById("checkout-total").textContent = getCartTotal();
    checkoutModal.style.display = "flex";
}

function closeCheckout() {
    checkoutModal.style.display = "none";
}

function setError(fieldId, message) {
    document.getElementById(fieldId + "-error").textContent = message;
}

function validateCheckout() {
    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const address = document.getElementById("customer-address").value.trim();

    let valid = true;

    setError("customer-name", "");
    setError("customer-phone", "");
    setError("customer-address", "");

    if (name.length < 3) {
        setError("customer-name", "Name must be at least 3 characters.");
        valid = false;
    }

    // Bangladeshi mobile number: 01XXXXXXXXX (11 digits)
    if (!/^01[3-9]\d{8}$/.test(phone)) {
        setError("customer-phone", "Enter a valid number like 01712345678.");
        valid = false;
    }

    if (address.length < 10) {
        setError("customer-address", "Address must be at least 10 characters.");
        valid = false;
    }

    return valid;
}

checkoutForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateCheckout()) return;

    const name = document.getElementById("customer-name").value.trim();

    clearCart();
    checkoutForm.reset();
    closeCheckout();
    showToast("Thank you, " + name + "! Your order is placed ✓");
});

// 8. Handle all button clicks
document.addEventListener("click", function (event) {

    const addButton = event.target.closest("[data-add]");
    const removeButton = event.target.closest("[data-remove]");
    const increaseButton = event.target.closest("[data-increase]");
    const decreaseButton = event.target.closest("[data-decrease]");
    const detailsButton = event.target.closest("[data-details]");
    const closeModalButton = event.target.closest("[data-close-modal]");
    const closeCheckoutButton = event.target.closest("[data-close-checkout]");

    if (detailsButton) {
        showProductDetails(Number(detailsButton.dataset.details));
    }

    // Close modals: Close button, × or click on dark background
    if (closeModalButton || event.target.id === "product-modal") {
        closeModal();
    }

    if (closeCheckoutButton || event.target.id === "checkout-modal") {
        closeCheckout();
    }

    if (event.target.id === "clear-cart") {
        clearCart();
    }

    if (event.target.id === "checkout-btn") {
        openCheckout();
    }

    if (addButton) {
        addToCart(Number(addButton.dataset.add));
    }

    if (increaseButton) {
        const id = Number(increaseButton.dataset.increase);
        const item = cart.find(p => p.id === id);

        if (item) {
            item.quantity++;
        }

        saveCart();
        displayCart();
    }

    if (decreaseButton) {
        const id = Number(decreaseButton.dataset.decrease);
        const item = cart.find(p => p.id === id);

        if (item) {
            item.quantity--;

            if (item.quantity <= 0) {
                cart = cart.filter(p => p.id !== id);
            }
        }

        saveCart();
        displayCart();
    }

    if (removeButton) {
        const id = Number(removeButton.dataset.remove);

        cart = cart.filter(p => p.id !== id);

        saveCart();
        displayCart();
    }
});

// Press Escape to close any open modal
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal();
        closeCheckout();
    }
});

// 9. Initial display
displayProducts(products);
displayCart();
