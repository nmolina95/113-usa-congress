let header = new Headers({"X-API-Key":"FTskuWn5Fuqi8FAY1hOF76cYje9lrCcqT5iHDxB6"});
let headerInit = { headers: header };
let title = document.querySelector('title');
let memberType = () => (title.innerHTML.includes('Senators')) ? 'senate' : 'house';
let members = [];

var app = new Vue({
    el: '#app',
    data: {
      members: [],
      states: []
    }
  })

// Get api data and render at html
fetch(`https://api.propublica.org/congress/v1/113/${memberType()}/members.json`, headerInit)
    .then(response => {
        return response.json();
    })
    .then(data => {
        let apiMembers = data.results[0].members;

        apiMembers.forEach(member => app.members.push(member));
        apiMembers.forEach(member => members.push(member));

        renderSelect(apiMembers);
    })
    .catch(err => {
        return console.warn(err);
    })

/*====== Table filters ======*/
let party = document.querySelectorAll('.party');
let checkedBoxes = [];

// Listen checkbox changes
party.forEach(e => {
    e.addEventListener('change', e => {
        let checkbox = e.target.id;
        let checked = e.target.checked;
        let newTable = []
        let filteredMembers;

        // Insert or remove checkbox to aux array depending if its checked
        updateAuxArray(checkedBoxes, checked, checkbox);

        // Get array of members filtered
        if(selectedState.length == 0){
            getFilteredMembers(checkedBoxes, members, newTable);

            // Reset table and apply changes
            filterTable(newTable);
        }
        else if(checkedBoxes.length == 0){
            filteredMembers = members.filter(member => member.state == selectedState[0]);
        }
        else{
            getFilteredMembers(checkedBoxes, members, newTable);
            filteredMembers = newTable.filter(member => member.state == selectedState[0]);

            // Reset table and apply changes
            filterTable(filteredMembers);
        }

        // Reset table in case there are no checked filters
        if(selectedState.length == 0){
            resetTable(checkedBoxes, members);
        }
        else{
            resetTable(checkedBoxes, filteredMembers);
        }
    })
})

function updateAuxArray(auxArray, checked, checkbox){
    if(checked){
        auxArray.push(checkbox);
    }
    else{
        let index = auxArray.indexOf(checkbox);
        auxArray.splice(index, 1);
    }
}

function getFilteredMembers(auxArray, dataArray, updatedTable){
    auxArray.forEach(box => {
        dataArray.forEach(member =>{
            if(box == member.party){
                updatedTable.push(member);
            }
        })
    })
}

function filterTable(updatedTable){
    app.members = updatedTable;
}

function resetTable(auxArray, data){
    if(auxArray.length == 0){
        app.members = data;
    }
}
/*====== /Table filters ======*/

/*====== Get states select options ======*/
let state = document.querySelectorAll(".state");

function getSelectOptions(data){
    let auxArray = []
    data.forEach(e => {
        if(auxArray.indexOf(e.state) == -1){
            auxArray.push(e.state);
        }
    })
    return auxArray.sort();
}

function renderSelect(data){
    app.states = getSelectOptions(data);
}
/*====== /Get states select options ======*/

/*====== States select filter ======*/
let selectedState = [];
let states = document.getElementById("states-select");

states.addEventListener('change', event => {
    let targetState = event.target.value;
    let newTable = [];
    let filteredMembers;

    // Replace selected state in case there is one
    if(selectedState.length > 0) {
        selectedState.pop();
    }

    if(targetState.length > 0){
        selectedState.push(targetState);
    }

    // Check for party filters applied and get results
    if(checkedBoxes.length > 0){
        getFilteredMembers(checkedBoxes, members, newTable);
        filteredMembers = newTable.filter(member => member.state == targetState);
    }
    else{
        filteredMembers = members.filter(member => member.state == targetState);
    }

    // Reset table and apply filters
    filterTable(filteredMembers);

    // Reset table if no option selected, or show results of party filters applied
    if(targetState == '' && checkedBoxes.length == 0){
        resetTable(checkedBoxes, members);
    }
    else if(targetState == '' && checkedBoxes.length > 0){
        filterTable(newTable);
    }
})
/*====== /States select filter ======*/