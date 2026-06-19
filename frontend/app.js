console.log("app.js loaded");

const itemInput = document.getElementById("itemInput");
const quantityInput = document.getElementById("quantityInput");
const addBtn = document.getElementById("addBtn");
const shoppingList = document.getElementById("shoppingList");

const API_URL = "http://localhost:3000";

async function loadItems() {
  try {
    const response = await fetch(`${API_URL}/items`);
    const items = await response.json();

    shoppingList.innerHTML = "";

    items.forEach((item) => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.classList.add("item-text");
      span.textContent = `${item.name} (${item.quantity})`;

      if (item.bought) {
        span.classList.add("bought");
      }

      const actions = document.createElement("div");
      actions.classList.add("actions");

      const buyBtn = document.createElement("button");
      buyBtn.textContent = "Bought";
      buyBtn.classList.add("buy-btn");
      buyBtn.addEventListener("click", async () => {
        await fetch(`${API_URL}/items/${item.id}`, {
          method: "PUT"
        });
        loadItems();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.addEventListener("click", async () => {
        await fetch(`${API_URL}/items/${item.id}`, {
          method: "DELETE"
        });
        loadItems();
      });

      actions.appendChild(buyBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(span);
      li.appendChild(actions);

      shoppingList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading items:", error);
  }
}

addBtn.addEventListener("click", async () => {
  console.log("Add clicked");

  const name = itemInput.value.trim();
  const quantity = quantityInput.value.trim();

  if (!name || !quantity) {
    alert("Please enter item name and quantity.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, quantity: Number(quantity) })
    });

    const data = await response.json();
    console.log("Item added:", data);

    itemInput.value = "";
    quantityInput.value = "";

    loadItems();
  } catch (error) {
    console.error("Error adding item:", error);
  }
});

loadItems();