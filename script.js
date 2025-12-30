let running_posts_arr = posts;

let post_types;
let date_asc;
let date_desc;
let searchbar;
let searchbar_button;
let posts_element;

document.addEventListener("DOMContentLoaded", () => {
    post_types = document.getElementById("post-type");
    date_asc = document.getElementById("date-asc");
    date_desc = document.getElementById("date-desc");
    searchbar = document.getElementById("searchbar");
    searchbar_button = document.getElementById("searchbar-button");
    posts_element = document.getElementsByClassName("posts")[0];

    addPostTypes();
    sortPostArray();
    addAllPosts();
    post_types.addEventListener("change", filterPosts);
    date_asc.addEventListener("change", filterPosts);
    date_desc.addEventListener("change", filterPosts);
    searchbar.addEventListener("keypress", function(event){
        if(event.key === "Enter") searchPosts();
    })

    window.addEventListener("load", () => {
        window.scrollTo(0, 0);
    });

})

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

function addPostTypes(){
    let types = getValues("Type");
    for(let type of types){
        let option = document.createElement("option")
        option.value = type;
        option.textContent = type;
        post_types.append(option);
    }
}

function createPost(post){
    let new_post = document.createElement("div");
    new_post.className = "post";
    new_post.innerHTML = 
    `
    <img src="${post["img"]}" alt="Bilde (${post["Title"]})">
    <div class="post-description">
        <h3>${post["Title"]}</h3>
        <p>${post["Description"]}</p>
    </div>
    <table class="post-info">
    <tr>
        <td>Publicēts </td>
        <td>${post["Published"]}</td>
    </tr>
    <tr>
        <td>Publikācija </td>
        <td>${post["Type"]}</td>
    </tr>
    </table>
    <p id="read"><a href="${post["pdf"]}">Lasīt..</a></p>
    `
    return new_post;
}

function sortPostArray(){
    running_posts_arr.sort(function(a, b){
        let date_a = new Date(a.Published);
        let date_b = new Date(b.Published);
        if(date_asc.checked) return date_b-date_a;
        else return date_a-date_b;
    });
}

function addAllPosts(){
    for(let post of running_posts_arr){
        let new_post = createPost(post);
        posts_element.append(new_post);
    }
}

function removeAllPosts(){
    posts_element.innerHTML = "";
}

function filterPosts(){
    let post_type_values = "";
    for(let option of post_types.selectedOptions) post_type_values += option.value;
    
    running_posts_arr = [];
    if(post_type_values.includes("default-value") || post_type_values === ""){
        running_posts_arr = posts;
    }else{
        for(let post of posts){
        let post_types = post["Type"].split(",").map(t => t.trim());
        for(let post_type of post_types){
            if(post_type_values.includes(post_type) && !running_posts_arr.includes(post)) running_posts_arr.push(post);
        }
    }
    }

    searchPosts();
    sortPostArray();
    removeAllPosts();
    addAllPosts();
}

function searchPosts(){
    let filtered_posts = [];
    let searchbar_value = searchbar.value.toLowerCase();
    let post_type_values = "";
    for(let option of post_types.selectedOptions) post_type_values += option.value;
    for(let post of posts){
        let title = post["Title"].toLowerCase();
        let description = post["Description"].toLowerCase();
        let post_types = post["Type"].split(",").map(t => t.trim());
        let post_type_match = false;
        if(post_type_values === "" || post_type_values.includes("default-value")) post_type_match = true;
        for(let post_type of post_types){
            if(post_type_values.includes(post_type)) post_type_match = true;
        }
        let search_match = (title.includes(searchbar_value) || description.includes(searchbar_value));
        if(searchbar_value === "") search_match = true;
        if(post_type_match && search_match) filtered_posts.push(post);
    }
    running_posts_arr = filtered_posts;
    sortPostArray();
    removeAllPosts();
    addAllPosts();
}