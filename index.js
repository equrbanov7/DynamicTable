const BASE_URL = "http://localhost:3000/users"

const tableBody = document.querySelector('#tableBody');
const theadHeader = document.querySelector('#theadHeader');
const doublePrevious = document.querySelector('#doublePrevious');
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');
const emptyStateCard = document.querySelector("#emptyStateCard")
const addUserModalForm = document.querySelector("#addUserModalForm")
const addUserBtn = document.querySelector("#addUserBtn")
const exampleModal = document.querySelector("#exampleModal")
const addUserToJsonData = document.querySelector("#addUserToJsonData")
const editUserBtn = document.querySelector("#editUserBtn")
const sortIcon = document.querySelector("#sortIcon")


const nameError = document.getElementById('nameError');
const addressError = document.getElementById('addressError');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');
const jobError = document.getElementById('jobError');
const companyError = document.getElementById('companyError');
const birthdateError = document.getElementById('birthdateError');

const ENUMS = {
    asc: "ASC",
    desc: "DESC"
}

let debounceTimer;

let sortKey = '';
let sortType = '';
let countOfClickedSort = 0
let currentPage = 1;
let totalPage = 0;
const itemsPerPage = 10;



class Person {

    constructor(name, address, email, phoneNumber, birthDate) {
        this.name = name;
        this.address = address;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.birthDate = birthDate;
        this.age = this.findAge();
    }

    findAge() {
        const today = new Date();
        const birthDate = new Date(this.birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        const dayDifference = today.getDate() - birthDate.getDate();

        if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
            age--;
        }

        return age;
    }
}




class User extends Person {

    constructor(name, address, email, phoneNumber, birthDate, job, company) {
        super(name, address, email, phoneNumber, birthDate)
        this.job = job;
        this.company = company
        this.isRetired = this.findRetirementStatus();

    }
    findRetirementStatus() {
        return this.age > 65;
    }

}

async function fetchRawData(url) {

    const fetchData = await fetch(url);

    const transfromData = await fetchData.json();

    return transfromData
}

async function fetchUserById(userId) {
    const response = await fetch(`${BASE_URL}/${userId}`);
    return await response.json();
}

function checkFormInputValidation({
    name,
    address,
    email,
    phone,
    job,
    company,
    birthdate
}) {


    let validationCheck = true

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d+$/;

    if (!name) {
        nameError.style.display = 'block';
        validationCheck = false;
    } else {
        nameError.style.display = 'none';
    }

    if (!address) {
        addressError.style.display = 'block';
        validationCheck = false;
    } else {
        addressError.style.display = 'none';
    }

    if (!email || !emailPattern.test(email)) {
        emailError.style.display = 'block';
        validationCheck = false;
    } else {
        emailError.style.display = 'none';
    }

    if (!phone || !phonePattern.test(phone)) {
        phoneError.style.display = 'block';
        validationCheck = false;
    } else {
        phoneError.style.display = 'none';
    }

    if (!job) {
        jobError.style.display = 'block';
        validationCheck = false;
    } else {
        jobError.style.display = 'none';
    }

    if (!company) {
        companyError.style.display = 'block';
        validationCheck = false;
    } else {
        companyError.style.display = 'none';
    }

    if (!birthdate) {
        birthdateError.style.display = 'block';
        validationCheck = false;
    } else {
        birthdateError.style.display = 'none';
    }


    return validationCheck;
}



