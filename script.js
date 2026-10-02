const expenseForm = document.getElementById("expense-form");
const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");
const expenseDate = document.getElementById("expense-date");
const expenseList = document.getElementById("expense-list");
const totalAmount = document.getElementById("total-amount");
const filterCategory = document.getElementById("filter-category");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const nameError = document.getElementById("nameerror");
const amountError = document.getElementById("amounterror");
const dateError = document.getElementById("dateerror");

let expenses = [];
let editingExpense = null;

// Load expenses from localStorage
try {
    const storedExpenses = JSON.parse(localStorage.getItem("expenses"));

    if (Array.isArray(storedExpenses)) {
        expenses = storedExpenses.map(function (expense) {
            return {
                name: expense.name,
                amount: Number(expense.amount),
                category: expense.category,
                date: expense.date
            };
        });
    }
} catch (error) {
    expenses = [];
}

// Save expenses
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Calculate total again from the main array
function updateTotal() {
    const total = expenses.reduce(function (sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    totalAmount.innerText = total;
}

// Reset form and leave editing mode
function resetForm() {
    editingExpense = null;
    expenseForm.reset();

    submitBtn.innerText = "Add Expense";
    cancelBtn.hidden = true;

    nameError.innerText = "";
    amountError.innerText = "";
    dateError.innerText = "";
}

// Add or update expense
expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    let formIsValid = true;

    nameError.innerText = "";
    amountError.innerText = "";
    dateError.innerText = "";

    if (name === "") {
        nameError.innerText = "Please enter expense name";
        formIsValid = false;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        amountError.innerText = "Please enter a valid amount";
        formIsValid = false;
    }

    if (date === "") {
        dateError.innerText = "Please select a date";
        formIsValid = false;
    }

    if (!formIsValid) {
        return;
    }

    if (editingExpense !== null) {
        editingExpense.name = name;
        editingExpense.amount = amount;
        editingExpense.category = category;
        editingExpense.date = date;
    } else {
        const expense = {
            name: name,
            amount: amount,
            category: category,
            date: date
        };

        expenses.push(expense);
    }

    saveExpenses();
    updateTotal();
    resetForm();
    applyFilter();
});

// Register the Cancel listener only once
cancelBtn.addEventListener("click", function () {
    resetForm();
});

// Apply filter whenever selection changes
filterCategory.addEventListener("change", function () {
    applyFilter();
});

function applyFilter() {
    const selectedCategory = filterCategory.value;

    if (selectedCategory === "all") {
        displayExpenses(expenses);
        return;
    }

    const filteredExpenses = expenses.filter(function (expense) {
        return expense.category === selectedCategory;
    });

    displayExpenses(filteredExpenses);
}

function formatDate(date) {
    if (!date) {
        return "No date";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function displayExpenses(expensesToDisplay) {
    expenseList.innerHTML = "";

    if (expensesToDisplay.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.innerText = "No expenses found";
        emptyItem.className = "empty-message";
        expenseList.appendChild(emptyItem);
        return;
    }

    expensesToDisplay.forEach(function (expense) {
        const li = document.createElement("li");

        const expenseText = document.createElement("span");

        expenseText.innerText =
            `${expense.name} - ${expense.category} - ` +
            `₹${expense.amount} - ${formatDate(expense.date)}`;

        li.appendChild(expenseText);

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.innerText = "Edit";

        li.appendChild(editBtn);

        editBtn.addEventListener("click", function () {
            editingExpense = expense;

            expenseName.value = expense.name;
            expenseAmount.value = expense.amount;
            expenseCategory.value = expense.category;
            expenseDate.value = expense.date;

            submitBtn.innerText = "Update Expense";
            cancelBtn.hidden = false;

            expenseName.focus();
        });

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.innerText = "Delete";

        li.appendChild(deleteBtn);

        deleteBtn.addEventListener("click", function () {
            const confirmDelete = confirm(
                "Are you sure you want to delete this expense?"
            );

            if (!confirmDelete) {
                return;
            }

            const index = expenses.indexOf(expense);

            if (index === -1) {
                return;
            }

            expenses.splice(index, 1);

            if (editingExpense === expense) {
                resetForm();
            }

            saveExpenses();
            updateTotal();
            applyFilter();
        });

        expenseList.appendChild(li);
    });
}

// Initial page display
updateTotal();
applyFilter();