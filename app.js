const statusEl = document.getElementById("status");
const uploadPost = document.querySelector(".submit-btn");
const form = document.querySelector(".login");
const navCenter = document.querySelector(".nav-center");
const userPanel = document.querySelector(".user-panel");
const avatarLink = document.querySelector(".avatar-link");
const avatarImg = document.querySelector(".avatar");
const logoutBtn  = document.querySelector(".logout");
const popupEl   = document.querySelector('#popup');            // popup container
const formEl    = document.querySelector('.createblogpost');   // formularen
const openBtn   = document.querySelector('[data-open="post"]');// åbn-knap
const closeBtn  = popupEl?.querySelector('[data-close]');      // luk-knap (x)
const submitBtn = formEl?.querySelector('[type="submit"]');
const saveblogUrl = 'http://localhost:8080/api/v1/blog/saveblogpost';
const loginUrl = "http://localhost:8080/api/v1/users/auth/login";
const getAllBlogPostUrl = 'http://localhost:8080/api/v1/blog/getallblogpost'
const createUser = "http://localhost:8080/api/v1/users/createuser"
const findCommentsUrl = "http://localhost:8080/api/v1/comments/getcomment/"
const addCommentsUrl = "http://localhost:8080/api/v1/comments/addcomment"
const deleteCommentsUrl = "http://localhost:8080/api/v1/comments/delete/"
const deleteBlogUrl = 'http://localhost:8080/api/v1/blog/deletepost/'



logoutBtn?.addEventListener("click", logout);


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
    if(e.key === "accessToken" || e.key === "username") {
        renderAfterAuth();
    }
});

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

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("username", username);
        console.log(accessToken);


        if (localStorage.getItem("accessToken") != null) {
            console.log(document.querySelector(".navPanel"));
            document.querySelector(".nav-panel").innerHTML = `Welcome to my page ${getUsernameByToken()}`;
            const test = document.querySelector(".nav-panel");
            test.classList.add("nav-panelLoggedin");
        }
    } catch (err) {
        console.log(err);
    }
});

window.addEventListener("load", () => {
    const token = localStorage.getItem("accessToken");
    const name = localStorage.getItem("username");
    if (token) {
        console.log("User already logged in");
        //document.querySelector(".nav-panel").innerHTML = `<a href="userprofile.html?id=${name}" target="_blank"> <img src="images/${name}.jpeg"></a>`;
    }
});


function getToken() {
    return localStorage.getItem("accessToken");
}

function getUsernameByToken() {
    return localStorage.getItem("username");
}

function logout() {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("username");
    form?.reset();
    renderAfterAuth();
}


function renderAfterAuth() {
    const token = getToken();
    const name = getUsernameByToken();

    const isLoggedIn = Boolean(token && name);
    
    if(token && name) {
        if(form) form.style.display = "none";
        if(userPanel) userPanel.style.display = "flex";

        if(avatarLink) {
            avatarLink.href = `userprofile.html?id=${encodeURIComponent(name)}`;
        }
        if(avatarImg) {
            avatarImg.src = `images/${encodeURIComponent(name)}.jpeg`;
            avatarImg.alt = name;
        }

        if(navCenter) navCenter.style.visibility = "visible"; 
    } else {
        if(form) form.style.display = "flex";
        if(userPanel) userPanel.style.display = "none";
        if(navCenter) navCenter.style.visibility = "hidden";
    }
}


const container = document.getElementById('blog-posts-container');
var date = new Date().toISOString().slice(0, 10);

