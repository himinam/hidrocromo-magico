// VARIABLES LOCALES DEL CARRITO
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ELEMENTOS REFERENCIALES DEL DOM
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const clearCartBtn = document.getElementById('clear-cart');


const priceMinInput = document.getElementById('priceMin');
const priceMaxInput = document.getElementById('priceMax');
const searchInput = document.getElementById('searchProduct');
const itemsFoundLabel = document.getElementById('items-found-count');
const productCards = document.querySelectorAll('.product-item-card');


function filtrarProductos() {
    const minPrice = parseFloat(priceMinInput.value) || 0;
    const maxPrice = parseFloat(priceMaxInput.value) || Infinity;
    const searchText = searchInput.value.toLowerCase().trim();
    
   
    const activeRadio = document.querySelector('input[name="catRadio"]:checked');
    const selectedCategory = activeRadio ? activeRadio.value : 'all';

    
    const activeEffects = [];
    if(document.getElementById('typeCromado')?.checked) activeEffects.push('cromado');
    if(document.getElementById('typeDorado')?.checked) activeEffects.push('dorado');
    if(document.getElementById('typeTornasol')?.checked) activeEffects.push('tornasol');

    let contadorVisibles = 0;

    productCards.forEach(card => {
        const pPrice = parseFloat(card.getAttribute('data-price'));
        const pName = card.getAttribute('data-name') || "";
        const pCategory = card.getAttribute('data-category');
        const pEffect = card.getAttribute('data-effect');

      
        const cumplePrecio = pPrice >= minPrice && pPrice <= maxPrice;
        const cumpleNombre = pName.includes(searchText);
        const cumpleCategoria = (selectedCategory === 'all' || pCategory === selectedCategory);
        const cumpleEfecto = activeEffects.includes(pEffect);

       
        if (cumplePrecio && cumpleNombre && cumpleCategoria && cumpleEfecto) {
            card.style.display = 'block';
            contadorVisibles++;
        } else {
            card.style.display = 'none';
        }
    });

   
    if(itemsFoundLabel) {
        itemsFoundLabel.textContent = `Mostrando ${contadorVisibles} productos`;
    }
}


if(priceMinInput) priceMinInput.addEventListener('input', filtrarProductos);
if(priceMaxInput) priceMaxInput.addEventListener('input', filtrarProductos);
if(searchInput) searchInput.addEventListener('input', filtrarProductos);

document.querySelectorAll('input[name="catRadio"]').forEach(radio => {
    radio.addEventListener('change', filtrarProductos);
});

['typeCromado', 'typeDorado', 'typeTornasol'].forEach(id => {
    const element = document.getElementById(id);
    if(element) element.addEventListener('change', filtrarProductos);
});



