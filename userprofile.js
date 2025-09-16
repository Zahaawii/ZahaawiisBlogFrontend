const urlParameter = new URLSearchParams(location.search);
const username = urlParameter.get("id");
const form = document.querySelector(".login");
const userprofilBlogecontainer = document.getElementById('userprofilecontainer');
const userprofileInfo = document.getElementById('userprofileinfo');
const deleteCommentsUrl = "http://localhost:8080/api/v1/comments/delete/"
const deleteBlogUrl = 'http://localhost:8080/api/v1/blog/deletepost/'
const loginUrl = "http://localhost:8080/api/v1/users/auth/login";



function getToken() {
    return sessionStorage.getItem("accessToken");
}

function getUsernameByToken() {
    return sessionStorage.getItem("username");
}



function createUserprofileBlogBox(blog) {
    return `

                <article class="post" data-blog-id="${blog.blogId}" id="${blog.blogId}">
                    <header class="post-header">
                        <h2 class="post-title"> ${blog.subject} </h2>
                        <time class="post-date"> ${blog.publishDate} </time>
                    </header>
                    <i onclick="deleteBlog(${blog.blogId})" style="cursor: pointer;" class="fa-solid fa-trash"></i>


                    <div class="post-body">
                        <pre> ${blog.body} </pre>
                    </div>
                    <footer class="post-footer">
                        <nav class="post-actions">
                            <button class="abtn btn-ghost"><i class="fa-regular fa-thumbs-up"></i></button>
                            <button class="abtn btn-ghost"><i class="fa-regular fa-comments"></i></button>
                            <button class="abtn btn-ghost"><i class="fa-regular fa-share-from-square"></i></button>
                        </nav>
                        <div class="post-comments"></div>

                        <form class="post-add-comment">
                            <label class="sr-only" for="comment-input-1"></label>
                            <input id="comment-input-1" type="text" placeholder="Add a comment…" />
                            <button class="btn">Send</button>
                        </form>
                    </footer>
                </article>
            
            `;
}

function createUserProfileBox(box) {
    return `
                <aside class="userprofile-sidebar">
                <img src="images/default.jpeg" alt="profile picture" class="userprofile-avatar">
                <h2 class="userprofile-name"> ${box.name} </h2>
                <p class="userprofile-bio">This is the user description</p>
                <p class="userprofile-joined">${box.createdDate}</p>

                <div class="userprofile-stats">
                    <div>
                        <span class="stat-label">Post</span>
                        <span class="stat-value"> 25 </span>
                    </div>
                    <div>
                        <span class="stat-label"> Test </span>
                        <span class="stat-value"> 25</span>
                    </div>
                    <div>
                        <span class="stat-label"> Test </span>
                        <span class="stat-value"> 25</span>
                    </div>    
                </div>
            </aside>
            `;
}

fetch("http://localhost:8080/api/v1/blog/getbyusername/" + username)
    .then(res => res.json())
    .then(data => {
        userprofilBlogecontainer.innerHTML = data.map(createUserprofileBlogBox).join('');
        document.querySelectorAll(`.post`).forEach(section => {
            const blogId = section.dataset.blogId;
            const commentsContainer = section.querySelector('.post-comments');

            fetch(`http://localhost:8080/api/v1/comments/getcomment/${blogId}`)
                .then(res => res.json())
                .then(comments => {
                    console.log(comments);
                    if (!comments || comments.length === 0) {
                        commentsContainer.innerHTML = "";
                        return;
                    }
                    commentsContainer.innerHTML = comments
                        .map(c => `<p>${c.username}: <br> ${c.comment}<i onclick="deleteComment(${c.commentId})" style="cursor: pointer;" class="fa-solid fa-trash"></i></p>`)
                        .join('');
                })
                .catch(err => {
                    commentsContainer.innerHTML = `<p> Could not load comments ${err}</p>`;
                    console.error(err);
                });
        })
    })
    .catch(err => {
        userprofilBlogecontainer.innerHTML = '<p>Failed to load blog posts.</p>';
        console.error(err);
    });

fetch("http://localhost:8080/api/v1/users/getuserbyname/" + username)
    .then(res => res.json())
    .then(user => {
        userprofileInfo.querySelector(".userprofile-sidebar")?.remove();

        userprofileInfo.insertAdjacentHTML("afterbegin", createUserProfileBox(user));
    })
    .catch(err => {
        userprofileInfo.innerHTML = '<p>User does not exist.</p>';
        console.error(err);
    });

function deleteComment(id) {
    const token = getToken();
    fetch(deleteCommentsUrl + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(id)
    })
        .then(res => res.text())
        .then(data => {
            console.log("kommentar slettet: " + data)
        })
        .catch(error => console.error("Kunne ikke slette: " + error));
}

function deleteBlog(id) {
    const token = getToken();
    console.log(document.getElementById(id));
    fetch(deleteBlogUrl + id, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(id)
    })
        .then(res => res.text())
        .then(data => {
            document.getElementById(id).remove();
            console.log("Blog post deleted " + data);
        })
        .catch(error => console.error("Kunne ikke slette: " + error));
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const creds = Object.fromEntries(new FormData(form));

    try {
        const res = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(creds)
        });

        if (!res.ok) throw new Error(`Login failed: ${res.status}`);

        const { accessToken, username } = await res.json();
        if (!accessToken) throw new Error("Intet token i respons");

        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("username", username);
        console.log(accessToken);


        if (sessionStorage.getItem("accessToken") != null) {
            console.log(document.querySelector(".navPanel"));
            document.querySelector(".nav-panel").innerHTML = `Welcome to my page ${getUsernameByToken()}`;
            document.querySelector(".nav-panel-userprofile").style.visibility = "visible";
            const test = document.querySelector(".nav-panel");
            test.classList.add("nav-panelLoggedin");
        }
    } catch (err) {
        console.log(err);
    }
});

window.addEventListener("load", () => {
    const token = sessionStorage.getItem("accessToken");
    const name = sessionStorage.getItem("username");
    if (token) {
        console.log("User already logged in");
        document.querySelector(".nav-panel").innerHTML = `<a href="userprofile.html?id=${name}" target="_blank"> <img src="images/${name}.jpeg"></a>`;
        document.querySelector(".nav-panel-userprofile").style.visibility = "visible";


    }
});

function submitForm() {

    const formEl = document.querySelector('.createblogpost');

    formEl.addEventListener('button', event => {
        event.preventDefault();

        const token = getToken()
        if (!token) throw new Error("Du er ikke logget ind")
        const formData = new FormData(formEl);
        formData.set('publishDate', date);
        const data = Object.fromEntries(formData);

        fetch(saveblogUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(error => console.log(error))
    });
};