function createBlogBox(blog) {
    return `
    <div class="blog-section" data-blog-id="${blog.blogId}" id="${blog.blogId}">
        <div class="blog-box">
            <div class="blog-userInfo-logo">
                <a href="userprofile.html?id=${blog.author?.name}" target="_blank"> <img src="images/${blog.author?.imgPath || 'default.jpeg'}"></a>
                <p>${blog.author?.name || 'Unknown'}</p>
                <i onclick="deleteBlog(${blog.blogId})" style="cursor: pointer;" class="fa-solid fa-trash"></i>

            </div>
            <div class="blog-post-subject">
                <h2>${blog.subject}</h2>
                <p>${blog.publishDate || ""}</p>
            </div>
            <div class="blog-post-body">
                <pre>${blog.body}</pre>
            </div>
            <div class="blog-interaction">
                <div class="blog-likes-section">
                    <ul>
                        <li><a href="#" class="interaction"><i class="fa-regular fa-thumbs-up"></i></a></li>
                        <li><a href="#" class="interaction"><i class="fa-regular fa-comments"></i></a></li>
                        <li><a href="#" class="interaction"><i class="fa-regular fa-share-from-square"></i></a></li>
                    </ul>
                </div>
                <div class="blog-see-all-comments"></div>
                <div class="blog-add-comments">
                            <form class="post-add-comment" data-blog-id="${blog.blogId}">
                            <label class="sr-only" for="comment-input-${blog.blogId}"></label>
                            <input class="comment-input" 
                            name="comment" 
                            id="comment-input-${blog.blogId}" 
                            type="text" 
                            placeholder="Add a comment…" />
                            <button class="btn" type="submit" id="add-comment">Send</button>
                        </form>
                </div>
            </div>
        </div>
    </div>
    `;
}

fetch(getAllBlogPostUrl)
    .then(res => res.json())
    .then(data => {
        console.log(data);
  
        container.innerHTML = data.map(createBlogBox).join('');

        document.querySelectorAll('.blog-section').forEach(section => {
            const blogId = section.dataset.blogId;
            const commentsContainer = section.querySelector('.blog-see-all-comments');

            fetch(`${findCommentsUrl}${blogId}`)
                .then(res => res.json())
                .then(comments => {
                    if (!comments || comments.length === 0) {
                        commentsContainer.innerHTML = "";
                        return;
                    }
                    commentsContainer.innerHTML = comments
                        .map(c => `<p>${c.username}: <br> ${c.comment}<i onclick="deleteComment(${c.commentId})" style="cursor: pointer;" class="fa-solid fa-trash"></i></p>`)
                        .join('');
                        console.log(comments);
                })
                .catch(err => {
                    commentsContainer.innerHTML = `<p> Could not load comments </p>`
                    console.error(err);
                }
                )
        });
        document.querySelectorAll('.post-add-comment').forEach(form => {
            form.addEventListener('submit', addComment);

            const input = form.querySelector('.comment-input');
            if (!input) {
                console.error("Input field not found");
                return;
            }
            input.addEventListener('keydown', function (event) {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    form.requestSubmit();
                }
            });
        });
    })
    .catch(err => {
        container.innerHTML = `<p>Failed to load blog posts ${err}.</p>`;
        console.error(err);
    });

document.querySelector(".btn").addEventListener("click", function () {
    document.querySelector(".popup").classList.add("active");
});
document.querySelector(".popup .close-btn").addEventListener("click", function () {
    document.querySelector(".popup").classList.remove("active");
});

function deleteComment(id) {
    confirm("Are you sure?")
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
    confirm("Are you sure?")
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

function addComment(event) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('.comment-input');
    const commentsToSend = input.value.trim();
    const token = getToken();

    if (!token) {
        alert("Du er ikke logget ind, så du kan ikke kommenterer");
        return;
    }

    if (!commentsToSend) {
        alert("Kommentaren kan ikke være tom");
        return;
    }

    const blogId = form.dataset.blogId;
    const userId = null;

    const send = {
        comment: commentsToSend,
        blogId: parseInt(blogId),
        userId: userId,
        date: date
    };

    fetch(addCommentsUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(send)
    })
        .then(res => res.json())
        .then(data => {
            console.log("Kommentar tilføjes: ", data);
            input.value = "";
        })
        .catch(error => console.error("fejl ved kommentar: ", error));
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