const listsContainer = document.querySelector('[data-lists]')
const newListForm = document.querySelector('[data-new-list-form]')
const newListInput = document.querySelector('[data-new-list-input]')
const deleteListButton = document.querySelector('[data-delete-list-button]')
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')

const listsDisplayContainer = document.querySelector('[data-lists-display-container]')
const listTitle = document.querySelector('[data-list-title]')
const listCount = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const taskTemplate = document.getElementById('task-template')
// the data attribute is used to store custom data private to a page
// to make a data attribute it must start with 'data-'

// need key-value pairs to store locally
// need to make namespace when storing locally, hence 'task.' added bc
// it prevents you from over-riding info already in local stroage or 
// other websites from overriding my local storage keys
const local_storage_list_key = 'task.lists'
const local_storage_list_id_key = 'task.selectedListId'
// get information from local storage using this key and if it exists parse it into
// an object or if it does not exist give an empty array of lists to start
let lists = JSON.parse(localStorage.getItem(local_storage_list_key)) || []

let selectedListId = localStorage.getItem(local_storage_list_id_key)


function renderLists() {
    // for each list inside of lists create a li element with the right class added
    // list.name so that the list will be identifible by the entered name
    // listsContainer.appendChild(listElement) actually adds the item to the list
    // listElement.dataset.listId = list.id adds data attribute so that its possible to know which list is being selected
    lists.forEach(list => {
        const listElement = document.createElement('li')
        listElement.dataset.listId = list.id
        listElement.classList.add("list-name")
        listElement.innerText = list.name
        
        // if list is currently selected list set it to active list
        if (list.id === selectedListId) {
            listElement.classList.add("active-list")
        }
        listsContainer.appendChild(listElement)
    })
}


listsContainer.addEventListener('click', e => {
    if(e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.dataset.listId
        saveAndRender()
    }
})



tasksContainer.addEventListener('click', e => {

    // if checkbox has been marked(input)
    if(e.target.tagName.toLowerCase() === 'input') { 
        const selectedList = lists.find(list => list.id === selectedListId)
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
        selectedTask.complete = e.target.checked
        save()
        taskCount(selectedList)
    }
})

deleteListButton.addEventListener('click', e => {
    // finds which has selectedListId and deletes it, value set to null bc its not longer the selected list
    lists = lists.filter(list => list.id !== selectedListId)
    selectedListId = null
    saveAndRender()
})

clearCompleteTasksButton.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListId)
    // set task list to all tasks which have not been completed
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
    saveAndRender()
})
newListForm.addEventListener('submit', e => {
    //stops page from refreshing when enter is pressed in new list name box
    e.preventDefault();
    // .value must be added to get the string value that was typed in 
    const listName = newListInput.value
    if (listName == null || listName === '') return
    // if name is typed in create a new list
    const list = createList(listName)
    // clears list name from list adder bar once its successfully added
    newListInput.value = null
    // takes lists variable (all lists) and adds the new list to it
    lists.push(list)
    saveAndRender()
})

newTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    const taskName = newTaskInput.value
    if (taskName == null || taskName === '') return
    const task = createTask(taskName)
    newTaskInput.value = null
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks.push(task)
    saveAndRender()
}) 

function createList(name) {
    // returns object, Date.now().toString() take the date and current tinme and convert them to a string to 
    // give a unique identifier, name is set to the name and each list will have a set of tasks
    return {id: Date.now().toString(), name: name, tasks:[] } 
}

function createTask(name) {
    return {id: Date.now().toString(), name: name, complete: false } 
}

function saveAndRender() {
    save()
    render()
}

function save() {
   localStorage.setItem(local_storage_list_key, JSON.stringify(lists)) 
   localStorage.setItem(local_storage_list_id_key, selectedListId)
}

function render() {
    // bc it clears and then re-renders everything i dont have to manually remove the class of active list 
    // from the selected and then unselected lists
    clearElement(listsContainer)
    renderLists()
    const selectedList = lists.find(list => list.id === selectedListId)
    // if no list is selcted task section will disappear
    // else task section will be shown '' reverts it to normal
    if(selectedListId == null) {
        listsDisplayContainer.style.display = 'none'

    } else {
        listsDisplayContainer.style.display = ''
        // sets title of task area to whatever list is selected
        listTitle.innerText = selectedList.name
        taskCount(selectedList)
        clearElement(tasksContainer)
        renderTasks(selectedList)
    }
}

function clearElement(element) {
    // makes sure everything in list is deleted everytime that render is called
    // hard coded list names will not show up, only ones entered by user 
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

function renderTasks(selectedList) {
    //runs for every task 
    selectedList.tasks.forEach(task => {
        // renders everything in template when true is added, without true would just add top most 
        // div information
        const taskElement = document.importNode(taskTemplate.content, true)

        const checkbox = taskElement.querySelector('input')
        checkbox.id = task.id
        checkbox.checked = task.complete

        const label = taskElement.querySelector('label')
        label.htmlFor = task.id
        label.append(task.name)
        tasksContainer.appendChild(taskElement)
    })
}

function taskCount(selectedList) {
    // get every task that is not complete
    const incompleteTasks = selectedList.tasks.filter(task => !task.complete).length
    // if just one task 'task' will be singular, else it will be 'tasks'
    const taskString = incompleteTasks === 1 ? "assignment" : "assignments"
    listCount.innerText = `${incompleteTasks} ${taskString} remaining`
}

render()