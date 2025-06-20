//  LocalStorage helpers
function saveCartToStorage() {
  localStorage.setItem('myCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  const savedCart = localStorage.getItem('myCart');
  if (savedCart) {
    const parsedCart = JSON.parse(savedCart);
    for (let key in parsedCart) {
      cart[key] = parsedCart[key];
    }
    updateCartUI();
  }
}

const cart = {};

function updateCartUI() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalContainer = document.getElementById('cart-total');
  cartItemsContainer.innerHTML = '';
  cartTotalContainer.innerHTML = '';

  let grandTotal = 0;

  for (let key in cart) {
    const item = cart[key];
    const totalPrice = item.price * item.quantity;
    grandTotal += totalPrice;

    const row = document.createElement('div');
    row.className = 'row align-items-center py-2 border-bottom text-center';

    row.innerHTML = `
  <div class="col-6 col-md-5 col-sm-3 text-start d-flex align-items-center gap-2 mb-2 mb-md-0">
    <img src="${item.img}" alt="${item.name}" class="product-image rounded" height="40" width="30">
    <span class="small">${item.name} (${item.size})</span>
  </div>
  <div class="col-6 col-md-2 d-flex justify-content-center align-items-center gap-2 mb-2 mb-md-0">
    <button class="btn btn-sm btn-outline-danger change-qty" data-key="${key}">-</button>
    <span class="small">${item.quantity}</span>
    <button class="btn btn-sm btn-outline-primary change-qty" data-key="${key}">+</button>
  </div>
  <div class="col-6 col-md-2 mb-2 mb-md-0 small">$${item.price.toFixed(2)}</div>
  <div class="col-6 col-md-3 small">$${totalPrice.toFixed(2)}</div>
`;



    cartItemsContainer.appendChild(row);
  }

  // Add Grand Total
  cartTotalContainer.innerHTML = `Total: $${grandTotal.toFixed(2)}`;

  // After building UI, re-attach event listeners to change-qty buttons:
  document.querySelectorAll('.change-qty').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.key;
      const delta = button.textContent === '+' ? 1 : -1;
      changeQty(key, delta);
    });
  });

  // Save cart to localStorage
  saveCartToStorage();
}

function changeQty(key, delta) {
  if (!cart[key]) return;
  cart[key].quantity += delta;
  if (cart[key].quantity <= 0) {
    delete cart[key];
  }
  updateCartUI();
}

document.addEventListener('DOMContentLoaded', function () {

  //  DROPDOWN LOGIC
  const dropdownItems = document.querySelectorAll('.dropdown-item');

  dropdownItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();

      const selectedPrice = this.getAttribute('data-price');
      const selectedSize = this.getAttribute('data-size');

      const card = this.closest('.card');
      const dropdownToggle = card.querySelector('.dropdown-toggle');
      dropdownToggle.textContent = `${selectedSize} - $${selectedPrice}`;

      const addToCartBtn = card.querySelector('.add-to-cart');
      addToCartBtn.setAttribute('data-price', selectedPrice);
      addToCartBtn.setAttribute('data-size', selectedSize);
      addToCartBtn.disabled = false;
    });
  });

  // ADD TO CART BUTTON LOGIC
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.name;
      const size = button.dataset.size;
      const price = parseFloat(button.dataset.price);
      const card = button.closest('.card');
      const img = card.querySelector('.card-img-top').getAttribute('src');

      const key = `${name} - ${size}`;

      if (!cart[key]) {
        cart[key] = { name, size, quantity: 1, price, img };
      } else {
        cart[key].quantity += 1;
      }

      updateCartUI();
    });
  });

  //  CLEAR CART BUTTON
  document.getElementById('clear-cart').addEventListener('click', () => {
    for (let key in cart) {
      delete cart[key];
    }
    updateCartUI();
  });

  //  CHECKOUT BUTTON (save to orderHistory)
  document.getElementById('checkout-cart').addEventListener('click', () => {
    if (Object.keys(cart).length === 0) {
      alert('Your cart is empty!');
      return;
    }

    let summary = 'You are checking out:\n';
    for (let key in cart) {
      const item = cart[key];
      summary += `${item.name} (${item.size}) x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}\n`;
    }

    summary += `\nTotal: $${Object.values(cart).reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}`;

    alert(summary);

    //  Save checkout to orderHistory:
    let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];

    const newOrder = {
      date: new Date().toLocaleString(),
      order: JSON.parse(JSON.stringify(cart)) // deep copy of cart
    };

    orderHistory.push(newOrder);

    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

    // Clear current cart
    for (let key in cart) {
      delete cart[key];
    }
    updateCartUI();
  });

  // Load cart on page load
  loadCartFromStorage();
});
