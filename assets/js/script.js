// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  // Calculate deadline status
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  // Add class for "Done" tasks
  let doneClass = task.status === "done" ? "done-task" : "";

  // Determine class based on due date
  let dueDateClass = "";
  if (daysUntilDue < 0) {
    dueDateClass = "overdue-task";
  } else if (daysUntilDue <= 3) {
    dueDateClass = "nearing-deadline-task";
  }

  // Create task card with color-coded deadline and "Done" class
  const card = $(`
    <div class="card border-dark mb-3 task-card ${doneClass} ${dueDateClass}" id="task-${task.id}">
      <div class="card-header">${task.name}</div>
      <div class="card-body">
        <p class="card-text">${task.description}</p>
        <p class="card-text"><strong>Due Date:</strong> ${task.dueDate}</p>
        <button class="btn btn-danger delete-btn" data-task-id="${task.id}">Delete</button>
      </div>
    </div>
  `);
  card.find(".delete-btn").click(handleDeleteTask);
  return card;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach((task) => {
    const card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });

  // Make cards draggable
  $(".task-card").draggable({
    revert: function (dropped) {
      if (!dropped) {
        return true; // Revert if not dropped onto a droppable zone
      } else {
        return false; // Don't revert if dropped onto a droppable zone
      }
    },
    stack: ".task-card",
    cursor: "move",
    containment: "document",
    helper: "clone",
  });

  // Make columns droppable
  $(".lane").droppable({
    accept: ".task-card",
    drop: function (event, ui) {
      handleDrop(event, ui);
    },
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const taskName = $("#taskName").val();
  const taskDescription = $("#taskDescription").val();
  const dueDate = $("#dueDate").val();

  const newTask = {
    id: generateTaskId(),
    name: taskName,
    description: taskDescription,
    dueDate: dueDate,
    status: "todo", // Default status is 'todo'
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", nextId);

  renderTaskList();
  $("#formModal").modal("hide");
  $("#taskForm")[0].reset();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).data("task-id");
  taskList = taskList.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new progress column
function handleDrop(event, ui) {
  const taskId = ui.draggable.attr("id").split("-")[1];
  const newStatus = $(event.target).closest(".lane").attr("id");

  if (
    newStatus === "todo" ||
    newStatus === "in-progress" ||
    newStatus === "done"
  ) {
    const taskIndex = taskList.findIndex((task) => task.id == taskId);
    taskList[taskIndex].status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
  } else {
    ui.draggable.draggable("option", "revert", true); // Revert card back to its original position
  }
}

// When the page loads, render the task list, add event listeners,
// make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();
  $("#taskForm").submit(handleAddTask);
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop,
  });
  $("#dueDate").datepicker();
});
