document.addEventListener("DOMContentLoaded", () => {

    const items =
    document.getElementById("checkout-items");

    const total =
    document.getElementById("checkout-total");

    const cart =
    JSON.parse(localStorage.getItem("cart")) || [];

    let suma = 0;

    cart.forEach(product => {

        suma += product.price;

        items.innerHTML += `
            <li class="list-group-item d-flex justify-content-between">
                <span>${product.name}</span>
                <strong>$${product.price}</strong>
            </li>
        `;

    });

    total.textContent =
    suma.toLocaleString();

});