function actualizarInterfazCarrito() {
    const totalProductos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    if(cartCount) cartCount.textContent = totalProductos;

    if(cartItems) cartItems.innerHTML = '';
    let sumaTotal = 0;

    carrito.forEach((item, index) => {
        sumaTotal += item.price * item.cantidad;

        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center bg-dark text-white mb-2 p-3';
        li.innerHTML = `
            <div>
                <h6 class="my-0 fw-bold">${item.name}</h6>
                <small class="text-secondary">$${item.price} USD x ${item.cantidad}</small>
            </div>
            <div>
                <span class="badge bg-primary rounded-pill p-2 me-2">$${item.price * item.cantidad}</span>
                <button class="btn btn-sm btn-danger rounded-circle btn-eliminar" data-index="${index}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        if(cartItems) cartItems.appendChild(li);
    });

    if(cartTotal) cartTotal.textContent = sumaTotal;
    localStorage.setItem('carrito', JSON.stringify(carrito));
}


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-cart')) {
        const name = e.target.getAttribute('data-name');
        const price = parseFloat(e.target.getAttribute('data-price'));

        const itemExistente = carrito.find(item => item.name === name);

        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            carrito.push({ name, price, cantidad: 1 });
        }

        actualizarInterfazCarrito();
    }

    if (e.target.closest('.btn-eliminar')) {
        const button = e.target.closest('.btn-eliminar');
        const index = button.getAttribute('data-index');
        carrito.splice(index, 1);
        actualizarInterfazCarrito();
    }
});

if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
        carrito = [];
        actualizarInterfazCarrito();
    });
}

// Inicialización Automática
document.addEventListener('DOMContentLoaded', () => {
    actualizarInterfazCarrito();
    filtrarProductos(); 
});



document.addEventListener("DOMContentLoaded", () => {
    // Elementos de los filtros
    const priceMinInput = document.getElementById("priceMin");
    const priceMaxInput = document.getElementById("priceMax");
    const searchInput = document.getElementById("searchProduct");
    const container = document.getElementById("contenedor-productos");
    const itemsFoundCount = document.getElementById("items-found-count");

    const categoryRadios = document.getElementsByName("catRadio");
    const effectCheckboxes = [
        document.getElementById("typeCromado"),
        document.getElementById("typeDorado"),
        document.getElementById("typeTornasol")
    ];

    const products = Array.from(document.querySelectorAll(".product-item-card"));

    function filtrarProductos() {
        const minPrice = parseFloat(priceMinInput.value) || 0;
        const maxPrice = parseFloat(priceMaxInput.value) || Infinity;
        const searchText = searchInput.value.toLowerCase().trim();

  
        let selectedCategory = "all";
        categoryRadios.forEach(radio => {
            if (radio.checked) selectedCategory = radio.value;
        });

       
        const activeEffects = [];
        effectCheckboxes.forEach(cb => {
            if (cb && cb.checked) activeEffects.push(cb.value);
        });

        let contadorVisibles = 0;

        products.forEach(product => {
            
            const price = parseFloat(product.getAttribute("data-price"));
            const name = product.getAttribute("data-name").toLowerCase();
            const category = product.getAttribute("data-category");
            const effect = product.getAttribute("data-effect");

            // Validaciones
            const matchesPrice = price >= minPrice && price <= maxPrice;
            const matchesSearch = name.includes(searchText);
            const matchesCategory = (selectedCategory === "all" || category === selectedCategory);
            const matchesEffect = activeEffects.includes(effect);

            if (matchesPrice && matchesSearch && matchesCategory && matchesEffect) {
                product.style.display = ""; // Muestra el elemento usando sus propiedades CSS originales
                contadorVisibles++;
            } else {
                product.style.display = "none"; // Oculta la columna
            }
        });

      
        if (itemsFoundCount) {
            itemsFoundCount.textContent = `Mostrando ${contadorVisibles} producto${contadorVisibles !== 1 ? 's' : ''}`;
        }
    }

    if (priceMinInput) priceMinInput.addEventListener("input", filtrarProductos);
    if (priceMaxInput) priceMaxInput.addEventListener("input", filtrarProductos);
    if (searchInput) searchInput.addEventListener("input", filtrarProductos);

    categoryRadios.forEach(radio => {
        radio.addEventListener("change", filtrarProductos);
    });

    effectCheckboxes.forEach(cb => {
        if (cb) cb.addEventListener("change", filtrarProductos);
    });



    
    let cart = [];
    const cartCountBadge = document.getElementById("cart-count");
    const cartItemsList = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const clearCartButton = document.getElementById("clear-cart");

  
    function actualizarInterfazCarrito() {
       
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        if (cartCountBadge) cartCountBadge.textContent = totalItems;

    
        if (cartItemsList) {
            cartItemsList.innerHTML = "";

            if (cart.length === 0) {
                cartItemsList.innerHTML = `<li class="list-group-item text-center text-muted py-3">El carrito está vacío.</li>`;
            } else {
               
                cart.forEach((item, index) => {
                    const li = document.createElement("li");
                    li.className = "list-group-item d-flex justify-content-between align-items-center bg-dark text-white border-secondary";
                    li.innerHTML = `
                        <div>
                            <h6 class="my-0 fw-bold">${item.name}</h6>
                            <small class="text-secondary">$${item.price} c/u x ${item.quantity}</small>
                        </div>
                        <span class="badge bg-warning text-dark fs-6 fw-bold">$${item.price * item.quantity}</span>
                    `;
                    cartItemsList.appendChild(li);
                });
            }
        }

      
        const totalMoney = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        if (cartTotalSpan) cartTotalSpan.textContent = totalMoney.toLocaleString("es-MX");
    }

  
    if (container) {
        container.addEventListener("click", (e) => {
            if (e.target.classList.contains("add-cart")) {
                const button = e.target;
                const productName = button.getAttribute("data-name");
                const productPrice = parseFloat(button.getAttribute("data-price"));

                
                const existente = cart.find(item => item.name === productName);

                if (existente) {
                    existente.quantity += 1;
                } else {
                    cart.push({
                        name: productName,
                        price: productPrice,
                        quantity: 1
                    });
                }

                actualizarInterfazCarrito();
                
            
                button.textContent = "¡Agregado! ✓";
                button.classList.replace("btn-dark", "btn-success");
                setTimeout(() => {
                    button.textContent = "Agregar al carrito";
                    button.classList.replace("btn-success", "btn-dark");
                }, 1000);
            }
        });
    }

    // Vaciar Carrito
    if (clearCartButton) {
        clearCartButton.addEventListener("click", () => {
            cart = [];
            actualizarInterfazCarrito();
        });
    }

    
    filtrarProductos();
});