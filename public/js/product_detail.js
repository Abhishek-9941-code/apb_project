// ══ PRODUCT DETAIL JS ══

// Quantity Change
function changeQty(delta) {
    const input = document.getElementById('qtyInput');
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
}

// Wishlist Toggle
function toggleWishlist(btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.className = 'fa-solid fa-heart';
        showToast('Added to wishlist!');
    } else {
        icon.className = 'fa-regular fa-heart';
        showToast('Removed from wishlist');
    }
}

// Related card heart toggle
function toggleHeart(el) {
    el.classList.toggle('active');
    if (el.classList.contains('fa-regular')) {
        el.classList.remove('fa-regular');
        el.classList.add('fa-solid');
    } else {
        el.classList.remove('fa-solid');
        el.classList.add('fa-regular');
    }
}

// Add to Cart
function addToCart(productId) {
    const qty = document.getElementById('qtyInput') 
        ? document.getElementById('qtyInput').value 
        : 1;

    // Replace this with your actual cart API call
    // fetch('/cart/add', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ productId, quantity: qty })
    // }).then(res => res.json()).then(data => {
    //     showToast(`${qty} item(s) added to cart!`);
    // });

    showToast(`${qty} item(s) added to cart!`);
}

// Toast Notification
function showToast(msg) {
    const toast = document.getElementById('pdToast');
    document.getElementById('pdToastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}
