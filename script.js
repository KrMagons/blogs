let running_posts_arr = posts;
let dropdown_button;
let post_types;
let date_asc;
let date_desc;
let searchbar;
let searchbar_button;
let posts_element;
let name_input;
let email_input;
let message_input;
let message_form;

document.addEventListener("DOMContentLoaded", () => {
    dropdown_button = document.getElementById("dropdown-btn");
    post_types = document.getElementById("post-type");
    date_asc = document.getElementById("date-asc");
    date_desc = document.getElementById("date-desc");
    searchbar = document.getElementById("searchbar");
    searchbar_button = document.getElementById("searchbar-button");
    posts_element = document.getElementsByClassName("posts")[0];
    name_input = document.getElementById("name");
    email_input = document.getElementById("email");
    message_input = document.getElementById("message");
    message_form = document.getElementById("message-form");

    addPostTypes();
    sortPostArray();
    addAllPosts();
    post_types.addEventListener("change", filterPosts);
    date_asc.addEventListener("change", filterPosts);
    date_desc.addEventListener("change", filterPosts);

    message_form.addEventListener("submit", function(event){
        if(!isMessageValid) event.preventDefault();
    });

    searchbar.addEventListener("keypress", function(event){
        if(event.key === "Enter") searchPosts();
    });

    window.addEventListener("load", () => {
        window.scrollTo(0, 0);
    });

});

/* Funkcija atgriež masīvu ar visām vērtībām no posts.js pēc padotās property īpašības */
function getValues(property){
    let arr = [];
    for(let post of posts){
        let values = post[property].split(",").map(v => v.trim());
        for(let value of values){
            if(!arr.includes(value)) arr.push(value);
        }
    }
    return arr.sort();
}

/* Funkcija iegūst visus publikāciju veidus un izveido, kā filtru opcijas HTML kodā */
function addPostTypes(){
    let types = getValues("Type");
    for(let type of types){
        let select = document.createElement("div")
        select.className = "select";

        let label = document.createElement("label");
        label.className="select-label"

        let input = document.createElement("input");
        input.type = "checkbox";
        input.id = type;
        input.name = type;
        input.value = type;

        let text = document.createElement("span");
        text.textContent = type;

        label.append(input, text)
        select.append(label)
        post_types.append(select);
    }
}

/* Funkcija saņem publikācijas objektu no posts.js un atgriež div.post publikāciju */
function createPost(post){
    let new_post = document.createElement("div");
    new_post.className = "post";

    //Bildes elements
    let post_img = document.createElement("img");
    post_img.src = post["img"];
    post_img.alt = "Bilde " + post["Title"];
    new_post.append(post_img);

    //Publikācijas apraksts
    let post_description = document.createElement("div");
    post_description.className = "post-description";
    let description_h3 = document.createElement("h3");
    description_h3.textContent = post["Title"];
    post_description.append(description_h3);
    let description_p = document.createElement("p")
    description_p.textContent = post["Description"];
    post_description.append(description_p);
    new_post.append(post_description);

    //Publikācijas info (tips, datums)
    let post_info = document.createElement("table");
    post_info.className = "post-info";

    //Datums
    let first_row = document.createElement("tr");
    let date_first_td = document.createElement("td");
    date_first_td.textContent = "Publicēts ";
    first_row.append(date_first_td);
    let date_second_td = document.createElement("td");
    date_second_td.textContent = post["Published"];
    first_row.append(date_second_td);
    post_info.append(first_row);

    //Tips
    let second_row = document.createElement("tr");
    let post_first_td = document.createElement("td");
    post_first_td.textContent = "Publikācija ";
    second_row.append(post_first_td);
    let post_second_td = document.createElement("td");
    post_second_td.textContent = post["Type"];
    second_row.append(post_second_td);
    post_info.append(second_row);

    new_post.append(post_info);

    //Saite uz publikāciju
    let read_button = document.createElement("p");
    read_button.id = "read";
    let read_link = document.createElement("a");
    read_link.href = post["pdf"];
    read_link.textContent = "Lasīt..";
    read_button.append(read_link);
    new_post.append(read_button); 

    return new_post;
}

/* Funkcija sakārto tekošo publikāciju masīvu running_posts_arr augošā vai dilstošā 
    secībā pēc publicēšanas datuma
*/
function sortPostArray(){
    running_posts_arr.sort(function(a, b){
        let date_a = new Date(a.Published);
        let date_b = new Date(b.Published);
        if(date_asc.checked) return date_b-date_a;
        else return date_a-date_b;
    });
}

