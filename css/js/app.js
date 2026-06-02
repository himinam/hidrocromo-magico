// VARIABLES LOCALES DEL CARRITO
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ELEMENTOS REFERENCIALES DEL DOM
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const clearCartBtn = document.getElementById('clear-cart');

// CAPTURA DE COMPONENTES DEL FILTRO LATERAL
const priceMinInput = document.getElementById('priceMin');
const priceMaxInput = document.getElementById('priceMax');
const searchInput = document.getElementById('searchProduct');
const itemsFoundLabel = document.getElementById('items-found-count');
const productCards = document.querySelectorAll('.product-item-card');

// --- CÁCULO MÓDULO FILTRADO CRUZADO ---
function filtrarProductos() {
    const minPrice = parseFloat(priceMinInput.value) || 0;
    const maxPrice = parseFloat(priceMaxInput.value) || Infinity;
    const searchText = searchInput.value.toLowerCase().trim();
    
    // Captura de la Categoría Activa (Radio seleccionado)
    const activeRadio = document.querySelector('input[name="catRadio"]:checked');
    const selectedCategory = activeRadio ? activeRadio.value : 'all';

    // Captura de los Efectos Permitidos (Checkboxes marcados)
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

        // Evaluación de Coincidencias Matemáticas y de Criterios
        const cumplePrecio = pPrice >= minPrice && pPrice <= maxPrice;
        const cumpleNombre = pName.includes(searchText);
        const cumpleCategoria = (selectedCategory === 'all' || pCategory === selectedCategory);
        const cumpleEfecto = activeEffects.includes(pEffect);

        // Renderizado Dinámico
        if (cumplePrecio && cumpleNombre && cumpleCategoria && cumpleEfecto) {
            card.style.display = 'block';
            contadorVisibles++;
        } else {
            card.style.display = 'none';
        }
    });

    // Actualizador numérico de cantidad de productos mostrados
    if(itemsFoundLabel) {
        itemsFoundLabel.textContent = `Mostrando ${contadorVisibles} productos`;
    }
}

// Vinculación de Eventos en tiempo real para el Panel
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


// --- MÓDULO DE PERSISTENCIA DEL CARRITO ---
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

// Captura global de eventos de interacción con productos
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

// ==========================================
// 1. SISTEMA DE FILTROS EN TIEMPO REAL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Elementos de los filtros
    const priceMinInput = document.getElementById("priceMin");
    const priceMaxInput = document.getElementById("priceMax");
    const searchInput = document.getElementById("searchProduct");
    const container = document.getElementById("contenedor-productos");
    const itemsFoundCount = document.getElementById("items-found-count");

    // Radios de Categoría y Checkboxes de Efectos
    const categoryRadios = document.getElementsByName("catRadio");
    const effectCheckboxes = [
        document.getElementById("typeCromado"),
        document.getElementById("typeDorado"),
        document.getElementById("typeTornasol")
    ];

    // Colección de todas las tarjetas de producto
    const products = Array.from(document.querySelectorAll(".product-item-card"));

    // Función principal para filtrar los elementos
    function filtrarProductos() {
        const minPrice = parseFloat(priceMinInput.value) || 0;
        const maxPrice = parseFloat(priceMaxInput.value) || Infinity;
        const searchText = searchInput.value.toLowerCase().trim();

        // Obtener la categoría seleccionada
        let selectedCategory = "all";
        categoryRadios.forEach(radio => {
            if (radio.checked) selectedCategory = radio.value;
        });

        // Obtener los efectos activos
        const activeEffects = [];
        effectCheckboxes.forEach(cb => {
            if (cb && cb.checked) activeEffects.push(cb.value);
        });

        let contadorVisibles = 0;

        products.forEach(product => {
            // Extraer atributos data de la tarjeta
            const price = parseFloat(product.getAttribute("data-price"));
            const name = product.getAttribute("data-name").toLowerCase();
            const category = product.getAttribute("data-category");
            const effect = product.getAttribute("data-effect");

            // Validaciones
            const matchesPrice = price >= minPrice && price <= maxPrice;
            const matchesSearch = name.includes(searchText);
            const matchesCategory = (selectedCategory === "all" || category === selectedCategory);
            const matchesEffect = activeEffects.includes(effect);

            // Si cumple con todos los filtros, se muestra; si no, se oculta
            if (matchesPrice && matchesSearch && matchesCategory && matchesEffect) {
                product.style.display = ""; // Muestra el elemento usando sus propiedades CSS originales
                contadorVisibles++;
            } else {
                product.style.display = "none"; // Oculta la columna
            }
        });

        // Actualizar el contador visual de productos encontrados
        if (itemsFoundCount) {
            itemsFoundCount.textContent = `Mostrando ${contadorVisibles} producto${contadorVisibles !== 1 ? 's' : ''}`;
        }
    }

    // Escuchar eventos en los inputs para ejecutar el filtro al instante
    if (priceMinInput) priceMinInput.addEventListener("input", filtrarProductos);
    if (priceMaxInput) priceMaxInput.addEventListener("input", filtrarProductos);
    if (searchInput) searchInput.addEventListener("input", filtrarProductos);

    categoryRadios.forEach(radio => {
        radio.addEventListener("change", filtrarProductos);
    });

    effectCheckboxes.forEach(cb => {
        if (cb) cb.addEventListener("change", filtrarProductos);
    });


    // ==========================================
    // 2. SISTEMA INTERNO DEL CARRITO DE COMPRAS
    // ==========================================
    
    let cart = [];
    const cartCountBadge = document.getElementById("cart-count");
    const cartItemsList = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const clearCartButton = document.getElementById("clear-cart");

    // Función para actualizar la interfaz del carrito modal
    function actualizarInterfazCarrito() {
        // Actualizar contador del Navbar
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        if (cartCountBadge) cartCountBadge.textContent = totalItems;

        // Limpiar lista visual del modal
        if (cartItemsList) {
            cartItemsList.innerHTML = "";

            if (cart.length === 0) {
                cartItemsList.innerHTML = `<li class="list-group-item text-center text-muted py-3">El carrito está vacío.</li>`;
            } else {
                // Renderizar los elementos agregados
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

        // Calcular y renderizar el precio total final
        const totalMoney = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        if (cartTotalSpan) cartTotalSpan.textContent = totalMoney.toLocaleString("es-MX");
    }

    // Escuchar clics en los botones "Agregar al carrito"
    if (container) {
        container.addEventListener("click", (e) => {
            if (e.target.classList.contains("add-cart")) {
                const button = e.target;
                const productName = button.getAttribute("data-name");
                const productPrice = parseFloat(button.getAttribute("data-price"));

                // Verificar si el producto ya existe en el arreglo del carrito
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
                
                // Efecto visual rápido en el botón al presionar
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

    // Ejecución inicial por si acaso
    filtrarProductos();
});