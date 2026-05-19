let cart = [];
let pureSubTotal = 0; 
let toastTimeout; 

// ১. মেনু এবং কার্ট ড্রয়ার
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    menu.classList.toggle('open');
    overlay.style.display = menu.classList.contains('open') ? 'block' : 'none';
}

function toggleCartDrawer() {
    document.getElementById('cartDrawer').classList.toggle('open');
}

// ২. কার্ট UI আপডেট
function updateCartUI() {
    const body = document.getElementById('cartItemsBody');
    const mainBadge = document.getElementById('mainCartBadge');
    const mobileBadge = document.getElementById('mobileCartBadge');
    const totalAmountText = document.getElementById('cartTotalAmount');

    if (cart.length === 0) {
        body.innerHTML = '<div class="empty-cart-msg">কার্ট বর্তমানে খালি আছে।</div>';
        mainBadge.style.display = 'none';
        mobileBadge.style.display = 'none';
        totalAmountText.innerText = '৳০';
        pureSubTotal = 0;
        return;
    }

    let totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    mainBadge.innerText = totalItems;
    mainBadge.style.display = 'flex';
    mobileBadge.innerText = totalItems;
    mobileBadge.style.display = 'flex';

    body.innerHTML = '';
    pureSubTotal = 0;

    cart.forEach((item, index) => {
        let rowTotal = item.price * item.qty;
        pureSubTotal += rowTotal;
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <img src="${item.img}" alt="">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-details">${item.qty} x ৳${item.price} = ৳${rowTotal}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash-can"></i></button>
        `;
        body.appendChild(row);
    });
    totalAmountText.innerText = '৳' + pureSubTotal;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function showHomePage() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ৩. কার্ট এবং টোস্ট ফাংশন
function addToCart(name, price, img) {
    const existingIndex = cart.findIndex(item => item.name === name);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ name, price, img, qty: 1 });
    }
    updateCartUI();
    showCartToast();
}

function showCartToast() {
    const toast = document.getElementById('cartToast');
    toast.classList.add('show-toast');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show-toast');
    }, 1500);
}

// ৪. চেকআউট লজিক (সংশোধিত)
function buyNow(name, price, img) {
    const existingIndex = cart.findIndex(item => item.name === name);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ name, price, img, qty: 1 });
    }
    updateCartUI();
    document.getElementById('cartDrawer').classList.remove('open');
    openCheckoutForm();
}

function openCheckoutForm() {
    if (cart.length === 0) {
        alert('আপনার কার্ট খালি!');
        return;
    }
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    // ছোট ডিলে যাতে ট্রানজিশন স্মুথ হয়
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    document.getElementById('mainFormArea').style.display = 'block';
    document.getElementById('successArea').style.display = 'none';
    document.getElementById('checkoutFinalPrice').innerText = pureSubTotal + 130;
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('show');
    // অ্যানিমেশন শেষ হওয়ার পর display: none করা
    setTimeout(() => {
        modal.style.display = 'none';
    }, 400);
}

// ৫. ফর্ম সাবমিশন
const form = document.getElementById('orderForm');
const scriptURL = 'https://script.google.com/macros/s/AKfycbz39CSR0ZgvD5a0_6NPeN3rUx9d3uHXARTE6I6RgZmqAA6bdrJYuWwrA-m6uPw5vD0E/exec';

form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> অপেক্ষা করুন...';
    btn.disabled = true;

    let formData = new FormData(form);
    formData.append('deliveryCharge', 130);
    formData.append('totalAmount', pureSubTotal + 130);
    formData.append('orderDetails', cart.map(item => `${item.name} (${item.qty})`).join(", "));

    fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
        .then(() => {
            document.getElementById('mainFormArea').style.display = 'none';
            document.getElementById('successArea').style.display = 'block';
            cart = [];
            updateCartUI();
            form.reset();
            btn.innerHTML = 'অর্ডার কনফার্ম করুন <i class="fa-solid fa-arrow-right"></i>';
            btn.disabled = false;
        })
        .catch(() => {
            alert('দুঃখিত, সমস্যা হয়েছে।');
            btn.disabled = false;
        });
});

updateCartUI();