const listsContainer = document.getElementById("listsContainer");
const boardNameEl = document.getElementById("boardName");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

const API_URL = "http://localhost:3000/api/boards";
const LIST_API_URL = "http://localhost:3000/api/lists";
const JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjJhMjJjZDFjOTc3N2Y0MTczYWZjYyIsImlhdCI6MTc1NzA0NTU0NSwiZXhwIjoxNzU3NDc3NTQ1fQ.pKE4MvRxre2BOVaomJoeLALj0p9nQZdS3EDa_zp5vMk";

let boardId;
let lists = [];
let currentPage = 1;
const limit = 8;
let isReordering = false;

const urlParams = new URLSearchParams(window.location.search);
boardId = urlParams.get("id");

async function fetchBoard() {
  try {
    const res = await fetch(`${API_URL}/${boardId}`, {
      headers: { Authorization: `Bearer ${JWT_TOKEN}` },
    });
    if (!res.ok) throw new Error("Failed to fetch board");

    const data = await res.json();
    if (!data || data.length === 0) {
      boardNameEl.textContent = "Board not found";
      return;
    }

    const board = data[0];
    boardNameEl.textContent = board.board_name;
    lists = board.lists || [];

    renderLists();
  } catch (err) {
    console.error(err);
    listsContainer.innerHTML = `<p style="color:red;">Error loading board</p>`;
  }
}

function renderLists() {
  const start = (currentPage - 1) * limit;
  const end = start + limit;
  const listsToShow = lists.slice(start, end);

  listsContainer.innerHTML = listsToShow
    .map(
      (list) => `
        <div class="list-card" draggable="true" data-id="${String(list._id)}">
        <h2>${list.list_name || "Untitled List"}</h2>
        </div>
        `
    )
    .join("");

  pageInfo.textContent = `Page ${currentPage} of ${Math.max(
    1,
    Math.ceil(lists.length / limit)
  )}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage >= Math.ceil(lists.length / limit);

  enableDragDrop();
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderLists();
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < Math.ceil(lists.length / limit)) {
    currentPage++;
    renderLists();
  }
});

let draggedId = null;
let draggedIndex = null;

function enableDragDrop() {
  const listCards = document.querySelectorAll(".list-card");

  listCards.forEach((card, index) => {
    const globalIndex = (currentPage - 1) * limit + index;

    card.addEventListener("dragstart", (e) => {
      draggedId = e.target.dataset.id;
      draggedIndex = globalIndex;
      e.dataTransfer.effectAllowed = "move";
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    card.addEventListener("drop", async (e) => {
      e.preventDefault();
      const targetCard = e.target.closest(".list-card");
      if (!targetCard) return;

      const targetId = targetCard.dataset.id;
      const targetIndex = lists.findIndex((l) => l._id === targetId);

      if (targetIndex === -1 || draggedIndex === targetIndex) return;

      const [draggedItem] = lists.splice(draggedIndex, 1);
      lists.splice(targetIndex, 0, draggedItem);

      renderLists();
      try {
        const res = await fetch(`${LIST_API_URL}/${draggedId}/reorder`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_TOKEN}`,
          },
          body: JSON.stringify({ reorder_list: targetIndex + 1 }),
        });

        const data = await res.json();
        if(!res.ok){
            console.error("Reorder failed:", data);
            alert("Failed to save reorder");
        }else{
            console.log("Reorder success:", data);
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
}

fetchBoard();