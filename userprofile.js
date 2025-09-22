const urlParameter = new URLSearchParams(location.search);
const username = urlParameter.get("id");
const form = document.querySelector(".login");
const navCenter = document.querySelector(".nav-center");
var date = new Date().toISOString().slice(0, 10);
const userPanel = document.querySelector(".user-panel");
const avatarLink = document.querySelector(".avatar-link");
const avatarImg = document.querySelector(".avatar");
const popupEl = document.querySelector('#popup');
const formEl = document.querySelector('.createblogpost');
const openBtn = document.querySelector('[data-open="post"]');
const closeBtn = popupEl?.querySelector('[data-close]');
const submitBtn = formEl?.querySelector('[type="submit"]');
const logoutBtn = document.querySelector(".logout");
const userprofilBlogecontainer = document.getElementById('userprofilecontainer');
const userprofileInfo = document.getElementById('userprofileinfo');
const createBlogPostBtn = document.querySelector('.btn');
const deleteCommentsUrl = "http://localhost:8080/api/v1/comments/delete/"
const deleteBlogUrl = 'http://localhost:8080/api/v1/blog/deletepost/'
const loginUrl = "http://localhost:8080/api/v1/users/auth/login";
const saveblogUrl = 'http://localhost:8080/api/v1/blog/saveblogpost';



window.addEventListener("load", () => {
    const token = localStorage.getItem("accessToken");
    const name = localStorage.getItem("username");
    if (token) {
        console.log("User already logged in");
    }
});

fetch("http://localhost:8080/api/v1/blog/getbyusername/" + username)
    .then(res => res.json())
    .then(data => {
        userprofilBlogecontainer.innerHTML = data.map(createUserprofileBlogBox).join('');
        document.querySelectorAll(`.post`).forEach(section => {
            const blogId = section.dataset.blogId;
            const commentsContainer = section.querySelector('.post-comments');
            console.log(data);

            fetch(`http://localhost:8080/api/v1/comments/getcomment/${blogId}`)
                .then(res => res.json())
                .then(comments => {
                    console.log(comments);
                    if (!comments || comments.length === 0) {
                        commentsContainer.innerHTML = "";
                        return;
                    }
                    commentsContainer.innerHTML = comments
                        .map(c => `<p>${c.username}: <br> ${c.comment}
                            ${c.username ===
                        getUsernameByToken() ? `<i onclick="deleteComment(${c.commentId})" 
                            style="cursor: pointer;" class="fa-solid fa-trash"></i></p>` : ""}
                            `)
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



function getToken() {
    return localStorage.getItem("accessToken");
}

function getUsernameByToken() {
    return localStorage.getItem("username");
}

function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    form?.reset();
    renderAfterAuth();
}

logoutBtn?.addEventListener("click", logout);

function deleteComment(id) {
    confirm("Are you sure?");
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
    confirm("Are you sure?");
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

form?.addEventListener("submit", async (event) => {
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

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("username", username);
        renderAfterAuth();
    } catch (err) {
        console.log(err);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    renderAfterAuth();
});

window.addEventListener("storage", (e) => {
    if (e.key === "accessToken" || e.key === "username") {
        renderAfterAuth();
    }
});

function renderAfterAuth() {
    const token = getToken();
    const name = getUsernameByToken();

    const isLoggedIn = Boolean(token && name);

    if (token && name) {
        if (form) form.style.display = "none";
        if (userPanel) userPanel.style.display = "flex";

        if (avatarLink) {
            avatarLink.href = `userprofile.html?id=${encodeURIComponent(name)}`;
        }
        if (avatarImg) {
            avatarImg.src = `images/${encodeURIComponent(name)}.jpeg`;
            avatarImg.alt = name;
        }

        if (navCenter) navCenter.style.visibility = "visible";
    } else {
        if (form) form.style.display = "flex";
        if (userPanel) userPanel.style.display = "none";
        if (navCenter) navCenter.style.visibility = "hidden";
        if(createBlogPostBtn) createBlogPostBtn.style.display = "none";
    }
}

function createUserprofileBlogBox(blog) {
    return `

                <article class="post" data-blog-id="${blog.blogId}" id="${blog.blogId}">
                    <header class="post-header">
                        <h2 class="post-title"> ${blog.subject} </h2>
                        <time class="post-date"> ${blog.publishDate} </time>
                    </header>
                ${blog.author?.name === getUsernameByToken() ? `<i onclick="deleteBlog(${blog.blogId})" 
                style="cursor: pointer;" 
                class="fa-solid fa-trash"></i>` : ""}

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

                    
                        ${getToken() !== null ? `
                        <form class="post-add-comment">
                            <label class="sr-only" for="comment-input-1"></label>
                            <input id="comment-input-1" type="text" placeholder="Add a comment…" />
                            <button class="btn">Send</button>
                        </form>` : "" }
                    </footer>
                </article>
            
            `;
}

function createUserProfileBox(box) {
    return `
                <aside class="userprofile-sidebar">
                <img src="images/${box.imgPath || 'default.jpeg'}" alt="profile picture" class="userprofile-avatar">
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

function openPopup() {
    if (!popupEl) return;
    popupEl.classList.add('active');
    document.addEventListener('keydown', escHandler);
}

function closePopup() {
    if (!popupEl) return;
    popupEl.classList.remove('active');
    document.removeEventListener('keydown', escHandler);
    formEl?.reset(); // ryd felter når popup lukkes
}

function escHandler(e) {
    if (e.key === 'Escape') closePopup();
}

openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openPopup();
});

closeBtn?.addEventListener('click', () => closePopup());

formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const token = getToken();
        if (!token) throw new Error('Du er ikke logget ind');

        const fd = new FormData(formEl);
        fd.set('publishDate', date); // din eksisterende date-variabel
        const payload = Object.fromEntries(fd);

        const res = await fetch(saveblogUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            // læs fejl som tekst (kun én gang!)
            const msg = await res.text();
            throw new Error(msg || `Fejl: ${res.status}`);
        }

        const data = await res.json();
        console.log('Gemte:', data);

        // succes → luk popup
        closePopup();

    } catch (err) {
        console.error(err);
        alert(err.message || 'Noget gik galt');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create blog post';
    }
});