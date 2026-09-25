// ================================================================
//  checkout.js — 4RTB4N STUDIO
//  Conecta al backend FastAPI en /api/create-preference
// ================================================================

const API_BASE = window.location.origin;

let shippingCost = 0;
let shippingZone = '';

// ----------------------------------------------------------------
// INIT
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (!window.cartManager) {
    console.error('CartManager no disponible');
    return;
  }

  const items = window.cartManager.getItems();
  if (items.length === 0) {
    window.location.href = 'tienda.html';
    return;
  }

  renderSummary(items);
  setupShippingOptions();
  setupForm();
  updateStepIndicator(2);
});

// ----------------------------------------------------------------
// STEP INDICATOR
// ----------------------------------------------------------------
function updateStepIndicator(step) {
  const steps = document.querySelectorAll('.step-item');
  steps.forEach((el, i) => {
    el.classList.remove('active', 'completed');
    if (i + 1 < step)  el.classList.add('completed');
    if (i + 1 === step) el.classList.add('active');
  });
}

// ----------------------------------------------------------------
// RENDER ORDER SUMMARY
// ----------------------------------------------------------------
function renderSummary(items) {
  const container = document.getElementById('summary-items');
  if (!container) return;

  container.innerHTML = items.map(item => `
    <div class="summary-item">
      <img src="assets/images/${item.image}" alt="${item.name}" onerror="this.src='assets/images/logo.png'">
      <div class="summary-item-info">
        <h4>${item.name}</h4>
        <p>${item.variant ? item.variant + ' · ' : ''}x${item.quantity}</p>
      </div>
      <div class="summary-item-price">$${(item.unitPrice * item.quantity).toLocaleString('es-MX')} MXN</div>
    </div>
  `).join('');

  updateTotals();
}

function updateTotals() {
  const subtotal = window.cartManager.getTotal();
  const total    = subtotal + shippingCost;

  const elSubtotal = document.getElementById('summary-subtotal');
  const elShipping = document.getElementById('summary-shipping');
  const elTotal    = document.getElementById('summary-total');

  if (elSubtotal) elSubtotal.innerText = `$${subtotal.toLocaleString('es-MX')} MXN`;
  if (elShipping) elShipping.innerText = shippingCost > 0
    ? `$${shippingCost.toLocaleString('es-MX')} MXN`
    : '— Selecciona metodo';
  if (elTotal) elTotal.innerText = `$${total.toLocaleString('es-MX')} MXN`;
}

// ----------------------------------------------------------------
// SHIPPING OPTIONS
// ----------------------------------------------------------------
function setupShippingOptions() {
  const options = document.querySelectorAll('.shipping-option');

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');

      const radio = opt.querySelector('input[type="radio"]');
      radio.checked = true;

      shippingCost = parseFloat(radio.value);
      shippingZone = radio.dataset.zone || 'nacional';
      updateTotals();

      const elTotal = document.getElementById('summary-total');
      if (elTotal) {
        elTotal.style.transform = 'scale(1.08)';
        setTimeout(() => { elTotal.style.transform = 'scale(1)'; }, 220);
      }
    });
  });
}

// ----------------------------------------------------------------
// FORM SUBMIT => POST /api/create-preference
// ----------------------------------------------------------------
function setupForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
    if (!shippingRadio) {
      showInlineError('Por favor selecciona un metodo de envio antes de continuar.');
      return;
    }

    const items = window.cartManager.getItems();
    if (items.length === 0) {
      showInlineError('Tu carrito esta vacio.');
      return;
    }

    const formData = new FormData(form);
    const data     = Object.fromEntries(formData.entries());

    const payload = {
      items: items.map(item => ({
        product_id: item.id,
        name:       item.name,
        variant:    item.variant || null,
        quantity:   item.quantity,
        unit_price: item.unitPrice,
        image:      item.image
      })),
      customer: {
        name:  data.name,
        email: data.email,
        phone: data.phone,
        address: {
          street:   data.address,
          colony:   data.neighborhood,
          city:     data.city,
          state:    data.state,
          zip_code: data.zip
        }
      },
      shipping: {
        zone: shippingZone || mapShippingZone(shippingCost),
        cost: shippingCost
      }
    };

    const btn = form.querySelector('.btn-mercadopago');
    const originalHTML = btn.innerHTML;
    setButtonLoading(btn, true);
    clearInlineError();

    try {
      const response = await fetch(`${API_BASE}/api/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.detail || `Error del servidor (${response.status})`;
        throw new Error(msg);
      }

      const result = await response.json();

      if (!result.init_point) {
        throw new Error('No se recibio el enlace de pago. Por favor intenta de nuevo.');
      }

      localStorage.setItem('4rtb4n_last_order', JSON.stringify({
        order_id:      result.order_id,
        total:         result.total,
        shipping_cost: result.shipping_cost,
        items:         items,
        customer_name: data.name
      }));

      window.cartManager.clear();
      updateStepIndicator(3);
      window.location.href = result.init_point;

    } catch (err) {
      console.error('[Checkout] Error:', err);
      showInlineError(err.message || 'Ocurrio un error inesperado. Por favor intenta de nuevo.');
      setButtonLoading(btn, false, originalHTML);
    }
  });
}

// ----------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------
function mapShippingZone(cost) {
  if (cost <= 50)  return 'local';
  if (cost <= 150) return 'centro';
  return 'nacional';
}

function setButtonLoading(btn, isLoading, originalHTML) {
  if (isLoading) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO PAGO...';
    btn.disabled  = true;
    btn.style.opacity = '0.8';
  } else {
    btn.innerHTML = originalHTML || 'PAGAR CON MERCADO PAGO';
    btn.disabled  = false;
    btn.style.opacity = '1';
  }
}

function showInlineError(message) {
  let errorBox = document.getElementById('checkout-error');
  if (!errorBox) {
    errorBox = document.createElement('div');
    errorBox.id = 'checkout-error';
    errorBox.className = 'checkout-error-box';
    const form = document.getElementById('checkout-form');
    form.insertBefore(errorBox, form.querySelector('.btn-mercadopago'));
  }
  errorBox.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
  errorBox.style.display = 'flex';
  errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearInlineError() {
  const errorBox = document.getElementById('checkout-error');
  if (errorBox) errorBox.style.display = 'none';
}
