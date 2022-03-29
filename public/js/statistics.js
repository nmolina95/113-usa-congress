let header = new Headers({"X-API-Key":"FTskuWn5Fuqi8FAY1hOF76cYje9lrCcqT5iHDxB6"});
let headerInit = { headers: header };
let title = document.querySelector('title');
let memberType = () => (title.innerHTML.includes('Senate')) ? 'senate' : 'house';

var app = new Vue({
    el: '#app',
    data: {
      democrats: [],
      republicans: [],
      independents: [],
      total: 0,
      votesAvg: 0,
      votes_w_party_democrats: 0,
      votes_w_party_republicans: 0,
      votes_w_party_independents: 0,
      votes_w_party_total: 0,
      least_engaged_members: [],
      most_engaged_members: [],
      least_loyal_members: [],
      most_loyal_members: []
    }
  })

// Get api data and render at html
fetch(`https://api.propublica.org/congress/v1/113/${memberType()}/members.json`, headerInit)
    .then(response => {
        return response.json();
    })
    .then(data => {
        let apiMembers = data.results[0].members;

        getData(apiMembers);
    })
    .catch(err => {
        return console.warn(err);
    })

/*====== Statistics ======*/
let statistics = {
    democrats: [],
    republicans: [],
    independents: [],
    total: 0,
    votes_w_party_democrats: 0,
    votes_w_party_republicans: 0,
    votes_w_party_independents: 0,
    votes_w_party_total: 0,
    least_engaged_members: [],
    most_engaged_members: [],
    least_loyal_members: [],
    most_loyal_members: []
};

function getData(data){
    // Get list of members
    app.democrats = data.filter(member => member.party == "D");
    app.republicans = data.filter(member => member.party == "R");
    app.independents = data.filter(member => member.party == "ID");

    // Get votes with party percentage
    app.votes_w_party_democrats = getVotesWithParty(app.democrats);
    app.votes_w_party_republicans = getVotesWithParty(app.republicans);
    app.votes_w_party_independents = getVotesWithParty(app.independents);

    // Get statistics about members votes
    app.least_engaged_members = getStatistics(data, 10, "b", "missed_votes_pct");
    app.most_engaged_members = getStatistics(data, 10, "a", "missed_votes_pct");
    app.least_loyal_members = getStatistics(data,10, "a", "votes_with_party_pct");
    app.most_loyal_members = getStatistics(data, 10, "b", "votes_with_party_pct");

    getTotal();
}

// Get members votes with party average
function getVotesWithParty(array){
    let votesAvg = 0;

    array.forEach(member => votesAvg += member.votes_with_party_pct);
    if(votesAvg == 0) return 0;
    else return votesAvg = trunc(votesAvg / array.length);
}

// Get statistics about members
function getStatistics(array, percentage, order, param){
    let auxArray = [];

    sortArray(array, order, param);
    addFilteredMembers(array, percentage, auxArray);

    return auxArray;
}

// Order array as specified
function sortArray(array, order, param){
    if(order == "a") array.sort((a,b) => {return a[param] - b[param]});
    if(order == "b") array.sort((a,b) => {return b[param] - a[param]});
}

// Filter members and add to aux array
function addFilteredMembers(array, percentage, auxArray){
    let condition = Math.floor(array.length / percentage);

    for(let i = 0; i < condition; i++) {
        (array[i].total_votes != 0) ? auxArray.push(array[i]) : condition++;
    }
}

// Get total number of members and votes average
function getTotal(){
    let votesAvg;

    if(app.votes_w_party_independents == 0) votesAvg = trunc((app.votes_w_party_democrats + app.votes_w_party_republicans) / 2);
    else votesAvg = trunc((app.votes_w_party_democrats + app.votes_w_party_republicans + app.votes_w_party_independents) / 3);

    app.total = app.democrats.length + app.republicans.length + app.independents.length;
    app.votesAvg = votesAvg;
}
/*====== /Statistics ======*/

// Truncate number
function trunc(number){
    let auxVar = number.toString();
    let decimalPosition = auxVar.indexOf(".") + 1;
    auxVar = auxVar.substr(0, decimalPosition + 2);
    return Number(auxVar);
}
