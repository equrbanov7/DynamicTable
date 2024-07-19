const BASE_URL = "https://api.npoint.io/9cda598e0693b49ef1eb"

const tableBody = document.querySelector('#tableBody');
const doublePrevious = document.querySelector('#doublePrevious');
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');
const emptyStateCard = document.querySelector("#emptyStateCard")

let debounceTimer;


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

    // console.log(transfromData)
    return transfromData
}

// let testUser = new User('John Doe', '123 Main St', 'john@example.com', '555-555-5555', '1923-06-10', "Research officer, government", "Duncan-Hawkins");

// console.log(testUser)

//const usersData = fetchRawData(BASE_URL)


async function generateTableData(page = 1, limit = 10, searchData = '') {

    const tableUserDatas = await fetchRawData(BASE_URL);
    totalPage = Math.ceil(tableUserDatas.length / limit);

    const filteredDataBySearch = tableUserDatas.filter(user =>
        user.name.toLowerCase().includes(searchData.toLowerCase()) ||
        user.email.toLowerCase().includes(searchData.toLowerCase())
    );

    const startData = (page - 1) * limit
    const endData = startData + limit;
    const generatedTableUserData = filteredDataBySearch.slice(startData, endData)



    tableBody.innerHTML = '';

    generatedTableUserData.map((tableUserData, index) => {
        const {
            name,
            address,
            email,
            phone_number,
            birthdate,
            job,
            company
        } = tableUserData;
        let eachUserInfo = new User(name, address, email, phone_number, birthdate, job, company);

        let row = document.createElement('tr');
        const indexNumber = page > 1 ? generatedTableUserData.length * page - 9 + index : index + 1
        row.innerHTML = `
        <th scope="row">${indexNumber}</th>
        <td>${eachUserInfo.name}</td>
        <td>${eachUserInfo.address}</td>
        <td>${eachUserInfo.email}</td>
        <td>${eachUserInfo.phoneNumber}</td>
        <td>${eachUserInfo.job}</td>
        <td>${eachUserInfo.company}</td>
        <td>${eachUserInfo.birthDate}</td>
        <td>${eachUserInfo.age}</td>
        <td>${eachUserInfo.isRetired ? 'Yes' : 'No'}</td>
    `;


        tableBody.appendChild(row);


    })

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === totalPage;

    if (totalPage === 1 || totalPage === 0 || generatedTableUserData.length < 1) {
        prevBtn.style.display = 'none'
        nextBtn.style.display = 'none'
    }else{
         prevBtn.style.display = 'block'
         nextBtn.style.display = 'block'
    }

    if( generatedTableUserData.length === 0){
        emptyStateCard.style.display = 'block'
    }else{
        emptyStateCard.style.display = 'none'

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
        generateTableData(currentPage)
    }

    // console.log("next")
})
prevBtn.addEventListener('click', () => {

    if (currentPage > 1) {
        currentPage--;
        generateTableData(currentPage)
    }

    // console.log("prev")
})
doublePrevious.addEventListener('click', () => {

    if (currentPage > 2) {
        currentPage = 1;
        generateTableData(currentPage)
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