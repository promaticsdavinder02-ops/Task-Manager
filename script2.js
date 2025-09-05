const boardsContainer = document.getElementById("boardsContainer");
const totalBoardsEl = document.getElementById("totalBoards");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

const addBoardBtn = document.getElementById("addBoardBtn");
const addBoardModal = document.getElementById("addBoardModal");
const closeModal = document.getElementById("closeModal");
const saveBoardBtn = document.getElementById("saveBoardBtn");
const boardNameInput = document.getElementById("boardNameInput");

let boards = [];
let currentPage = 1;
const limit = 8;
const API_URL = "http://localhost:3000/api/boards";
const JWT_TOKEN = "";

async function fetchBoards() {
  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${JWT_TOKEN}` },
    });

    if (!res.ok) throw new Error("Failed to fetch boards");

    const data = await res.json();
    boards = data.boards;
    totalBoardsEl.textContent = data.totalBoards;

    renderBoards();
  } catch (err) {
    console.error(err);
    boardsContainer.innerHTML = `<p style="color:red;">Error loading boards</p>`;
  }
}


function renderBoards() {
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    const boardsToShow = boards.slice(start, end);

    boardsContainer.innerHTML = boardsToShow.map(board => `
        <div class="board-card" onclick="window.location.href='board2.html?id=${board._id}'">
        <h3>${board.board_name}</h3>
        <small>Lists: ${board.lists.length}</small><br>
        <small>Task: ${board.lists.reduce((acc, list) => acc + list.tasks.length, 0)}</small>
        </div>
        `).join("");

    pageInfo.textContent = `Page${currentPage} of ${Math.ceil(boards.length/limit)}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage >= Math.ceil(boards.length/ limit);
}

//Pagination events
prevPageBtn.addEventListener("click", () => {
    if(currentPage > 1){
        currentPage--;
        renderBoards();
    }
});

nextPageBtn.addEventListener("click", () => {
    if(currentPage < Math.ceil(boards.length / limit)){
        currentPage++;
        renderBoards();
    }
});

//Open modal
addBoardBtn.addEventListener("click", () => {
    addBoardModal.style.display = "flex";
});

//Close modal
closeModal.addEventListener("click", () => {
    addBoardModal.style.display = "none";
});

//Save new board
saveBoardBtn.addEventListener("click", async()=>{
    const boardName = boardNameInput.value.trim();
    if(!boardName){
        alert("Board name cannot be empty!");
        return;
    }

    try{
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JWT_TOKEN}`
            },
            body: JSON.stringify({board_name: boardName})
        });

        const data = await res.json();

        if(!res.ok){
            alert(data || "Error creating board");
            return;
        }

        alert("Board created successfully!");
        boardNameInput.value = "";
        addBoardModal.style.display = "none";

        fetchBoards();
    }catch(error){
        console.error(error);
        alert("Failed to create board");
    }
});

window.addEventListener("click", (e) => {
    if (e.target === addBoardModal){
        addBoardModal.style.display = "none";
    }
});

fetchBoards();
