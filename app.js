const cl = console.log;
const todoForm = document.getElementById('todoForm');
const todo = document.getElementById('todo'); // Correct input reference
const todocontainer = document.getElementById('todocontainer');
const loader = document.getElementById('loader');
const addTaskbtn=document.getElementById('addTaskbtn')
const updateTaskbtn=document.getElementById('updateTaskbtn')

let BASE_URL = "https://crud-27f49-default-rtdb.firebaseio.com";
let POST_URL = `${BASE_URL}/totos.json`; // Make sure this matches all operations

const snackBar = (msg, icon) => {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2000
    });
};

let objtoarr = (obj) => {
    let formArr = [];
    for (const key in obj) {
        obj[key].id = key;
        formArr.unshift(obj[key]);
    }
    return formArr;
};

// 👇 FIXED: Set innerHTML AFTER loop (not inside)
let templating = (arr) => {
    let result = ``;
    arr.forEach(to => {
        result += `<div class="card mb-3">
            <div class="card-body d-flex justify-content-between align-items-start" id="${to.id}">
                <h5 class="card-title mb-0">${to.todo}</h5>
                <div class="icon-group">
                    <button onClick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
                    <button onClick="onRemove(this)" class="btn btn-sm btn-outline-danger">remove</button>
                </div>
            </div>
        </div>`;
    });
    todocontainer.innerHTML = result;
};

// 👇 EDIT FUNCTION — adjusted to match todos
const onEdit = (ele) => {
    let Edit_Id = ele.closest('.card-body').id;
    localStorage.setItem('Edit_Id', Edit_Id);
    let Edit_Url = `${BASE_URL}/totos/${Edit_Id}.json`; // Fixed path

    makeApiCall('GET', Edit_Url, null)
        .then(res => {
            todo.value = res.todo; // Corrected field
           addTaskbtn.classList.add('d-none')
            updateTaskbtn.classList.remove('d-none')
        });
};

const onRemove = (ele) => {
    Swal.fire({
        title: "Are you sure want to remove this post!!!!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Remove"
    }).then((result) => {
        if (result.isConfirmed) {
            let Remove_Id = ele.closest('.card-body').id;
            let Remove_Url = `${BASE_URL}/totos/${Remove_Id}.json`; // Fixed path

            makeApiCall('DELETE', Remove_Url, null)
                .then(res => {
                    let card = document.getElementById(Remove_Id).parentElement;
                    card.remove();
                    snackBar(`${Remove_Id} is removed successfully!!!`, 'success');
                });
        }
    });
};

const makeApiCall = (methodName, fetch_URL, msgBody) => {
    let msg = msgBody ? JSON.stringify(msgBody) : null;
    loader.classList.remove('d-none');
    return fetch(fetch_URL, {
        method: methodName,
        body: msg,
        headers: {
             "Auth": "JWT token get form LS", // Not needed unless you're using auth
            "content-type": "application/json"
        }
    })
        .then(res => res.json())
        .catch(cl)
        .finally(() => {
            loader.classList.add('d-none');
        });
};

// 👇 Initial Fetch
makeApiCall('GET', POST_URL, null)
    .then(res => {
        let posts = objtoarr(res);
        cl(posts);
        templating(posts);
    });

// 👇 SUBMIT 
const onSubmitPosts = (eve) => {
    eve.preventDefault();

    let obj = {
        todo: todo.value
    };
    cl(obj);

    makeApiCall('POST', POST_URL, obj)
        .then(res => {
            todoForm.reset();
            let newId = res.name;
            obj.id = newId;

            let card = document.createElement('div');
            card.className = `card mb-3`;
            card.innerHTML = `<div class="card-body d-flex justify-content-between align-items-start" id="${obj.id}">
                <h5 class="card-title mb-0">${obj.todo}</h5>
                <div class="icon-group">
                    <button onClick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
                    <button onClick="onRemove(this)" class="btn btn-sm btn-outline-danger">remove</button>
                </div>
            </div>`;
            todocontainer.prepend(card);
            snackBar(`The "${obj.todo}" added successfully!!!`, 'success');
        });
};

// 👇 UPDATE TODO
const onUpdatePost = (updatedObj) => {
    let Update_Id = localStorage.getItem('Edit_Id');
    let Update_Url = `${BASE_URL}/totos/${Update_Id}.json`;
    let UPDATE_OBJ={
        todo : todo.value,
        id : Update_Id
    }

    makeApiCall('PATCH', Update_Url, UPDATE_OBJ)
        .then(res => {
            todoForm.reset();

            let card = document.getElementById(Update_Id);
            let h5 = card.querySelector('h5');
            h5.innerHTML = res.todo;

             addTaskbtn.classList.remove('d-none')
            updateTaskbtn.classList.add('d-none')
            snackBar(`The "${res.todo}" updated successfully!!!`, 'success');
        });
};

// 👇 MAIN FORM SUBMIT HANDLER
todoForm.addEventListener('submit', onSubmitPosts);
updateTaskbtn.addEventListener('click',onUpdatePost)