async function generateTableData(page = 1, limit = 10, searchData = '', sortKey = '', sortType = '') {

    const tableUserDatas = await fetchRawData(BASE_URL);
    totalPage = Math.ceil(tableUserDatas.length / limit);



    const filteredDataBySearch = tableUserDatas.filter(user =>
        user.name.toLowerCase().includes(searchData.toLowerCase()) ||
        user.email.toLowerCase().includes(searchData.toLowerCase())
    );


    console.log(sortKey, sortType,sortIcon, "sorttttttt")

    if (sortKey && sortType) {
        if (sortKey === "birthdate") {
            if (sortType === ENUMS.desc) {
                console.log(sortType, sortKey, "birth desc");
                sortIcon.src='./Images/arrow-1.svg'
                filteredDataBySearch.sort((a, b) => new Date(b.birthdate) - new Date(a.birthdate));
            } else if (sortType === ENUMS.asc) {
                console.log(sortType, sortKey, "birth asc");
                 sortIcon.src='./Images/arrow-3.svg'
                filteredDataBySearch.sort((a, b) => new Date(a.birthdate) - new Date(b.birthdate));
            }

        }


    } else {
        console.log("default")
      
         sortIcon.src='./Images/arrow-2.svg'
        filteredDataBySearch.sort((a, b) => new Date(b.createUserDate) - new Date(a.createUserDate));

    }




    const startData = (page - 1) * limit
    const endData = startData + limit;
    const generatedTableUserData = filteredDataBySearch.slice(startData, endData)


    tableBody.innerHTML = '';


    generatedTableUserData.map((tableUserData, index) => {

        const {
            id,
            name,
            address,
            email,
            phone,
            birthdate,
            job,
            company
        } = tableUserData;
        let eachUserInfo = new User(name, address, email, phone, birthdate, job, company);

        let row = document.createElement('tr');
        // const indexNumber = page > 1 ? generatedTableUserData.length * page - 9 + index : index + 1
        row.innerHTML = `
        <th scope="row">${id}</th>
        <td>${eachUserInfo.name}</td>
        <td>${eachUserInfo.address}</td>
        <td>${eachUserInfo.email}</td>
        <td>${eachUserInfo.phoneNumber}</td>
        <td>${eachUserInfo.job}</td>
        <td>${eachUserInfo.company}</td>
        <td>${eachUserInfo.birthDate}</td>
        <td>${eachUserInfo.age}</td>
        <td>${eachUserInfo.isRetired ? 'Yes' : 'No'}</td>
        <td><button type="button" class="btn btn-primary editUserBtnClass"  data-bs-toggle="modal" data-bs-target="#exampleModal" data-id="${id}">Edit</button></td>
        <td><button type="button" class="btn btn-danger deleteUserBtnClass" data-id="${id}">Delete</button></td>
      `;

        tableBody.appendChild(row);

    })

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === totalPage;

    if (totalPage === 1 || totalPage === 0 || generatedTableUserData.length < itemsPerPage) {
        prevBtn.style.display = 'none'
        nextBtn.style.display = 'none'
    } else {
        prevBtn.style.display = 'block'
        nextBtn.style.display = 'block'
    }

    if (generatedTableUserData.length === 0) {
        emptyStateCard.style.display = 'block'
    } else {
        emptyStateCard.style.display = 'none'

    }

    if (page > 1) {
        prevBtn.style.display = 'block'

    }

    if (page > 2) {
        doublePrevious.style.visibility = 'visible';
        // console.log("sadas")
    } else {
        doublePrevious.style.visibility = 'hidden';
    }

}
generateTableData()
nextBtn.addEventListener('click', () => {

    if (currentPage < totalPage) {
        currentPage++;
        generateTableData(currentPage, itemsPerPage, '', sortKey, sortType);
    }

    // console.log("next")
})
prevBtn.addEventListener('click', () => {

    if (currentPage > 1) {
        currentPage--;
        generateTableData(currentPage, itemsPerPage, '', sortKey, sortType);
    }

    // console.log("prev")
})
doublePrevious.addEventListener('click', () => {

    if (currentPage > 2) {
        currentPage = 1;
        generateTableData(currentPage, itemsPerPage, '', sortKey, sortType);
    }

    // console.log("double")
})

searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    debounceTimer = setTimeout(() => {

        generateTableData(1, itemsPerPage, query);

    }, 1500);
});

