/////////////////////////////////////////////////////////////////////////////////////////////
                                    // Setup //
/////////////////////////////////////////////////////////////////////////////////////////////
const root = document.querySelector(":root")
const themeChangeButton = document.querySelector("#theme-change-button")

const createTodoFrame = document.querySelector("#create-new-todo")
const createTodoText = createTodoFrame.querySelector(".todo-text")

const todoList = document.querySelector("#todo-list")
const todoTemplate = document.querySelector("#todo-template")
const statusBar = document.querySelector("#status-bar")

let currentId = 0

let theme = "dark"
let themes = null

let todoItems = {}

fetch('./themes.json').then((response) => {
    return response.json()
}).then((json) => {
    themes = json
});



/////////////////////////////////////////////////////////////////////////////////////////////
                                    // Misc functions //
/////////////////////////////////////////////////////////////////////////////////////////////
function changeTheme() {
    if (theme == "light") {
        theme = "dark";
        themeChangeButton.querySelector("img").src = "./images/icon-sun.svg";
    } else {
        theme = "light";
        themeChangeButton.querySelector("img").src = "./images/icon-moon.svg";
    }
    
    for (let item in themes[theme]) {
        root.style.setProperty(item, themes[theme][item]);
    };
}

const getActiveItems = function() {
    let current = 0
    let activeItems = {}
    let inactiveItems = {}
    for (key in todoItems) {
        if (todoItems[key].active == true) { 
            activeItems[key] = todoItems[key];
            current++;
        } else {
            inactiveItems[key] = todoItems[key];
        }
    }  
    return [current, activeItems, inactiveItems]
}

function updateStatusBar() {
    let itemPrefix = "s"
    
    const activeItems = getActiveItems()[0]
    allItems = Object.keys(todoItems).length
    
    if (allItems > 0) {
        statusBar.style.borderRadius = "0 0 10px 10px";
        activeItems == 1 ? itemPrefix = "" : itemPrefix = "s"
    } else {
        statusBar.style.borderRadius = "10px 10px 10px 10px";
    }
    statusBar.querySelector("#items-left").textContent = activeItems.toString() + " item" + itemPrefix + " left"
}



/////////////////////////////////////////////////////////////////////////////////////////////
                                    // Status bar //
/////////////////////////////////////////////////////////////////////////////////////////////
function showType(activeType, button) {
    const activeItems = getActiveItems()

    document.querySelectorAll(".status-button").forEach((e) => {
        e.classList.remove("currently-selected")
    })
    button.classList.add("currently-selected")

    let completedTypeVal = ""
    let activeTypeVal = ""

    if (activeType == "Active") {
        completedTypeVal = "none"
        activeTypeVal = ""
    } else if (activeType == "Completed") {
        completedTypeVal = ""
        activeTypeVal = "none"
    } else {
        completedTypeVal = ""
        activeTypeVal = ""
    }

    for (item in activeItems[1]) {
        activeItems[1][item].reference.style.display = activeTypeVal
    }
    for (item in activeItems[2]) {
        activeItems[2][item].reference.style.display = completedTypeVal
    }
}




/////////////////////////////////////////////////////////////////////////////////////////////
                                    // TODO functions //
/////////////////////////////////////////////////////////////////////////////////////////////
function completeTodo(item) {
    item = item.closest('.todo-label')
    const itemId = item.id.split("-")[1]
    const checkButton = item.querySelector(".check-button")

    if (todoItems[itemId].active == true) {
        checkButton.classList.remove("check-button-active")
        checkButton.classList.add("check-button-inactive")

        checkButton.querySelector('.check-image').style.opacity = 100
        item.querySelector('.todo-text').classList.add("todo-text-inactive")

        todoItems[itemId].active = false
    } else {
        checkButton.classList.add("check-button-active")
        checkButton.classList.remove("check-button-inactive")

        checkButton.querySelector('.check-image').style.opacity = ""
        item.querySelector('.todo-text').classList.remove("todo-text-inactive")

        todoItems[itemId].active = true
    }
    updateStatusBar()
}

function deleteTodo(item) {
    item = item.closest('.todo-label')
    const itemId = item.id.split("-")[1]
    
    delete todoItems[itemId]

    for (key in todoItems) {
        if (parseInt(key) > parseInt(itemId)) {
            const itemContent = todoItems[key]
            delete todoItems[key]
            todoItems[parseInt(key) - 1] = itemContent
            itemContent["reference"].id = "item-" + (parseInt(key) - 1).toString()
        }
    }
    
    item.remove()
    currentId --;

    updateStatusBar()
    return true
}

function createTodo(todoText) {
    const todoClone = todoTemplate.cloneNode(true)
    const cloneText = todoClone.querySelector(".todo-text")

    todoClone.id = "item-" + currentId.toString()
    cloneText.textContent = todoText

    todoList.append(todoClone)
    todoItems[currentId.toString()] = {
        "reference": todoClone,
        "active": true
    }
    
    currentId ++;
    return true;
}




/////////////////////////////////////////////////////////////////////////////////////////////
                                    // Event Listeners //
/////////////////////////////////////////////////////////////////////////////////////////////
createTodoText.addEventListener("keydown", event => {
    if (event.key == "Enter") {
        if (createTodoText.value == "") {
            return null
        };
        const result = createTodo(createTodoText.value)
        if (result == true) {
            createTodoText.value = ""
            updateStatusBar()
        }
    }
})

document.querySelectorAll(".status-button").forEach((e) => {
    e.addEventListener("click", () => {
        showType(e.textContent, e)
    })
})