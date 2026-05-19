let cart = [];
let pureSubTotal = 0; 

// সাইড মেনুবার ওপেন/ক্লোজ করার ফাংশন
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    menu.classList.toggle('open');
    overlay.style.display = menu.classList.contains('open') ? 'block' : 'none';
}

// শপিং কার্ট ড্রয়ার ওপেন/ক্লোজ করার ফাংশন
function toggleCartDrawer() {
    document.getElementById('cartDrawer').classList.toggle('open');
}

// কার্টের UI আপডেট করার বেসিক ফাংশন 
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

// কার্ট থেকে আইটেম রিমুভ করার ফাংশন
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function showHomePage() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileSearch() {
    alert('সার্চ অপশনটি সক্রিয় করা হচ্ছে...');
}

updateCartUI();

// প্রোডাক্ট বিস্তারিত দেখার পপ-আপ ওপেন করার ফাংশন
function previewProduct(name, price, img) {
    document.getElementById('modalTitle').innerText = name;
    document.getElementById('modalPrice').innerText = price;
    document.getElementById('modalImg').src = img;
    
    let intPrice = parseInt(price.replace(/[^0-9]/g, '')) || 1150;
    
    document.getElementById('modalBuyBtn').onclick = function() {
        addToCart(name, intPrice, img);
        closeProductModal();
    };

    document.getElementById('productModal').classList.add('show');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('show');
}

// কার্টে প্রোডাক্ট যোগ করার ফাংশন
function addToCart(name, price, img) {
    const existingIndex = cart.findIndex(item => item.name === name);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ name, price, img, qty: 1 });
    }
    updateCartUI(); 
    
    if(!document.getElementById('cartDrawer').classList.contains('open')){
        toggleCartDrawer(); 
    }
}

// =========================================
// চেকআউট ফর্ম এবং গুগল শিট সাবমিশন লজিক
// =========================================

// বাংলা নাম্বারে রূপান্তর করার ফাংশন
function convertToBangla(num) {
    const eng = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const bng = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(c => eng.includes(c) ? bng[eng.indexOf(c)] : c).join('');
}

// কার্ট থেকে 'অর্ডার করুন' বাটনে ক্লিক করলে যা হবে
function openCheckoutForm() {
    if (cart.length === 0) {
        alert('আপনার কার্ট খালি! দয়া করে প্রোডাক্ট যুক্ত করুন।');
        return;
    }
    
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('checkoutModal').classList.add('show');
    
    document.getElementById('mainFormArea').style.display = 'block';
    document.getElementById('successArea').style.display = 'none';
    
    let deliveryCharge = 130;
    let finalAmount = pureSubTotal + deliveryCharge; 
    
    document.getElementById('checkoutFinalPrice').innerText = convertToBangla(finalAmount);
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('show');
}

// ফর্ম সাবমিট করে গুগল শিটে ডেটা পাঠানো
const form = document.getElementById('orderForm');
const scriptURL = 'https://script.google.com/macros/s/AKfycbz39CSR0ZgvD5a0_6NPeN3rUx9d3uHXARTE6I6RgZmqAA6bdrJYuWwrA-m6uPw5vD0E/exec'; 

form.addEventListener('submit', e => {
    e.preventDefault(); 
    
    const btn = document.getElementById('btnSubmit');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> অপেক্ষা করুন...';
    btn.disabled = true;

    let deliveryCharge = 130;
    let totalAmount = pureSubTotal + deliveryCharge;
    
    let orderDetailsList = cart.map(item => `${item.name} (পরিমাণ: ${item.qty})`).join(", ");

    let formData = new FormData(form);
    formData.append('deliveryCharge', deliveryCharge);
    formData.append('totalAmount', totalAmount);
    formData.append('orderDetails', orderDetailsList);

    fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
        .then(response => {
            document.getElementById('mainFormArea').style.display = 'none';
            document.getElementById('successArea').style.display = 'block';
            
            cart = [];
            updateCartUI();
            form.reset(); 
            
            btn.innerHTML = originalText;
            btn.disabled = false;
        })
        .catch(error => {
            console.error('Error!', error.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
            alert('দুঃখিত, কোনো সমস্যা হয়েছে। আপনার ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।');
        });
});