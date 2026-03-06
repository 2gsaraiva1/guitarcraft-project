/*
Este módulo contém lógica auxiliar legada do builder e integração com API.
*/

const API_URL = "http://localhost:3000/api/guitars";

const form = document.getElementById("builder-form");
const guitarList = document.getElementById("builder-guitar-list");

// --------------------------------------------------
// Função: fetchGuitars
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
async function fetchGuitars() {
  // Chamada à API: comunica com o backend para sincronizar estado no frontend.
  const response = await fetch(API_URL);
  const guitars = await response.json();

  guitarList.innerHTML = "";

  guitars.forEach((guitar) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <p><strong>Body Style:</strong> ${guitar.body_style}</p>
      <p><strong>Body Material:</strong> ${guitar.body_material}</p>
      <p><strong>Body Color:</strong> ${guitar.body_color}</p>
      <p><strong>Body Finish:</strong> ${guitar.body_finish}</p>
      <p><strong>Headstock Style:</strong> ${guitar.headstock_style}</p>
      <p><strong>Neck Style:</strong> ${guitar.neck_style}</p>
      <p><strong>Neck Material:</strong> ${guitar.neck_material}</p>
      <p><strong>Fretboard Length:</strong> ${guitar.fretboard_length}</p>
      <p><strong>Fretboard Material:</strong> ${guitar.fretboard_material}</p>
      <p><strong>Pickups:</strong> ${guitar.pickups}</p>
      <p><strong>Pickup Configuration:</strong> ${guitar.pickup_configuration}</p>
      <p><strong>Bridge Style:</strong> ${guitar.bridge_style}</p>
    `;
    guitarList.appendChild(card);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newGuitar = {
    body_style: document.getElementById("body_style").value,
    body_material: document.getElementById("body_material").value,
    body_color: document.getElementById("body_color").value,
    body_finish: document.getElementById("body_finish").value,
    headstock_style: document.getElementById("headstock_style").value,
    neck_style: document.getElementById("neck_style").value,
    neck_material: document.getElementById("neck_material").value,
    fretboard_length: document.getElementById("fretboard_length").value,
    fretboard_material: document.getElementById("fretboard_material").value,
    pickups: document.getElementById("pickups").value,
    pickup_configuration: document.getElementById("pickup_configuration").value,
    bridge_style: document.getElementById("bridge_style").value
  };

  // Chamada à API: comunica com o backend para sincronizar estado no frontend.
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newGuitar)
  });

  form.reset();
  fetchGuitars();
});

fetchGuitars();
