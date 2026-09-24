document.addEventListener('DOMContentLoaded', () => {
  if (!window.cartManager) return;
  
  const items = window.cartManager.getItems();
  if (items.length === 0) {
    window.location.href = 'tienda.html';
    return;
  }

  renderSummary(items);
  setupShippingOptions();
  setupForm();
});

let shippingCost = 0;

function renderSummary(items) {
  const container = document.getElementById('summary-items');
  if (!container) return;
  
  container.innerHTML = items.map(item => \`
    <div class="summary-item">
      <img src="assets/images/\${item.image}" alt="\${item.name}" onerror="this.src='assets/images/logo.png'">
      <div class="summary-item-info">
        <h4>\${item.name}</h4>
        <p>\${item.variant} x \${item.quantity}</p>
      </div>
      <div class="summary-item-price">$\${(item.unitPrice * item.quantity).toLocaleString('es-MX')}</div>
    </div>
  \`).join('');

  updateTotals();
}

function updateTotals() {
  const subtotal = window.cartManager.getTotal();
  const total = subtotal + shippingCost;
  
  document.getElementById('summary-subtotal').innerText = \`$\${subtotal.toLocaleString('es-MX')}\`;
  document.getElementById('summary-shipping').innerText = \`$\${shippingCost.toLocaleString('es-MX')}\`;
  document.getElementById('summary-total').innerText = \`$\${total.toLocaleString('es-MX')}\`;
}

function setupShippingOptions() {
  const options = document.querySelectorAll('.shipping-option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      // Remove selected class
      options.forEach(o => o.classList.remove('selected'));
      // Add selected class
      opt.classList.add('selected');
      // Check the radio
      const radio = opt.querySelector('input[type="radio"]');
      radio.checked = true;
      // Update cost
      shippingCost = parseInt(radio.value);
      updateTotals();
    });
  });
}

function setupForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check shipping selected
    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
    if (!shippingRadio) {
      window.cartManager.showToast('Por favor selecciona un método de envío');
      return;
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const payload = {
      customer: data,
      items: window.cartManager.getItems(),
      shipping: {
        type: shippingRadio.dataset.name,
        cost: shippingCost
      }
    };
    
    // Simulate API call
    const btn = form.querySelector('.btn-mercadopago');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
    btn.disabled = true;
    
    setTimeout(() => {
      // In reality, this would redirect to MP init_point
      // window.location.href = response.init_point;
      
      window.cartManager.clear();
      alert('Simulación: Redirigiendo a Mercado Pago...');
      window.location.href = 'tienda.html';
      
    }, 1500);
  });
}