/* Funkcija izveido div.post elementus katram publikācijas objektam posts.js un pievieno
    .posts sarakstam HTML kodā
*/
function addAllPosts(){
    for(let post of running_posts_arr){
        let new_post = createPost(post);
        posts_element.append(new_post);
    }
}

/* Funkcija izņem no posts. saraksta HTML kodā visas publikācijas */
function removeAllPosts(){
    posts_element.innerHTML = "";
}

/* Funkcija pievieno tekošajam publikāciju masīvam running_posts_arr tās publikācijas,
    kurām tips (Grāmatas analīze, Recenzija utt.) sakrīt ar filtros atzīmētajiem
*/
function filterPosts(){
    let checked_values = [];
    let checkboxes = post_types.querySelectorAll('input[type="checkbox"]');

    for(let checkbox of checkboxes)
        if(checkbox.checked) checked_values.push(checkbox.value);
    
    running_posts_arr = [];
    if(checked_values.length == 0){
        running_posts_arr = posts;
    }else{
        for(let post of posts){
            let types = post["Type"].split(",").map(t => t.trim());
            for(let type of types){
                if(checked_values.includes(type) && !running_posts_arr.includes(post))
                    running_posts_arr.push(post);
            }
        }
    }
    searchPosts();
    sortPostArray();
    removeAllPosts();
    addAllPosts();
}

/* Funkcija pievieno tekošajam publikāciju masīvam running_posts_arr tās publikācijas,
    kuru virsrakstā vai aprakstā sakrīt simbolu virkne ar meklētājā ievadīto
*/
function searchPosts(){
    let filtered_posts = [];
    let searchbar_value = searchbar.value.toLowerCase();
    let checked_values = [];
    let checkboxes = post_types.querySelectorAll('input[type="checkbox"]');
    for(let checkbox of checkboxes)
        if(checkbox.checked) checked_values.push(checkbox.value);

    for(let post of posts){
        let title = post["Title"].toLowerCase();
        let description = post["Description"].toLowerCase();
        let types = post["Type"].split(",").map(t => t.trim());
        let post_type_match = false;
        if(checked_values.length == 0) post_type_match = true;
        for(let type of types)
            if(checked_values.includes(type)) post_type_match = true;
        let search_match = (title.includes(searchbar_value) || description.includes(searchbar_value));
        if(searchbar_value === "") search_match = true;
        if(post_type_match && search_match) filtered_posts.push(post);
    }
    running_posts_arr = filtered_posts;

    if(running_posts_arr.length == 0){
        document.getElementById("no-result").style.display = "flex";
        document.getElementById("result").textContent = searchbar.value;
    }else{
        document.getElementById("no-result").style.display = "none";
    }

    sortPostArray();
    removeAllPosts();
    addAllPosts();
}

/* Funkcija pārbauda, vai iesniegtā ziņas forma ir derīga. Ja ir, iesniedz formu. Pretējā gadījumā
    uzrāda kļūdu un formu neiesniedz
*/
function isMessageValid(event){
    let name_val = name_input.value;
    let email_val = email_input.value;
    let message_val = message_input.value;

    let valid_name = false;
    let valid_message = false;
    let valid_email = false;

    if(!name_val || name_val.trim() === "" || name_val.length > 30){
        document.getElementById("name-error").style.display = "inline-block";
    }else{
        document.getElementById("name-error").style.display = "none";
        valid_name = true;
    }

    if(!email_val || !email_input.checkValidity()){
        document.getElementById("email-error").style.display = "inline-block";
    } 
    else {
        document.getElementById("email-error").style.display = "none";
        valid_email = true;
    } 

    if(!message_val || message_val.trim() === ""){
        document.getElementById("message").style.borderColor = "red";
    }else{
        document.getElementById("message").style.borderColor = "black";
        valid_message = true;
    }

    if(!(valid_name && valid_email && valid_message)) event.preventDefault();
}

/* Funkcija attēlo vai paslēpj publikāciju veidu izvēlni .dropdown-list */
function displayDropdown(){
    if(post_types.style.display == "none"){
        post_types.style.display = "block";
        dropdown_button.style.backgroundColor = "slategray";
    }
    else{
        post_types.style.display = "none";
        dropdown_button.style.backgroundColor = "#97aabd";
    }
}