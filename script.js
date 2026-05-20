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

// ৩. কার্ট এবং টোস্ট ফাংশন (একাধিকবার যোগ করা যাবে)
function addToCart(name, price, img) {
    const existingIndex = cart.findIndex(item => item.name === name);
    if (existingIndex > -1) {
        // আগে থেকেই থাকলে পরিমাণ (Quantity) বাড়বে
        cart[existingIndex].qty += 1;
    } else {
        // না থাকলে নতুন করে কার্টে যোগ হবে
        cart.push({ name, price, img, qty: 1 });
    }
    updateCartUI();
    showCartToast(); // স্মুথভাবে টোস্ট মেসেজ দেখাবে
}

function showCartToast() {
    const toast = document.getElementById('cartToast');
    toast.classList.add('show-toast');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show-toast');
    }, 1500);
}

// চেকআউটের জন্য সম্পূর্ণ আলাদা একটি লিস্ট ভেরিয়েবল
let checkoutItems = [];

// ৪. চেকআউট লজিক (সরাসরি কিনুন - মেইন কার্টে যোগ হবে না)
function buyNow(name, price, img) {
    // এখানে মেইন কার্টে (cart) কোনো ডাটা পুশ করা হচ্ছে না
    // শুধুমাত্র ফর্মের জন্য সাময়িকভাবে আইটেমটি সেভ করা হচ্ছে
    checkoutItems = [{ name, price, img, qty: 1 }];
    
    // কার্ট ড্রয়ার বন্ধ রাখা
    document.getElementById('cartDrawer').classList.remove('open');
    
    // 'direct' মোডে পপ-আপ ওপেন করা
    openCheckoutForm('direct');
}

// চেকআউট ফর্ম ওপেন করার ফাংশন
function openCheckoutForm(mode = 'cart') {
    // যদি কার্ট থেকে ওপেন করা হয়, তাহলে কার্টের আইটেমগুলো ফর্মে আসবে
    if (mode === 'cart') {
        if (cart.length === 0) {
            alert('আপনার কার্ট খালি!');
            return;
        }
        // মেইন কার্টের ডাটাগুলো চেকআউটের লিস্টে কপি করে আনা হচ্ছে
        checkoutItems = JSON.parse(JSON.stringify(cart));
    }
    
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    document.getElementById('mainFormArea').style.display = 'block';
    document.getElementById('successArea').style.display = 'none';
    
    // প্রোডাক্ট লিস্ট এবং দাম রেন্ডার করা
    renderCheckoutItems();
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 400);
}

// চেকআউট ফর্মে প্রোডাক্ট দেখানোর ফাংশন
function renderCheckoutItems() {
    const listContainer = document.getElementById('checkoutItemsList');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    
    checkoutItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checkout-item';
        itemDiv.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="checkout-item-img">
            <div class="checkout-item-details">
                <div class="checkout-item-title">${item.name}</div>
                <div class="checkout-item-price">৳${item.price}</div>
                <div class="checkout-qty-wrapper">
                    <span class="qty-label">Quantity:</span>
                    <div class="qty-control">
                        <button type="button" class="qty-btn" onclick="updateCheckoutQty(${index}, -1)">-</button>
                        <input type="text" class="qty-input" value="${item.qty}" readonly>
                        <button type="button" class="qty-btn" onclick="updateCheckoutQty(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
        `;
        listContainer.appendChild(itemDiv);
    });
    
    updateCheckoutTotal();
}

// ফর্মে প্রোডাক্টের পরিমাণ কমানো/বাড়ানোর ফাংশন
function updateCheckoutQty(index, change) {
    checkoutItems[index].qty += change;
    
    if (checkoutItems[index].qty < 1) {
        checkoutItems.splice(index, 1);
    }
    
    if (checkoutItems.length === 0) {
        closeCheckoutModal(); 
    } else {
        renderCheckoutItems(); 
    }
}

// ফর্মে মোট দাম হিসাব করার ফাংশন
function updateCheckoutTotal() {
    const deliveryCharge = 130; 
    let checkoutSubTotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = checkoutSubTotal + deliveryCharge;
    document.getElementById('checkoutFinalPrice').innerText = total;
}

// ৫. ফর্ম সাবমিশন
const form = document.getElementById('orderForm');
const scriptURL = 'https://script.google.com/macros/s/AKfycby5p2la1cx3_SjqUGvFGQI3T_EF3ZvjpR9IEIdW3twK9xoiDr7jC02mSSGDaMsMi8Id/exec';

form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> অপেক্ষা করুন...';
    btn.disabled = true;

    // চেকআউট লিস্ট থেকে মোট দাম এবং আইটেম বের করা
    let checkoutSubTotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let formData = new FormData(form);
    formData.append('deliveryCharge', 130);
    formData.append('totalAmount', checkoutSubTotal + 130);
    formData.append('orderDetails', checkoutItems.map(item => `${item.name} (${item.qty})`).join(", "));

    fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
        .then(() => {
            document.getElementById('mainFormArea').style.display = 'none';
            document.getElementById('successArea').style.display = 'block';
            
            // অর্ডার সফল হলে মেইন কার্টও ক্লিয়ার করে দেওয়া হলো
            cart = []; 
            updateCartUI();
            
            checkoutItems = []; // চেকআউট আইটেম ক্লিয়ার
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