searchBtn.addEventListener('click', (event) => {
    event.preventDefault();
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    if (query.length > 0) {
        generateTableData(1, itemsPerPage, query);
    }
});


addUserToJsonData.addEventListener('click', () => {
    addUserBtn.textContent = "Add User"
    editUserBtn.style.display = "none"
})

addUserBtn.addEventListener('click', async (event) => {


    event.preventDefault();

    const name = addUserModalForm.elements['name'].value.trim();
    const address = addUserModalForm.elements['address'].value.trim();
    const email = addUserModalForm.elements['email'].value.trim();
    const phone = addUserModalForm.elements['phone'].value.trim();
    const job = addUserModalForm.elements['job'].value.trim();
    const company = addUserModalForm.elements['company'].value.trim();
    const birthdate = addUserModalForm.elements['birthdate'].value.trim();



    let createUserDate = new Date()
    const newUser = {
        name,
        address,
        email,
        phone,
        job,
        company,
        birthdate,
        createUserDate
    };

    let validationCheck = checkFormInputValidation(newUser);

    if (validationCheck) {


        try {
            await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

        } catch (error) {
            console.error('Error:', error);
        }
    }
})


tableBody.addEventListener('click', async (event) => {
    if (event.target.matches('button.deleteUserBtnClass')) {
        let targetId = event.target.getAttribute('data-id');

        let checkConfirm = confirm("Are you sure you want to delete this user?");
        if (checkConfirm) {
            try {
                await fetch(`${BASE_URL}/${targetId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });


            } catch (error) {
                console.error('Error:', error);
            }
        }

    } else if (event.target.matches('button.editUserBtnClass')) {
        editUserBtn.style.display = "block";
        addUserBtn.style.display = "none";

        let targetId = event.target.getAttribute('data-id');

        const user = await fetchUserById(targetId);
        addUserModalForm.elements['name'].value = user.name || '';
        addUserModalForm.elements['address'].value = user.address || '';
        addUserModalForm.elements['email'].value = user.email || '';
        addUserModalForm.elements['phone'].value = user.phone || '';
        addUserModalForm.elements['job'].value = user.job || '';
        addUserModalForm.elements['company'].value = user.company || '';
        addUserModalForm.elements['birthdate'].value = user.birthdate || '';




        editUserBtn.addEventListener('click', async () => {
            console.log(addUserModalForm)
            const updateUser = {
                name: addUserModalForm.elements['name'].value.trim(),
                address: addUserModalForm.elements['address'].value.trim(),
                email: addUserModalForm.elements['email'].value.trim(),
                phone: addUserModalForm.elements['phone'].value.trim(),
                job: addUserModalForm.elements['job'].value.trim(),
                company: addUserModalForm.elements['company'].value.trim(),
                birthdate: addUserModalForm.elements['birthdate'].value.trim()
            };

            let validationCheck = checkFormInputValidation(updateUser);


            if (validationCheck) {

                try {
                    await fetch(`${BASE_URL}/${targetId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updateUser)
                    });

                    generateTableData(currentPage);

                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });
    }
});

theadHeader.addEventListener('click', (event) => {

    const thElement = event.target.closest('th');

    sortKey = thElement.textContent.trim().toLowerCase();

    
    if(sortKey === 'birthdate'){

        if (countOfClickedSort === 0) {
            countOfClickedSort++;
            sortType = ENUMS.desc
            generateTableData(1, 10, '', sortKey, sortType)
    
        } else if (countOfClickedSort === 1) {
            countOfClickedSort++;
            sortType = ENUMS.asc
            generateTableData(1, 10, '', sortKey, sortType)
    
        } else {
            countOfClickedSort=0;
            sortType = ''
            sortKey= ''
            generateTableData(1, 10, '', sortKey, sortType)
    
        }
    }
    
   


    console.log(countOfClickedSort,sortKey,sortType)

})